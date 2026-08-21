import { BACKEND_HTTP } from "../config/api";


// =====================================================
// REQUEST HELPER
// =====================================================

async function request(url, options = {}) {

  const response = await fetch(
    `${BACKEND_HTTP}${url}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  );


  if (!response.ok) {

    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`
    );

  }


  return response.json();

}


// =====================================================
// VEHICLE API
// =====================================================

export const vehicleApi = {


  // ===================================================
  // VEHICLE DETAILS
  // ===================================================

  getDetails() {

    return request(
      "/api/vehicle/details"
    );

  },


  // ===================================================
  // TRIPS
  // ===================================================

  getTrips(options = {}) {

    const {
      period,
      from,
      to,
      pageSize = 50,
    } = options;


    const params =
      new URLSearchParams();


    params.set(
      "pageSize",
      pageSize
    );


    if (from && to) {

      params.set(
        "from",
        from
      );

      params.set(
        "to",
        to
      );

    } else {

      params.set(
        "period",
        period || "week"
      );

    }


    return request(
      `/api/vehicle/trips?${params.toString()}`
    );

  },


  // ===================================================
  // TRIP STATISTICS
  // ===================================================

  getTripStats(options = {}) {

    const {
      period,
      from,
      to,
    } = options;


    const params =
      new URLSearchParams();


    if (from && to) {

      params.set(
        "from",
        from
      );

      params.set(
        "to",
        to
      );

    } else {

      params.set(
        "period",
        period || "week"
      );

    }


    return request(
      `/api/vehicle/trip-stats?${params.toString()}`
    );

  },


  // ===================================================
  // ALERTS
  // ===================================================

  getAlerts(
    page = 1,
    pageSize = 20
  ) {

    return request(
      `/api/vehicle/alerts?page=${page}&pageSize=${pageSize}`
    );

  },


  // ===================================================
  // GEOCODING
  // ===================================================

  geocode(lat, lng) {

    return request(
      "/api/vehicle/geocode",
      {
        method: "POST",

        body: JSON.stringify({
          lat,
          lng,
        }),
      }
    );

  },


  // ===================================================
  // GEOFENCES
  // ===================================================


  // ---------------------------------------------------
  // GET ALL GEOFENCES FOR A VEHICLE
  // ---------------------------------------------------

  getGeofences(vehicleId) {

    if (!vehicleId) {

      throw new Error(
        "Vehicle ID is required to fetch geofences."
      );

    }


    return request(
      `/api/vehicle/geofence?vehicleId=${encodeURIComponent(
        vehicleId
      )}`
    );

  },


  // ---------------------------------------------------
  // UPDATE A GEOFENCE
  // ---------------------------------------------------
  updateGeofence(geofence) {

    if (!geofence?.geofenceId) {

      throw new Error(
        "Geofence ID is required."
      );

    }


    return request(
      "/api/vehicle/geofence/update",
      {
        method: "POST",

        body: JSON.stringify({

          geofenceId:
            geofence.geofenceId,

          name:
            geofence.name,

          latitude:
            geofence.lat,

          longitude:
            geofence.lng,

          radius:
            Number(geofence.radius),

          notify: {
            entry:
              Boolean(
                geofence.notify?.entry
              ),

            exit:
              Boolean(
                geofence.notify?.exit
              ),
          },

        }),
      }
    );

  },

};