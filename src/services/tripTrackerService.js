// =====================================================
// TRIP TRACKER & ROUTE LOGGER SERVICE
// =====================================================
// Automatically detects when the Oben Rorr starts riding,
// logs GPS breadcrumbs, calculates ride metrics, and persists
// completed trips with point-to-point route polylines.
// =====================================================

import { vehicleApi } from "./vehicleApi";

const DB_NAME = "rorr_trips_db";
const DB_VERSION = 1;
const STORE_NAME = "trips";
const ACTIVE_TRIP_KEY = "rorr_active_trip_cache";
const LOCAL_STORAGE_BACKUP_KEY = "rorr_recorded_trips_backup";

// =====================================================
// HAVERSINE DISTANCE HELPER (KM)
// =====================================================

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lon1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lon2)
  ) {
    return 0;
  }

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// =====================================================
// INDEXEDDB PROMISE HELPER
// =====================================================

function openTripDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "tripId" });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => {
      console.warn("⚠️ IndexedDB trip store error:", event.target.error);
      resolve(null);
    };
  });
}

// =====================================================
// REAL TRIP TRACKING - SAKSHAM'S OBEN RORR (DL8EV2219)
// =====================================================
// Real telemetry trips logged during active riding sessions
// or fetched directly from Oben Argus Cloud APIs.
// =====================================================

export const SEED_DELHI_TRIPS = [];

// =====================================================
// TRIP TRACKER CLASS
// =====================================================

class TripTrackerService {
  constructor() {
    this.activeTrip = null;
    this.parkedTimer = null;
    this.listeners = new Set();
    this.loadActiveTripFromCache();
  }

  loadActiveTripFromCache() {
    try {
      const cached = localStorage.getItem(ACTIVE_TRIP_KEY);
      if (cached) {
        this.activeTrip = JSON.parse(cached);
      }
    } catch (e) {
      console.warn("Could not read active trip cache:", e);
    }
  }

  saveActiveTripToCache() {
    try {
      if (this.activeTrip) {
        localStorage.setItem(ACTIVE_TRIP_KEY, JSON.stringify(this.activeTrip));
      } else {
        localStorage.removeItem(ACTIVE_TRIP_KEY);
      }
    } catch (e) {
      console.warn("Could not write active trip cache:", e);
    }
  }

  getInitialTrips() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const cached = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Purge any legacy mock trips
            return parsed.filter(
              (t) =>
                !t.tripId?.startsWith("delhi_trip_") &&
                !t.tripId?.startsWith("oben_trip_bengaluru")
            );
          }
        }
      }
    } catch (e) {
      console.warn("Could not read initial trips from backup:", e);
    }
    return [];
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, data) {
    this.listeners.forEach((listener) => {
      try {
        listener(event, data);
      } catch (err) {
        console.error("Listener error in TripTrackerService:", err);
      }
    });
  }

  // =====================================================
  // INGEST TELEMETRY TO DETECT RIDES
  // =====================================================

  processTelemetry(data) {
    if (!data) return;

    const lat = Number(data.latitude);
    const lng = Number(data.longitude);
    const speed = Number(data.speed) || 0;
    const soc = Number(data.soc ?? data.SOC) || 0;
    const odometer = Number(data.odometer) || 0;
    const ignition = Boolean(data.ignition ?? data.ignitionStatus);

    const hasValidGps =
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat !== 0 &&
      lng !== 0;

    // Condition 1: Bike is active (Ignition ON or moving)
    const isBikeActive = ignition || speed > 2;

    if (isBikeActive) {
      // Clear any pending parked timer
      if (this.parkedTimer) {
        clearTimeout(this.parkedTimer);
        this.parkedTimer = null;
      }

      // If no active trip, start a new one!
      if (!this.activeTrip) {
        this.startNewTrip({
          lat: hasValidGps ? lat : null,
          lng: hasValidGps ? lng : null,
          speed,
          soc,
          odometer,
        });
      } else if (hasValidGps) {
        // Append GPS point to ongoing trip
        this.recordPoint({ lat, lng, speed, soc, odometer });
      }
    } else if (this.activeTrip && !isBikeActive) {
      // Bike has parked (Ignition OFF and Speed = 0)
      // Set a 45-second debounce timer before sealing the trip
      // to avoid splitting short stops at traffic lights
      if (!this.parkedTimer) {
        this.parkedTimer = setTimeout(() => {
          this.finishActiveTrip({
            lat: hasValidGps ? lat : null,
            lng: hasValidGps ? lng : null,
            soc,
            odometer,
          });
          this.parkedTimer = null;
        }, 45000);
      }
    }
  }

  // =====================================================
  // START TRIP
  // =====================================================

  startNewTrip({ lat, lng, speed, soc, odometer }) {
    const tripId = `trip_${Date.now()}`;
    const startTime = new Date().toISOString();

    const points = [];
    if (lat !== null && lng !== null) {
      points.push({
        lat,
        lng,
        speed,
        soc,
        timestamp: startTime,
      });
    }

    this.activeTrip = {
      tripId,
      status: "IN_PROGRESS",
      startTime,
      startLocation: lat && lng ? { lat, lng } : null,
      startLocationName: "Current Position",
      startSoc: soc,
      startOdometer: odometer,
      distanceKm: 0,
      topSpeed: speed,
      avgSpeed: speed,
      points,
      lastPointTime: Date.now(),
    };

    this.saveActiveTripToCache();
    this.notify("TRIP_STARTED", this.activeTrip);
    console.log("🏍️ New Oben Rorr Trip started:", tripId);
  }

  // =====================================================
  // RECORD GPS POINT
  // =====================================================

  recordPoint({ lat, lng, speed, soc, odometer }) {
    if (!this.activeTrip) return;

    const points = this.activeTrip.points || [];
    const lastPoint = points.length > 0 ? points[points.length - 1] : null;

    let deltaKm = 0;
    if (lastPoint && lastPoint.lat && lastPoint.lng) {
      deltaKm = calculateDistanceKm(lastPoint.lat, lastPoint.lng, lat, lng);
    }

    // Only record if moved at least 5 meters or 10 seconds elapsed
    const now = Date.now();
    const timeDelta = (now - (this.activeTrip.lastPointTime || 0)) / 1000;

    if (deltaKm >= 0.005 || timeDelta >= 10 || speed > 5) {
      points.push({
        lat,
        lng,
        speed,
        soc,
        timestamp: new Date().toISOString(),
      });

      this.activeTrip.points = points.slice(-800); // Keep max 800 points
      this.activeTrip.distanceKm = Number(
        (this.activeTrip.distanceKm + (deltaKm > 0.002 ? deltaKm : 0)).toFixed(2)
      );
      this.activeTrip.topSpeed = Math.max(this.activeTrip.topSpeed || 0, speed);
      this.activeTrip.lastPointTime = now;

      // Update start location if it was missing initially
      if (!this.activeTrip.startLocation && lat && lng) {
        this.activeTrip.startLocation = { lat, lng };
      }

      this.saveActiveTripToCache();
      this.notify("POINT_RECORDED", this.activeTrip);
    }
  }

  // =====================================================
  // FINISH TRIP
  // =====================================================

  async finishActiveTrip({ lat, lng, soc, odometer }) {
    if (!this.activeTrip) return;

    const trip = this.activeTrip;
    const endTime = new Date().toISOString();

    const startTs = new Date(trip.startTime).getTime();
    const endTs = new Date(endTime).getTime();
    const durationMinutes = Math.max(1, Math.round((endTs - startTs) / 60000));

    // Calculate odometer-based distance if available
    let odoDistance = 0;
    if (odometer && trip.startOdometer && odometer > trip.startOdometer) {
      odoDistance = Number((odometer - trip.startOdometer).toFixed(2));
    }

    const finalDistance = Math.max(trip.distanceKm || 0, odoDistance);
    const avgSpeed =
      durationMinutes > 0
        ? Math.round(finalDistance / (durationMinutes / 60))
        : trip.topSpeed;

    const completedTrip = {
      ...trip,
      status: "COMPLETED",
      endTime,
      endLocation: lat && lng ? { lat, lng } : (trip.points.length > 0 ? { lat: trip.points[trip.points.length - 1].lat, lng: trip.points[trip.points.length - 1].lng } : null),
      endLocationName: "Destination Point",
      endSoc: soc,
      endOdometer: odometer,
      distanceKm: finalDistance,
      durationMinutes,
      avgSpeed: Math.min(trip.topSpeed || 60, Math.max(5, avgSpeed)),
      topSpeed: trip.topSpeed || 0,
      socConsumed: Math.max(0, (trip.startSoc || 0) - soc),
      carbonSavedGrams: Math.round(finalDistance * 25), // 25g CO2/km
    };

    // Save to storage
    await this.saveCompletedTrip(completedTrip);

    this.activeTrip = null;
    this.saveActiveTripToCache();
    this.notify("TRIP_COMPLETED", completedTrip);
    console.log("🏁 Oben Rorr Trip completed & saved:", completedTrip.tripId);
  }

  // =====================================================
  // STORAGE & FETCHING
  // =====================================================

  async saveCompletedTrip(trip) {
    // 1. Save to IndexedDB
    try {
      const db = await openTripDatabase();
      if (db) {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.put(trip);
      }
    } catch (e) {
      console.warn("Could not save trip to IndexedDB:", e);
    }

    // 2. Save to localStorage backup
    try {
      const existing = await this.getAllRecordedTrips();
      const updated = [trip, ...existing.filter((t) => t.tripId !== trip.tripId)];
      localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(updated.slice(0, 30)));
    } catch (e) {
      console.warn("Could not save to localStorage backup:", e);
    }
  }

  async getAllRecordedTrips() {
    let trips = [];

    // Try IndexedDB first
    try {
      const db = await openTripDatabase();
      if (db) {
        trips = await new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, "readonly");
          const store = tx.objectStore(STORE_NAME);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        });
      }
    } catch (e) {
      console.warn("IndexedDB read error:", e);
    }

    // Fallback to localStorage
    if (!trips || trips.length === 0) {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
        if (cached) {
          trips = JSON.parse(cached);
        }
      } catch (e) {
        console.warn("LocalStorage backup read error:", e);
      }
    }

    // Filter out any legacy mock trips so only genuine recorded rides remain
    trips = (trips || []).filter(
      (t) =>
        !t.tripId?.startsWith("delhi_trip_") &&
        !t.tripId?.startsWith("oben_trip_bengaluru")
    );

    return trips.sort(
      (a, b) => new Date(b.startTime || b.timestamp || 0).getTime() - new Date(a.startTime || a.timestamp || 0).getTime()
    );
  }

  // =====================================================
  // FETCH TRIP GPS BREADCRUMBS DIRECTLY FROM OBEN CLOUD
  // =====================================================
  async fetchAndNormalizeCloudTripPath(tripId) {
    if (!tripId) return null;

    try {
      console.log("🌐 Fetching raw GPS breadcrumbs from Oben Cloud for trip:", tripId);
      const response = await vehicleApi.getTripPath(tripId);
      const rawData = response?.data?.data || response?.data || response;

      // Handle diverse response shapes from Oben Argus API:
      // 1. Array of tuples: [[lat, lng, timestamp, speed], ...]
      // 2. Array of objects: [{ lat, lng, speed, timestamp }, ...] or [{ latitude, longitude, ... }]
      if (Array.isArray(rawData)) {
        const points = rawData
          .map((item) => {
            if (Array.isArray(item)) {
              return {
                lat: Number(item[0]),
                lng: Number(item[1]),
                timestamp: item[2],
                speed: Number(item[3]) || 0,
              };
            } else if (item && typeof item === "object") {
              return {
                lat: Number(item.lat ?? item.latitude),
                lng: Number(item.lng ?? item.longitude),
                speed: Number(item.speed) || 0,
                timestamp: item.timestamp ?? item.createdAt,
              };
            }
            return null;
          })
          .filter(
            (p) =>
              p &&
              Number.isFinite(p.lat) &&
              Number.isFinite(p.lng) &&
              p.lat !== 0 &&
              p.lng !== 0
          );

        if (points.length > 0) {
          console.log(`✅ Loaded ${points.length} GPS breadcrumb points directly from Oben server!`);
          return points;
        }
      }
    } catch (err) {
      console.warn("Could not fetch cloud trip path from Oben server:", err);
    }
    return null;
  }
}

export const tripTracker = new TripTrackerService();
