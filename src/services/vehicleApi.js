import { BACKEND_HTTP } from "../config/api";

async function request(url, options = {}) {
  const response = await fetch(`${BACKEND_HTTP}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

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

  // ---------------------------------------------------
  // VEHICLE DETAILS
  // ---------------------------------------------------

  getDetails() {
    return request("/api/vehicle/details");
  },


  // ---------------------------------------------------
  // TRIPS
  // ---------------------------------------------------
  //
  // Examples:
  //
  // getTrips()
  // getTrips({ period: "today" })
  // getTrips({ period: "week" })
  // getTrips({ period: "month" })
  //
  // Custom:
  //
  // getTrips({
  //   from: "2026-08-01",
  //   to: "2026-08-19"
  // })
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // TRIP STATISTICS
  // ---------------------------------------------------
  //
  // Examples:
  //
  // getTripStats({ period: "today" })
  // getTripStats({ period: "week" })
  // getTripStats({ period: "month" })
  //
  // Custom:
  //
  // getTripStats({
  //   from: "2026-08-01",
  //   to: "2026-08-19"
  // })
  // ---------------------------------------------------

  getAlerts(page = 1, pageSize = 20) {
  return request(
    `/api/vehicle/alerts?page=${page}&pageSize=${pageSize}`
  );
},

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


  // ---------------------------------------------------
  // ALERTS
  // ---------------------------------------------------

  getAlerts() {
    return request(
      "/api/vehicle/alerts"
    );
  },


  // ---------------------------------------------------
  // GEOCODING
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // GEOFENCE
  // ---------------------------------------------------

  updateGeofence(
    geofenceId,
    radius
  ) {

    return request(
      "/api/vehicle/geofence/update",
      {
        method: "POST",

        body: JSON.stringify({
          geofenceId,
          radius,
        }),
      }
    );
  },

};