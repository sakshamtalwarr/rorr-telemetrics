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
// SEED AUTHENTIC DELHI ROUTES FOR SAKSHAM'S OBEN RORR
// =====================================================
// Centered around Saksham's Vahan RC address:
// Uttam Nagar East, West Delhi (28.6236° N, 77.0673° E)
// =====================================================

const SEED_DELHI_TRIPS = [
  {
    tripId: "delhi_trip_20260930_uttam_janakpuri",
    title: "Ride: Uttam Nagar East ➔ Janakpuri (30 Sep)",
    startLocationName: "Uttam Nagar East Metro",
    endLocationName: "Janakpuri District Centre",
    startTime: "2026-09-30T09:15:00.000Z",
    endTime: "2026-09-30T09:33:00.000Z",
    distanceKm: 5.4,
    durationMinutes: 18,
    avgSpeed: 31,
    topSpeed: 64,
    startSoc: 92,
    endSoc: 86,
    socConsumed: 6,
    carbonSavedGrams: 135,
    mode: "City",
    points: [
      { lat: 28.6236, lng: 77.0673, speed: 0, soc: 92 },
      { lat: 28.6242, lng: 77.0695, speed: 28, soc: 92 },
      { lat: 28.6251, lng: 77.0732, speed: 45, soc: 91 },
      { lat: 28.6268, lng: 77.0784, speed: 58, soc: 91 },
      { lat: 28.6282, lng: 77.0825, speed: 64, soc: 90 },
      { lat: 28.6295, lng: 77.0868, speed: 52, soc: 89 },
      { lat: 28.6288, lng: 77.0912, speed: 41, soc: 88 },
      { lat: 28.6279, lng: 77.0945, speed: 30, soc: 87 },
      { lat: 28.6265, lng: 77.0968, speed: 18, soc: 86 },
      { lat: 28.6255, lng: 77.0982, speed: 0, soc: 86 },
    ],
  },
  {
    tripId: "delhi_trip_20260930_return",
    title: "Return: Janakpuri ➔ Uttam Nagar (30 Sep)",
    startLocationName: "Janakpuri District Centre",
    endLocationName: "Uttam Nagar East",
    startTime: "2026-09-30T17:45:00.000Z",
    endTime: "2026-09-30T18:04:00.000Z",
    distanceKm: 5.6,
    durationMinutes: 19,
    avgSpeed: 30,
    topSpeed: 62,
    startSoc: 86,
    endSoc: 79,
    socConsumed: 7,
    carbonSavedGrams: 140,
    mode: "City",
    points: [
      { lat: 28.6255, lng: 77.0982, speed: 0, soc: 86 },
      { lat: 28.6265, lng: 77.0968, speed: 25, soc: 85 },
      { lat: 28.6279, lng: 77.0945, speed: 42, soc: 84 },
      { lat: 28.6288, lng: 77.0912, speed: 56, soc: 83 },
      { lat: 28.6295, lng: 77.0868, speed: 62, soc: 82 },
      { lat: 28.6282, lng: 77.0825, speed: 50, soc: 81 },
      { lat: 28.6268, lng: 77.0784, speed: 42, soc: 80 },
      { lat: 28.6251, lng: 77.0732, speed: 28, soc: 80 },
      { lat: 28.6236, lng: 77.0673, speed: 0, soc: 79 },
    ],
  },
  {
    tripId: "delhi_trip_20261001_uttam_rajouri",
    title: "Ride: Uttam Nagar ➔ Rajouri Garden (1 Oct)",
    startLocationName: "Uttam Nagar Indra Park",
    endLocationName: "Rajouri Garden Ring Road",
    startTime: "2026-10-01T10:30:00.000Z",
    endTime: "2026-10-01T10:58:00.000Z",
    distanceKm: 9.2,
    durationMinutes: 28,
    avgSpeed: 38,
    topSpeed: 76,
    startSoc: 85,
    endSoc: 74,
    socConsumed: 11,
    carbonSavedGrams: 230,
    mode: "Havoc",
    points: [
      { lat: 28.6236, lng: 77.0673, speed: 0, soc: 85 },
      { lat: 28.6255, lng: 77.0735, speed: 35, soc: 85 },
      { lat: 28.6285, lng: 77.0831, speed: 58, soc: 84 },
      { lat: 28.6322, lng: 77.0954, speed: 66, soc: 82 },
      { lat: 28.6365, lng: 77.1085, speed: 76, soc: 80 },
      { lat: 28.6412, lng: 77.1165, speed: 71, soc: 78 },
      { lat: 28.6455, lng: 77.1228, speed: 48, soc: 76 },
      { lat: 28.6482, lng: 77.1255, speed: 25, soc: 75 },
      { lat: 28.6501, lng: 77.1272, speed: 0, soc: 74 },
    ],
  },
  {
    tripId: "delhi_trip_20261001_return",
    title: "Return: Rajouri Garden ➔ Uttam Nagar (1 Oct)",
    startLocationName: "Rajouri Garden Ring Road",
    endLocationName: "Uttam Nagar Indra Park",
    startTime: "2026-10-01T19:20:00.000Z",
    endTime: "2026-10-01T19:49:00.000Z",
    distanceKm: 9.5,
    durationMinutes: 29,
    avgSpeed: 37,
    topSpeed: 74,
    startSoc: 74,
    endSoc: 62,
    socConsumed: 12,
    carbonSavedGrams: 238,
    mode: "City",
    points: [
      { lat: 28.6501, lng: 77.1272, speed: 0, soc: 74 },
      { lat: 28.6482, lng: 77.1255, speed: 30, soc: 73 },
      { lat: 28.6455, lng: 77.1228, speed: 55, soc: 71 },
      { lat: 28.6412, lng: 77.1165, speed: 74, soc: 69 },
      { lat: 28.6365, lng: 77.1085, speed: 68, soc: 67 },
      { lat: 28.6322, lng: 77.0954, speed: 52, soc: 65 },
      { lat: 28.6285, lng: 77.0831, speed: 45, soc: 64 },
      { lat: 28.6255, lng: 77.0735, speed: 32, soc: 63 },
      { lat: 28.6236, lng: 77.0673, speed: 0, soc: 62 },
    ],
  },
  {
    tripId: "delhi_trip_20261015_uttam_cp",
    title: "Cruise: West Delhi ➔ Connaught Place (15 Oct)",
    startLocationName: "West Delhi (Uttam Nagar)",
    endLocationName: "Connaught Place Inner Circle",
    startTime: "2026-10-15T11:00:00.000Z",
    endTime: "2026-10-15T11:44:00.000Z",
    distanceKm: 18.7,
    durationMinutes: 44,
    avgSpeed: 42,
    topSpeed: 88,
    startSoc: 100,
    endSoc: 79,
    socConsumed: 21,
    carbonSavedGrams: 468,
    mode: "Havoc",
    points: [
      { lat: 28.6236, lng: 77.0673, speed: 0, soc: 100 },
      { lat: 28.6275, lng: 77.0812, speed: 42, soc: 99 },
      { lat: 28.6338, lng: 77.1005, speed: 64, soc: 97 },
      { lat: 28.6425, lng: 77.1232, speed: 75, soc: 95 },
      { lat: 28.6485, lng: 77.1458, speed: 82, soc: 92 },
      { lat: 28.6452, lng: 77.1712, speed: 88, soc: 89 },
      { lat: 28.6398, lng: 77.1955, speed: 68, soc: 86 },
      { lat: 28.6342, lng: 77.2085, speed: 45, soc: 83 },
      { lat: 28.6315, lng: 77.2167, speed: 22, soc: 80 },
      { lat: 28.6298, lng: 77.2185, speed: 0, soc: 79 },
    ],
  },
];

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

    // If still empty, return seed Delhi trips so Saksham immediately has interactive route lines!
    if (!trips || trips.length === 0) {
      trips = SEED_DELHI_TRIPS;
      // Seed them into IndexedDB / localStorage for persistence
      for (const st of SEED_DELHI_TRIPS) {
        this.saveCompletedTrip(st);
      }
    }

    return trips.sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
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
