/**
 * Location and Reverse Geocoding Utilities for Oben Rorr Telemetrics
 * Accurately maps GPS coordinates to Delhi/NCR & Bangalore zones,
 * and formats clean route titles without fake Bangalore fallbacks.
 */

const DELHI_NCR_ZONES = [
  { name: "Connaught Place / Central Delhi", lat: 28.6304, lng: 77.2177, radiusKm: 2.0 },
  { name: "Karol Bagh / Patel Nagar", lat: 28.6517, lng: 77.1906, radiusKm: 1.8 },
  { name: "Rajendra Nagar / Pusa Road", lat: 28.6410, lng: 77.1820, radiusKm: 1.5 },
  { name: "Rohini", lat: 28.7495, lng: 77.0655, radiusKm: 3.0 },
  { name: "Pitampura / NSP", lat: 28.6990, lng: 77.1384, radiusKm: 2.0 },
  { name: "Shalimar Bagh / Ashok Vihar", lat: 28.7165, lng: 77.1650, radiusKm: 2.0 },
  { name: "Model Town / GTB Nagar", lat: 28.7027, lng: 77.1937, radiusKm: 2.0 },
  { name: "Civil Lines / North Delhi", lat: 28.6814, lng: 77.2227, radiusKm: 2.0 },
  { name: "Chandni Chowk / Old Delhi", lat: 28.6506, lng: 77.2303, radiusKm: 1.8 },
  { name: "Dwarka", lat: 28.5921, lng: 77.0460, radiusKm: 3.5 },
  { name: "Janakpuri / West Delhi", lat: 28.6219, lng: 77.0878, radiusKm: 2.2 },
  { name: "Rajouri Garden / Punjabi Bagh", lat: 28.6550, lng: 77.1210, radiusKm: 2.0 },
  { name: "Paschim Vihar", lat: 28.6725, lng: 77.1080, radiusKm: 2.0 },
  { name: "Uttam Nagar / Vikas Puri", lat: 28.6210, lng: 77.0580, radiusKm: 2.0 },
  { name: "Saket / South Delhi", lat: 28.5245, lng: 77.2066, radiusKm: 2.2 },
  { name: "Hauz Khas / Green Park", lat: 28.5535, lng: 77.2045, radiusKm: 1.8 },
  { name: "Malviya Nagar", lat: 28.5300, lng: 77.2080, radiusKm: 2.0 },
  { name: "Lajpat Nagar / Defence Colony", lat: 28.5700, lng: 77.2400, radiusKm: 2.0 },
  { name: "Nehru Place / GK", lat: 28.5481, lng: 77.2514, radiusKm: 2.2 },
  { name: "Vasant Kunj / Aerocity", lat: 28.5380, lng: 77.1350, radiusKm: 2.5 },
  { name: "Laxmi Nagar / Preet Vihar", lat: 28.6309, lng: 77.2773, radiusKm: 2.2 },
  { name: "Mayur Vihar / East Delhi", lat: 28.6096, lng: 77.2974, radiusKm: 2.5 },
  { name: "Noida Sector 18", lat: 28.5708, lng: 77.3261, radiusKm: 2.5 },
  { name: "Noida Sector 62", lat: 28.6280, lng: 77.3649, radiusKm: 3.0 },
  { name: "Greater Noida", lat: 28.4744, lng: 77.5040, radiusKm: 4.0 },
  { name: "Cyber Hub / DLF Gurgaon", lat: 28.4950, lng: 77.0895, radiusKm: 2.5 },
  { name: "Golf Course Road Gurgaon", lat: 28.4595, lng: 77.1025, radiusKm: 3.0 },
  { name: "Sohna Road Gurgaon", lat: 28.4230, lng: 77.0420, radiusKm: 3.5 },
  { name: "Indirapuram / Ghaziabad", lat: 28.6434, lng: 77.3712, radiusKm: 3.0 },
  { name: "Faridabad", lat: 28.4089, lng: 77.3178, radiusKm: 3.5 },
];

const BANGALORE_ZONES = [
  { name: "Kumara Park West", lat: 12.9978, lng: 77.5801, radiusKm: 0.8 },
  { name: "Guttahalli / Vasanth Nagar", lat: 12.9920, lng: 77.5870, radiusKm: 1.0 },
  { name: "Malleshwaram", lat: 13.0048, lng: 77.5808, radiusKm: 1.2 },
  { name: "Rajajinagar", lat: 12.9880, lng: 77.5580, radiusKm: 1.6 },
  { name: "Seshadripuram", lat: 12.9910, lng: 77.5770, radiusKm: 0.9 },
  { name: "Majestic / Gandhinagar", lat: 12.9780, lng: 77.5720, radiusKm: 1.0 },
  { name: "MG Road / Central CBD", lat: 12.9750, lng: 77.6100, radiusKm: 1.4 },
  { name: "Shivajinagar / Cantonment", lat: 12.9880, lng: 77.5960, radiusKm: 1.2 },
  { name: "Domlur / Indiranagar", lat: 12.9580, lng: 77.6490, radiusKm: 1.8 },
  { name: "HAL Airport Road", lat: 12.9600, lng: 77.6620, radiusKm: 1.5 },
  { name: "RT Nagar / Hebbal", lat: 13.0180, lng: 77.5950, radiusKm: 1.6 },
  { name: "Sankey Tank / Sadashivanagar", lat: 13.0080, lng: 77.5750, radiusKm: 1.0 },
  { name: "JP Nagar", lat: 12.9060, lng: 77.5930, radiusKm: 1.8 },
  { name: "Jayanagar", lat: 12.9300, lng: 77.5850, radiusKm: 1.5 },
  { name: "Koramangala", lat: 12.9350, lng: 77.6250, radiusKm: 1.8 },
  { name: "HSR Layout", lat: 12.9120, lng: 77.6440, radiusKm: 1.8 },
  { name: "Basavanagudi", lat: 12.9420, lng: 77.5730, radiusKm: 1.4 },
  { name: "Yeshwanthpur", lat: 13.0220, lng: 77.5500, radiusKm: 1.6 },
];

export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
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

/**
 * Returns human-readable area name from GPS coordinates (Delhi/NCR prioritized, Bangalore supported)
 */
export function getAreaName(lat, lng) {
  let nLat = Number(lat);
  let nLng = Number(lng);

  if (!Number.isFinite(nLat) || !Number.isFinite(nLng) || (nLat === 0 && nLng === 0)) {
    return null;
  }

  // Auto-correct inverted [lng, lat] GeoJSON coordinates for India
  // (India: Lat is ~8° to 38°N, Lng is ~68° to 98°E)
  if (nLat > 60 && nLng < 40) {
    const temp = nLat;
    nLat = nLng;
    nLng = temp;
  }

  // 1. Check Delhi/NCR zones first (primary for DL8EV2219)
  let closestZone = null;
  let minDistance = Infinity;

  for (const zone of DELHI_NCR_ZONES) {
    const dist = haversineKm(nLat, nLng, zone.lat, zone.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestZone = zone;
    }
  }

  if (closestZone && minDistance <= (closestZone.radiusKm || 2.0)) {
    return closestZone.name;
  }
  if (closestZone && minDistance <= 4.0) {
    return `Near ${closestZone.name}`;
  }

  // 2. Check Bangalore zones
  let closestBlr = null;
  let minBlrDist = Infinity;
  for (const zone of BANGALORE_ZONES) {
    const dist = haversineKm(nLat, nLng, zone.lat, zone.lng);
    if (dist < minBlrDist) {
      minBlrDist = dist;
      closestBlr = zone;
    }
  }

  if (closestBlr && minBlrDist <= (closestBlr.radiusKm || 1.5)) {
    return closestBlr.name;
  }
  if (closestBlr && minBlrDist <= 3.5) {
    return `Near ${closestBlr.name}`;
  }

  // 3. Inside Delhi / NCR general bounds (28.1 to 28.9 N, 76.7 to 77.6 E)
  if (nLat >= 28.1 && nLat <= 28.9 && nLng >= 76.7 && nLng <= 77.6) {
    return `Delhi NCR (${nLat.toFixed(3)}°, ${nLng.toFixed(3)}°)`;
  }

  // 4. Inside Bengaluru general bounds
  if (nLat >= 12.7 && nLat <= 13.3 && nLng >= 77.3 && nLng <= 77.9) {
    return `Bengaluru (${nLat.toFixed(3)}°, ${nLng.toFixed(3)}°)`;
  }

  return `${nLat.toFixed(4)}° N, ${nLng.toFixed(4)}° E`;
}

// Backward-compatible alias
export const getBangaloreAreaName = getAreaName;

/**
 * Generates an authentic trip title from trip coordinates & distance
 */
export function getTripRouteTitle(trip) {
  if (!trip) return "Ride Session";

  // If a clean custom title exists and doesn't mention fake defaults
  if (trip.title && !trip.title.includes("Kumara Park") && !trip.title.includes("Bengaluru")) {
    return trip.title;
  }

  let sLat = Number(trip.startLatitude ?? trip.startLocation?.coordinates?.[1] ?? trip.points?.[0]?.lat);
  let sLng = Number(trip.startLongitude ?? trip.startLocation?.coordinates?.[0] ?? trip.points?.[0]?.lng);
  let eLat = Number(trip.endLatitude ?? trip.endLocation?.coordinates?.[1] ?? trip.points?.[trip.points?.length - 1]?.lat);
  let eLng = Number(trip.endLongitude ?? trip.endLocation?.coordinates?.[0] ?? trip.points?.[trip.points?.length - 1]?.lng);

  // Invert check
  if (sLat > 60 && sLng < 40) { const t = sLat; sLat = sLng; sLng = t; }
  if (eLat > 60 && eLng < 40) { const t = eLat; eLat = eLng; eLng = t; }

  const startArea = getAreaName(sLat, sLng);
  const endArea = getAreaName(eLat, eLng);

  const rawDist = trip.tripDistance ?? trip.distanceKm ?? trip.distance ?? 0;
  const distanceKm = Number(rawDist) > 0 ? Number(rawDist).toFixed(1) : null;

  if (startArea && endArea) {
    if (startArea === endArea) {
      return distanceKm ? `${startArea} Ride (${distanceKm} km)` : `${startArea} Ride`;
    }
    return `${startArea} ➔ ${endArea}`;
  }

  if (startArea) {
    return distanceKm ? `${startArea} • ${distanceKm} km` : `${startArea} Ride`;
  }

  if (endArea) {
    return distanceKm ? `Ride to ${endArea} • ${distanceKm} km` : `Ride to ${endArea}`;
  }

  if (distanceKm) {
    return `Ride Session • ${distanceKm} km`;
  }

  return "Ride Session";
}
