/**
 * Road Route Snapping Service for Oben Rorr Telemetrics
 * Converts origin & destination GPS points into realistic road-following driving paths
 * using Open Source Routing Machine (OSRM) with zero API keys required.
 */

const roadCache = new Map();

/**
 * Fetches realistic road geometry following city streets, turns, and highways
 * @param {number} startLat
 * @param {number} startLng
 * @param {number} endLat
 * @param {number} endLng
 * @returns {Promise<Array<[number, number]>>} Array of [latitude, longitude] points
 */
export async function fetchRoadRoute(startLat, startLng, endLat, endLng) {
  if (
    !Number.isFinite(startLat) ||
    !Number.isFinite(startLng) ||
    !Number.isFinite(endLat) ||
    !Number.isFinite(endLng)
  ) {
    return [];
  }

  // If start & end are virtually identical (same parking spot), return single point
  const distDelta = Math.hypot(startLat - endLat, startLng - endLng);
  if (distDelta < 0.0003) {
    return [[startLat, startLng]];
  }

  const cacheKey = `${startLat.toFixed(4)},${startLng.toFixed(4)}->${endLat.toFixed(4)},${endLng.toFixed(4)}`;
  if (roadCache.has(cacheKey)) {
    return roadCache.get(cacheKey);
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSRM responded with status ${response.status}`);
    }

    const data = await response.json();
    if (data.code === "Ok" && data.routes?.[0]?.geometry?.coordinates) {
      // OSRM returns GeoJSON [longitude, latitude], Leaflet needs [latitude, longitude]
      const roadPoints = data.routes[0].geometry.coordinates.map(([lng, lat]) => [
        Number(lat),
        Number(lng),
      ]);

      if (roadPoints.length > 1) {
        roadCache.set(cacheKey, roadPoints);
        return roadPoints;
      }
    }
  } catch (error) {
    console.warn("Road snapping fallback to direct segment:", error);
  }

  // Fallback to direct segment if offline or unreachable
  const fallback = [
    [startLat, startLng],
    [endLat, endLng],
  ];
  roadCache.set(cacheKey, fallback);
  return fallback;
}
