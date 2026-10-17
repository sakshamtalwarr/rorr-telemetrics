/**
 * Location and Reverse Geocoding Utilities for Bengaluru & Oben Rorr Telemetrics
 * Accurately maps GPS coordinates to actual Bangalore neighborhoods and generates real route titles.
 */

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

function haversineKm(lat1, lon1, lat2, lon2) {
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
 * Returns human-readable area name in Bengaluru from GPS coordinates
 */
export function getBangaloreAreaName(lat, lng) {
  const nLat = Number(lat);
  const nLng = Number(lng);

  if (!Number.isFinite(nLat) || !Number.isFinite(nLng) || (nLat === 0 && nLng === 0)) {
    return null;
  }

  let closestZone = null;
  let minDistance = Infinity;

  for (const zone of BANGALORE_ZONES) {
    const dist = haversineKm(nLat, nLng, zone.lat, zone.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestZone = zone;
    }
  }

  if (closestZone && minDistance <= (closestZone.radiusKm || 1.5)) {
    return closestZone.name;
  }

  if (closestZone && minDistance <= 3.5) {
    return `Near ${closestZone.name}`;
  }

  // Inside Karnataka / Bengaluru general bounds
  if (nLat >= 12.7 && nLat <= 13.3 && nLng >= 77.3 && nLng <= 77.9) {
    return `Bengaluru (${nLat.toFixed(3)}°, ${nLng.toFixed(3)}°)`;
  }

  return `${nLat.toFixed(4)}° N, ${nLng.toFixed(4)}° E`;
}

/**
 * Generates an authentic trip title from trip coordinates & distance
 */
export function getTripRouteTitle(trip) {
  if (!trip) return "Ride Session";
  if (trip.title && !trip.title.includes("Kumara Park")) {
    return trip.title;
  }

  const sLat = Number(trip.startLatitude ?? trip.startLocation?.coordinates?.[1] ?? trip.points?.[0]?.lat);
  const sLng = Number(trip.startLongitude ?? trip.startLocation?.coordinates?.[0] ?? trip.points?.[0]?.lng);
  const eLat = Number(trip.endLatitude ?? trip.endLocation?.coordinates?.[1] ?? trip.points?.[trip.points?.length - 1]?.lat);
  const eLng = Number(trip.endLongitude ?? trip.endLocation?.coordinates?.[0] ?? trip.points?.[trip.points?.length - 1]?.lng);

  const startArea = getBangaloreAreaName(sLat, sLng);
  const endArea = getBangaloreAreaName(eLat, eLng);

  const distanceKm = Number(trip.distanceKm ?? trip.tripDistance ?? trip.distance ?? 0);

  if (startArea && endArea) {
    if (startArea === endArea) {
      return `${startArea} Ride`;
    }
    return `${startArea} ➔ ${endArea}`;
  }

  if (startArea) {
    return distanceKm > 0 ? `${startArea} • ${distanceKm} km` : `${startArea} Ride`;
  }

  if (endArea) {
    return distanceKm > 0 ? `Ride to ${endArea} • ${distanceKm} km` : `Ride to ${endArea}`;
  }

  if (distanceKm > 0) {
    return `City Ride • ${distanceKm} km`;
  }

  return "Bengaluru City Ride";
}
