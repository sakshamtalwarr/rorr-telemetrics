import {
  useEffect,
  useRef,
} from "react";

import GlassCard from "../common/GlassCard";
import ErrorBoundary from "../common/ErrorBoundary";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_LAT = 12.9977986667;
const DEFAULT_LNG = 77.5800862667;

const routePolylineColor = "#818cf8";
const routePolylineWeight = 4;
const routePolylineOpacity = 0.75;

export default function TripHistory({
  liveData,
}) {

  const history = liveData?.history || [];
  const routeHistory = liveData?.routeHistory || [];
  const session = liveData?.session || {};

  // =====================================================
  // COMPUTE TRIP STATISTICS
  // =====================================================

  const tripDuration =
    session.startedAt
      ? Math.round(
          (new Date().getTime() - new Date(session.startedAt).getTime()) / 60000
        )
      : 0;

  const totalDistance =
    session.distanceTravelled !== null
      ? session.distanceTravelled
      : 0;

  const maxSpeed = session.maxSpeed || 0;

  const minSoc = session.minSoc !== null ? session.minSoc : 100;
  const maxSoc = session.maxSoc !== null ? session.maxSoc : 0;

  // =====================================================
  // LEAFLET MAP SETUP
  // =====================================================

  const routeCoordinates =
    routeHistory
      .filter(
        (point) =>
          Number.isFinite(point.latitude) && Number.isFinite(point.longitude)
      )
      .map((point) => [point.latitude, point.longitude]);

  const initialLat =
    routeCoordinates.length > 0
      ? routeCoordinates[0][0]
      : DEFAULT_LAT;

  const initialLng =
    routeCoordinates.length > 0
      ? routeCoordinates[0][1]
      : DEFAULT_LNG;

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: initialLat ? [initialLat, initialLng] : [DEFAULT_LAT, DEFAULT_LNG],
      zoom: routeCoordinates.length > 0 ? 14 : 13,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles © Esri - Sources: Esri, HERE, Garmin, FAO, NOAA, USGS",
        maxZoom: 19,
        minZoom: 3,
      }
    ).addTo(map);

    if (routeCoordinates.length > 0) {
      const polyline = L.polyline(routeCoordinates, {
        color: routePolylineColor,
        weight: routePolylineWeight,
        opacity: routePolylineOpacity,
        className: "route-polyline",
      }).addTo(map);

      // Start marker
      L.marker([routeCoordinates[0][0], routeCoordinates[0][1]], {
        icon: L.divIcon({
          className: "route-start-marker",
          html: `
            <div
              style="
                width:32px;
                height:32px;
                border-radius:50%;
                background:rgba(34,197,94,0.2);
                border:2px solid #22c55e;
                display:flex;
                align-items:center;
                justify-content:center;
                box-shadow:0 0 12px rgba(34,197,94,0.5);
              "
            >
              <span
                style="
                  font-size:14px;
                  line-height:1;
                  color:#22c55e;
                ">
                  ▶
              </span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        }),
      }).addTo(map);

      // Finish marker
      if (routeCoordinates.length > 1) {
        const last = routeCoordinates[routeCoordinates.length - 1];
        L.marker([last[0], last[1]], {
          icon: L.divIcon({
            className: "route-finish-marker",
            html: `
              <div
                style="
                  width:32px;
                  height:32px;
                  border-radius:50%;
                  background:rgba(239,68,68,0.2);
                  border:2px solid #f87171;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                "
              >
                <span
                  style="
                    font-size:14px;
                    line-height:1;
                    color:#f87171;
                  ">
                    ✓
                </span>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        }).addTo(map);
      }

      try {
        map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
      } catch {
        // fallback
      }
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [routeCoordinates.length, initialLat, initialLng]);

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <GlassCard
      className="p-6"
      hover={false}
    >

      <div className="space-y-4">

        {/* =================================================
            TRIP STATISTICS
        ================================================= */}

        <div className="grid grid-cols-2 gap-4">

          <div>
            <p
              className="
                text-xs
                text-slate-400
                uppercase
                font-bold
                tracking-widest
              "
            >
              Duration
            </p>
            <p
              className="
                text-2xl
                font-black
                text-white
                mt-1
              "
            >
              {tripDuration > 0 ? `${tripDuration} min` : "-"}
            </p>
          </div>

          <div>
            <p
              className="
                text-xs
                text-slate-400
                uppercase
                font-bold
                tracking-widest
              "
            >
              Distance
            </p>
            <p
              className="
                text-2xl
                font-black
                text-white
                mt-1
              "
            >
              {totalDistance > 0 ? `${totalDistance.toFixed(1)} km` : "-"}
            </p>
          </div>

          <div>
            <p
              className="
                text-xs
                text-slate-400
                uppercase
                font-bold
                tracking-widest
              "
            >
              Max Speed
            </p>
            <p
              className="
                text-2xl
                font-black
                text-white
                mt-1
              "
            >
              {maxSpeed > 0 ? `${maxSpeed} km/h` : "-"}
            </p>
          </div>

          <div>
            <p
              className="
                text-xs
                text-slate-400
                uppercase
                font-bold
                tracking-widest
              "
            >
              SOC Range
            </p>
            <p
              className="
                text-2xl
                font-black
                text-white
                mt-1
              "
            >
              {minSoc}% – {maxSoc}%
            </p>
          </div>

        </div>

        {/* =================================================
            ROUTE MAP
        ================================================= */}

        <div className="h-[300px] w-full rounded-xl overflow-hidden mt-4">

          <div
            className="
              relative
              h-full
              w-full
            "
          >

            <ErrorBoundary>

              <div
                ref={mapContainerRef}
                className="
                  absolute
                  inset-0
                  w-full
                  h-full
                  bg-[#0b0f14]
                  rounded-xl
                "
              />

            </ErrorBoundary>

          </div>

        </div>

        {/* =================================================
            TRIP DETAILS
        ================================================= */}

        <div className="mt-4 pt-4 border-t border-white/10">

          <p
            className="
              text-xs
              text-slate-400
              uppercase
              font-bold
              tracking-widest
            "
          >
            Trip Details
          </p>

          <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">

            <div>
              <p
                className="
                  text-xs
                  font-bold
                  text-slate-400
                  uppercase
                  tracking-widest
                "
              >
                Start
              </p>
              <p
                className="
                  mt-1
                  text-[9px]
                  text-slate-500
                "
              >
                {session.startedAt ? new Date(session.startedAt).toLocaleTimeString() : "-"}
              </p>
            </div>

            <div>
              <p
                className="
                  text-xs
                  font-bold
                  text-slate-400
                  uppercase
                  tracking-widest
                "
              >
                End
              </p>
              <p
                className="
                  mt-1
                  text-[9px]
                  text-slate-500
                "
              >
                {liveData?.lastUpdate ? new Date(liveData.lastUpdate).toLocaleTimeString() : "-"}
              </p>
            </div>

            <div>
              <p
                className="
                  text-xs
                  font-bold
                  text-slate-400
                  uppercase
                  tracking-widest
                "
              >
                Waypoints
              </p>
              <p
                className="
                  mt-1
                  text-[9px]
                  text-slate-500
                "
              >
                {history.length}
              </p>
            </div>

            <div>
              <p
                className="
                  text-xs
                  font-bold
                  text-slate-400
                  uppercase
                  tracking-widest
                "
              >
                Avg Speed
              </p>
              <p
                className="
                  mt-1
                  text-[9px]
                  text-slate-500
                "
              >
                {maxSpeed > 0 ? `${(maxSpeed * 0.85).toFixed(0)} km/h` : "-"}
              </p>
            </div>

          </div>

        </div>

      </div>

    </GlassCard>

  );
}
