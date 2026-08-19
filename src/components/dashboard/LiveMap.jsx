import {
  useEffect,
  useRef,
} from "react";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  MapPin,
  LocateFixed,
  Maximize2,
  Battery,
  Gauge,
  Zap,
  Navigation,
} from "lucide-react";

import GlassCard from "../common/GlassCard";
import ErrorBoundary from "../common/ErrorBoundary";


// =====================================================
// DEFAULT LOCATION
// =====================================================

const DEFAULT_LAT = 12.9977986667;
const DEFAULT_LNG = 77.5800862667;

const geofenceIcon = L.divIcon({
  className: "geofence-center-marker",

  html: `
    <div
      style="
        width:32px;
        height:32px;
        border-radius:50%;
        background:rgba(244,63,94,0.18);
        border:2px solid #fb7185;
        display:flex;
        align-items:center;
        justify-content:center;
        box-shadow:0 0 18px rgba(244,63,94,0.65);
        cursor:grab;
      "
    >
      <span style="
        font-size:15px;
        line-height:1;
      ">
        📍
      </span>
    </div>
  `,

  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// =====================================================
// BIKE ICON
// =====================================================

const bikeIcon = L.divIcon({

  className: "oben-bike-marker",

  html: `
    <div
      style="
        width:48px;
        height:48px;
        border-radius:50%;
        background:
          radial-gradient(
            circle,
            rgba(129,140,248,0.45) 0%,
            rgba(99,102,241,0.22) 45%,
            rgba(99,102,241,0.04) 70%
          );

        border:2px solid #818cf8;

        display:flex;
        align-items:center;
        justify-content:center;

        box-shadow:
          0 0 10px rgba(99,102,241,0.9),
          0 0 30px rgba(99,102,241,0.55),
          inset 0 0 15px rgba(129,140,248,0.35);
      "
    >

      <div
        style="
          width:32px;
          height:32px;
          border-radius:50%;
          background:#111827;
          display:flex;
          align-items:center;
          justify-content:center;
          border:1px solid rgba(255,255,255,0.15);
        "
      >
        <span
          style="
            font-size:18px;
            line-height:1;
          "
        >
          🏍️
        </span>
      </div>

    </div>
  `,

  iconSize: [48, 48],

  iconAnchor: [24, 24],

  popupAnchor: [0, -25],

});


// =====================================================
// LIVE MAP
// =====================================================

export default function LiveMap({
  latitude,
  longitude,
  address,
  geofence,
  onGeofenceMove,
  onUseBikeLocation,
  speed,
  batteryVoltage,
  SOC,
  ignitionStatus,
  odometer,
  packetCreatedAt,
}) {


  // ===================================================
  // REFS
  // ===================================================

  const mapContainerRef =
    useRef(null);


  const geofenceMarkerRef = useRef(null);

  const mapRef =
    useRef(null);

  const markerRef =
    useRef(null);

  const accuracyCircleRef =
    useRef(null);

  const geofenceCircleRef =
    useRef(null);

  const trailRef =
    useRef(null);

  const firstGpsFixRef =
    useRef(false);

  const fullscreenRef =
    useRef(null);


  // ===================================================
  // VALID GPS
  // ===================================================

  const validPosition =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude !== 0 &&
    longitude !== 0;


  const initialLat =
    validPosition
      ? latitude
      : DEFAULT_LAT;


  const initialLng =
    validPosition
      ? longitude
      : DEFAULT_LNG;


useEffect(() => {

  if (
    !geofenceMarkerRef.current
  ) {
    return;
  }

  if (
    typeof geofence?.lat !== "number" ||
    typeof geofence?.lng !== "number"
  ) {
    return;
  }

  geofenceMarkerRef.current.setLatLng([
    geofence.lat,
    geofence.lng,
  ]);

}, [
  geofence?.lat,
  geofence?.lng,
]);

  // ===================================================
  // CREATE MAP
  // ===================================================

  useEffect(() => {
    
    if (!mapContainerRef.current) {
      return;
    }

    if (mapRef.current) {
      return;
    }


    console.log(
      "🗺️ Creating Leaflet map..."
    );


    const map = L.map(
      mapContainerRef.current,
      {

        center: [
          initialLat,
          initialLng,
        ],

        zoom:
          validPosition
            ? 16
            : 13,

        zoomControl:
          true,

        attributionControl:
          true,

      }
    );


    // =================================================
    // MAP LAYERS
    // =================================================

    const streetLayer =
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        {

          attribution:
            "Tiles © Esri — Sources: Esri, HERE, Garmin, FAO, NOAA, USGS",

          maxZoom:
            19,

          minZoom:
            3,

        }
      );


    const satelliteLayer =
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {

          attribution:
            "Tiles © Esri",

          maxZoom:
            19,

          minZoom:
            3,

        }
      );


    const labelsLayer =
      L.tileLayer(
        "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        {

          attribution:
            "Labels © Esri",

          maxZoom:
            19,

          minZoom:
            3,

        }
      );


    const satelliteHybrid =
      L.layerGroup([
        satelliteLayer,
        labelsLayer,
      ]);


    // Default

    streetLayer.addTo(
      map
    );


    // =================================================
    // LAYER CONTROL
    // =================================================

    L.control
      .layers(

        {
          "🗺️ Street": streetLayer,

          "🛰️ Satellite": satelliteLayer,

          "🌐 Hybrid": satelliteHybrid,

        },

        null,

        {
          collapsed: false,
          position: "topright",
        }

      )
      .addTo(map);


    // =================================================
    // SCALE
    // =================================================

    L.control
      .scale({
        imperial: false,
        position: "bottomright",
      })
      .addTo(map);


    // =================================================
    // TILE EVENTS
    // =================================================

    streetLayer.on(
      "load",
      () => {

        console.log(
          "✅ Map tiles loaded successfully."
        );

      }
    );


    streetLayer.on(
      "tileerror",
      (event) => {

        console.error(
          "❌ Map tile failed:",
          event
        );

      }
    );


    // =================================================
    // VEHICLE MARKER
    // =================================================

    const marker =
      L.marker(

        [
          initialLat,
          initialLng,
        ],

        {
          icon:
            bikeIcon,

          zIndexOffset:
            1000,
        }

      ).addTo(map);
      // =================================================
// GEOFENCE CENTER MARKER
// =================================================

let geofenceMarker = null;

if (
  typeof geofence?.lat === "number" &&
  typeof geofence?.lng === "number"
) {

  geofenceMarker =
    L.marker(
      [
        geofence.lat,
        geofence.lng,
      ],
      {
        icon: geofenceIcon,
        draggable: true,
      }
    ).addTo(map);


  geofenceMarker.bindTooltip(
    "Drag to move geofence",
    {
      direction: "top",
      offset: [0, -16],
      permanent: false,
    }
  );

  geofenceMarkerRef.current = geofenceMarker;


  geofenceMarker.on(
    "dragend",
    (event) => {

      const position =
        event.target.getLatLng();

      console.log(
        "📍 Geofence moved:",
        position.lat,
        position.lng
      );


      if (onGeofenceMove) {

        onGeofenceMove(
          position.lat,
          position.lng
        );

      }

    }
  );

}


    markerRef.current =
      marker;


    // =================================================
    // ACCURACY CIRCLE
    // =================================================

    const accuracyCircle =
      L.circle(

        [
          initialLat,
          initialLng,
        ],

        {
          radius:
            25,

          color:
            "#818cf8",

          weight:
            1,

          fillColor:
            "#6366f1",

          fillOpacity:
            0.08,

          interactive:
            false,

        }

      ).addTo(map);


    accuracyCircleRef.current =
      accuracyCircle;


    // =================================================
    // POPUP
    // =================================================

    marker.bindPopup(
      `
        <div
          style="
            min-width:230px;
            font-family:Inter,Arial,sans-serif;
            color:#e5e7eb;
            background:#111827;
            padding:8px;
          "
        >

          <div
            style="
              font-size:14px;
              font-weight:700;
              margin-bottom:10px;
            "
          >
            🏍️ OBEN RORR
          </div>

          <div
            style="
              display:grid;
              grid-template-columns:1fr 1fr;
              gap:8px;
              font-size:11px;
            "
          >

            <div>
              <span style="color:#94a3b8">
                SPEED
              </span>

              <br/>

              <strong>
                ${speed ?? 0} km/h
              </strong>
            </div>


            <div>
              <span style="color:#94a3b8">
                BATTERY
              </span>

              <br/>

              <strong>
                ${SOC ?? 0}%
              </strong>
            </div>


            <div>
              <span style="color:#94a3b8">
                VOLTAGE
              </span>

              <br/>

              <strong>
                ${batteryVoltage ?? 0} V
              </strong>
            </div>


            <div>
              <span style="color:#94a3b8">
                IGNITION
              </span>

              <br/>

              <strong>
                ${ignitionStatus ? "ON" : "OFF"}
              </strong>
            </div>

          </div>


          <div
            style="
              margin-top:12px;
              padding-top:10px;
              border-top:1px solid rgba(255,255,255,0.1);
              font-size:10px;
              line-height:1.7;
            "
          >

            <div>
              LAT:
              ${latitude?.toFixed(6)}
            </div>

            <div>
              LNG:
              ${longitude?.toFixed(6)}
            </div>

            <div>
              ODOMETER:
              ${odometer ?? 0} km
            </div>

          </div>

        </div>
      `
    );


    // =================================================
    // MAP REFS
    // =================================================

    mapRef.current =
      map;


    // =================================================
    // TRAIL
    // =================================================

    const trail =
      L.polyline(
        [],
        {

          color:
            "#818cf8",

          weight:
            4,

          opacity:
            0.75,

          lineCap:
            "round",

          lineJoin:
            "round",

        }
      ).addTo(map);


    trailRef.current =
      trail;


    // =================================================
    // FORCE SIZE
    // =================================================

    const refreshMap =
      () => {

        if (!mapRef.current) {
          return;
        }

        mapRef.current.invalidateSize(
          false
        );

      };


    const timers = [

      setTimeout(
        refreshMap,
        50
      ),

      setTimeout(
        refreshMap,
        250
      ),

      setTimeout(
        refreshMap,
        500
      ),

      setTimeout(
        refreshMap,
        1000
      ),

    ];


    // =================================================
    // RESIZE OBSERVER
    // =================================================

    let observer = null;


    if (
      typeof ResizeObserver !==
      "undefined"
    ) {

      observer =
        new ResizeObserver(
          refreshMap
        );


      observer.observe(
        mapContainerRef.current
      );

    }


    // =================================================
    // CLEANUP
    // =================================================

    return () => {

      timers.forEach(
        clearTimeout
      );


      if (observer) {
        observer.disconnect();
      }


      if (mapRef.current) {

        mapRef.current.remove();

      }


      mapRef.current =
        null;

      markerRef.current =
        null;

      geofenceMarkerRef.current =
        null;

      accuracyCircleRef.current =
        null;

      geofenceCircleRef.current =
        null;

      trailRef.current =
        null;

      firstGpsFixRef.current =
        false;

    };

  }, []);


  // ===================================================
  // UPDATE VEHICLE
  // ===================================================

  useEffect(() => {

    if (
      !mapRef.current ||
      !markerRef.current ||
      !validPosition
    ) {

      return;

    }


    const position = [
      latitude,
      longitude,
    ];


    console.log(
      "📍 Updating vehicle position:",
      latitude,
      longitude
    );


    // =================================================
    // MARKER
    // =================================================

    markerRef.current.setLatLng(
      position
    );


    // =================================================
    // ACCURACY CIRCLE
    // =================================================

    if (
      accuracyCircleRef.current
    ) {

      accuracyCircleRef.current.setLatLng(
        position
      );

    }


    // =================================================
    // POPUP
    // =================================================

    markerRef.current.setPopupContent(
      `
        <div
          style="
            min-width:230px;
            font-family:Inter,Arial,sans-serif;
            color:#e5e7eb;
            background:#111827;
            padding:8px;
          "
        >

          <div
            style="
              font-size:14px;
              font-weight:700;
              margin-bottom:10px;
            "
          >
            🏍️ OBEN RORR
          </div>

          <div
            style="
              display:grid;
              grid-template-columns:1fr 1fr;
              gap:8px;
              font-size:11px;
            "
          >

            <div>
              <span style="color:#94a3b8">
                SPEED
              </span>

              <br/>

              <strong>
                ${speed ?? 0} km/h
              </strong>
            </div>

            <div>
              <span style="color:#94a3b8">
                BATTERY
              </span>

              <br/>

              <strong>
                ${SOC ?? 0}%
              </strong>
            </div>

            <div>
              <span style="color:#94a3b8">
                VOLTAGE
              </span>

              <br/>

              <strong>
                ${batteryVoltage ?? 0} V
              </strong>
            </div>

            <div>
              <span style="color:#94a3b8">
                IGNITION
              </span>

              <br/>

              <strong>
                ${ignitionStatus ? "ON" : "OFF"}
              </strong>
            </div>

          </div>

          <div
            style="
              margin-top:12px;
              padding-top:10px;
              border-top:1px solid rgba(255,255,255,0.1);
              font-size:10px;
              line-height:1.7;
            "
          >

            <div>
              LAT:
              ${latitude.toFixed(6)}
            </div>

            <div>
              LNG:
              ${longitude.toFixed(6)}
            </div>

            <div>
              ODOMETER:
              ${odometer ?? 0} km
            </div>

          </div>

        </div>
      `
    );


    // =================================================
    // FIRST GPS FIX
    // =================================================

    if (
      !firstGpsFixRef.current
    ) {

      mapRef.current.setView(
        position,
        16,
        {
          animate:
            false,
        }
      );


      firstGpsFixRef.current =
        true;

    }

  }, [

    latitude,

    longitude,

    speed,

    batteryVoltage,

    SOC,

    ignitionStatus,

    odometer,

    validPosition,

  ]);


  // ===================================================
  // UPDATE TRAIL
  // ===================================================

  useEffect(() => {

    if (
      !trailRef.current
    ) {
      return;
    }


    if (
      !Array.isArray(history) ||
      history.length === 0
    ) {
      return;
    }


    const points =
      history
        .filter(
          point =>
            Number.isFinite(
              point.latitude
            ) &&
            Number.isFinite(
              point.longitude
            )
        )
        .map(
          point => [
            point.latitude,
            point.longitude,
          ]
        );


    if (
      points.length > 1
    ) {

      trailRef.current.setLatLngs(
        points
      );

    }

  }, [
    history,
  ]);


  // ===================================================
  // GEOFENCE
  // ===================================================

  useEffect(() => {

    if (
      !mapRef.current
    ) {
      return;
    }


    if (
      geofenceCircleRef.current
    ) {

      geofenceCircleRef.current.remove();

      geofenceCircleRef.current =
        null;

    }


    if (
      !geofence?.enabled
    ) {
      return;
    }


    if (
      typeof geofence.lat !== "number" ||
      typeof geofence.lng !== "number" ||
      typeof geofence.radius !== "number"
    ) {

      return;

    }


    const circle =
      L.circle(

        [
          geofence.lat,
          geofence.lng,
        ],

        {

          radius:
            geofence.radius,

          color:
            "#f43f5e",

          weight:
            2,

          fillColor:
            "#f43f5e",

          fillOpacity:
            0.08,

          dashArray:
            "8 8",

        }

      );


    circle.addTo(
      mapRef.current
    );


    geofenceCircleRef.current =
      circle;


  }, [

    geofence?.enabled,

    geofence?.lat,

    geofence?.lng,

    geofence?.radius,

  ]);


  // ===================================================
  // CENTER ON BIKE
  // ===================================================

  function centerOnBike() {

    if (
      !mapRef.current ||
      !validPosition
    ) {
      return;
    }


    mapRef.current.flyTo(

      [
        latitude,
        longitude,
      ],

      17,

      {
        animate:
          true,

        duration:
          0.8,
      }

    );

  }


  // ===================================================
  // FULLSCREEN
  // ===================================================

  function toggleFullscreen() {

    const element =
      fullscreenRef.current;


    if (!element) {
      return;
    }


    if (
      document.fullscreenElement
    ) {

      document.exitFullscreen();

    } else {

      element.requestFullscreen?.();

    }

  }


  // ===================================================
  // FORMAT UPDATE TIME
  // ===================================================

  const lastUpdate =
    packetCreatedAt
      ? new Date(
          packetCreatedAt
        ).toLocaleTimeString(
          [],
          {
            hour:
              "2-digit",

            minute:
              "2-digit",

            second:
              "2-digit",
          }
        )
      : "--:--:--";


  // ===================================================
  // GEOFENCE DISTANCE / STATUS
  // ===================================================

  function distanceBetweenMeters(
    lat1,
    lng1,
    lat2,
    lng2
  ) {

    const earthRadius = 6371000;

    const dLat =
      (lat2 - lat1) *
      Math.PI / 180;

    const dLng =
      (lng2 - lng1) *
      Math.PI / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    return earthRadius * c;
  }


  const geofenceDistance =
    validPosition &&
    geofence?.enabled &&
    typeof geofence?.lat === "number" &&
    typeof geofence?.lng === "number" &&
    typeof geofence?.radius === "number"
      ? distanceBetweenMeters(
          latitude,
          longitude,
          geofence.lat,
          geofence.lng
        )
      : null;


  const insideGeofence =
    geofenceDistance !== null &&
    geofenceDistance <= geofence.radius;


  const geofenceDistanceLabel =
    geofenceDistance === null
      ? "--"
      : geofenceDistance >= 1000
        ? `${(geofenceDistance / 1000).toFixed(2)} km`
        : `${Math.round(geofenceDistance)} m`;


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <GlassCard
      className="
        flex
        flex-col
        p-2
      "
      hover={false}
    >

      <div
        ref={fullscreenRef}
        className="
          relative
          flex
          flex-col
          h-[500px]
          bg-[#0b0f14]
          rounded-2xl
          overflow-hidden
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            relative
            z-[2000]
            px-4
            py-3
            flex
            items-center
            justify-between
            gap-3
            bg-black/70
            backdrop-blur-xl
            border-b
            border-white/5
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
              min-w-0
            "
          >

            <div
              className="
                p-2
                bg-rose-500/20
                rounded-lg
                shrink-0
              "
            >

              <MapPin
                className="
                  w-4
                  h-4
                  text-rose-400
                "
              />

            </div>


            <div
              className="
                min-w-0
              "
            >

              <p
                className="
                  text-sm
                  font-semibold
                  text-slate-200
                  truncate
                "
              >

                {
                  validPosition
                    ? (
                        address &&
                        address !==
                          "Awaiting Satellites..."
                          ? address
                          : "Live Vehicle Position"
                      )
                    : "Awaiting GPS..."
                }

              </p>


              <p
                className="
                  text-[8px]
                  font-mono
                  text-slate-500
                  mt-0.5
                "
              >

                {
                  validPosition
                    ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                    : "SEARCHING FOR GPS"
                }

              </p>

            </div>

          </div>


          {/* HEADER ACTIONS */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <button
              type="button"
              onClick={
                centerOnBike
              }
              disabled={
                !validPosition
              }
              title="Center on vehicle"
              className="
                p-2
                rounded-lg
                border
                border-white/10
                bg-black/40
                text-slate-400
                hover:text-indigo-300
                hover:border-indigo-500/40
                disabled:opacity-30
                transition
              "
            >

              <LocateFixed
                className="
                  w-4
                  h-4
                "
              />

            </button>


            <button
              type="button"
              onClick={
                toggleFullscreen
              }
              title="Fullscreen map"
              className="
                p-2
                rounded-lg
                border
                border-white/10
                bg-black/40
                text-slate-400
                hover:text-indigo-300
                hover:border-indigo-500/40
                transition
              "
            >

              <Maximize2
                className="
                  w-4
                  h-4
                "
              />

            </button>

          </div>

        </div>


        {/* =================================================
            MAP
        ================================================= */}

        <div
          className="
            relative
            flex-1
            min-h-0
            w-full
          "
        >

          <ErrorBoundary>

            <div
              ref={
                mapContainerRef
              }
              className="
                absolute
                inset-0
                w-full
                h-full
                z-0
              "
            />

          </ErrorBoundary>


          {/* =================================================
              LIVE TELEMETRY PANEL
          ================================================= */}

          <div
            className="
              absolute
              top-3
              left-3
              z-[1000]
              flex
              flex-col
              gap-2
            "
          >

            {/* GPS */}

            <div
              className="
                px-3
                py-2
                rounded-xl
                border
                border-white/10
                bg-black/75
                backdrop-blur-xl
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <span
                  className="
                    w-2
                    h-2
                    rounded-full
                    bg-emerald-400
                    shadow-[0_0_10px_rgba(52,211,153,0.8)]
                  "
                />

                <span
                  className="
                    text-[9px]
                    font-mono
                    font-bold
                    text-emerald-300
                  "
                >
                  LIVE GPS
                </span>

              </div>

            </div>


            {/* SPEED */}

            <div
              className="
                px-3
                py-2
                rounded-xl
                border
                border-white/10
                bg-black/75
                backdrop-blur-xl
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <Gauge
                  className="
                    w-3
                    h-3
                    text-indigo-400
                  "
                />

                <span
                  className="
                    text-[9px]
                    text-slate-400
                  "
                >
                  SPEED
                </span>

              </div>


              <div
                className="
                  text-sm
                  font-bold
                  font-mono
                  text-white
                  mt-1
                "
              >

                {speed ?? 0}

                <span
                  className="
                    text-[8px]
                    text-slate-500
                    ml-1
                  "
                >
                  KM/H
                </span>

              </div>

            </div>


            {/* BATTERY */}

            <div
              className="
                px-3
                py-2
                rounded-xl
                border
                border-white/10
                bg-black/75
                backdrop-blur-xl
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <Battery
                  className="
                    w-3
                    h-3
                    text-emerald-400
                  "
                />

                <span
                  className="
                    text-[9px]
                    text-slate-400
                  "
                >
                  BATTERY
                </span>

              </div>


              <div
                className="
                  text-sm
                  font-bold
                  font-mono
                  text-white
                  mt-1
                "
              >

                {SOC ?? 0}%

              </div>

            </div>

          </div>


          {/* =================================================
              GEOFENCE STATUS
          ================================================= */}

          {geofence?.enabled && (
            <div
              className="
                absolute
                right-3
                bottom-3
                z-[1000]
                min-w-[180px]
                px-3
                py-2.5
                rounded-xl
                border
                border-white/10
                bg-black/80
                backdrop-blur-xl
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >
                <div>
                  <div
                    className="
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-widest
                      text-slate-500
                    "
                  >
                    GEOFENCE
                  </div>

                  <div
                    className={`
                      mt-1
                      text-[10px]
                      font-bold
                      font-mono
                      ${
                        insideGeofence
                          ? "text-emerald-400"
                          : "text-red-400"
                      }
                    `}
                  >
                    {insideGeofence
                      ? "● INSIDE"
                      : "● OUTSIDE"}
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className="
                      text-[8px]
                      uppercase
                      tracking-widest
                      text-slate-600
                    "
                  >
                    DISTANCE
                  </div>

                  <div
                    className="
                      mt-1
                      text-[10px]
                      font-mono
                      font-bold
                      text-slate-200
                    "
                  >
                    {geofenceDistanceLabel}
                  </div>
                </div>
              </div>

              <div
                className="
                  mt-2
                  pt-2
                  border-t
                  border-white/5
                  flex
                  items-center
                  justify-between
                  text-[7px]
                  font-mono
                  text-slate-600
                "
              >
                <span>RADIUS</span>
                <span className="text-slate-400">
                  {geofence.radius >= 1000
                    ? `${(geofence.radius / 1000).toFixed(2)} KM`
                    : `${geofence.radius} M`}
                </span>
              </div>
            </div>
          )}

          {/* =================================================
              BOTTOM STATUS
          ================================================= */}

          <div
            className="
              absolute
              left-3
              bottom-3
              z-[1000]
              flex
              items-center
              gap-3
              px-3
              py-2
              rounded-xl
              border
              border-white/10
              bg-black/80
              backdrop-blur-xl
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <Navigation
                className="
                  w-3
                  h-3
                  text-indigo-400
                "
              />

              <span
                className="
                  text-[9px]
                  font-mono
                  text-slate-300
                "
              >

                {latitude?.toFixed(6)}

                {" / "}

                {longitude?.toFixed(6)}

              </span>

            </div>


            <div
              className="
                h-3
                w-px
                bg-white/10
              "
            />


            <div
              className="
                flex
                items-center
                gap-1.5
              "
            >

              <Zap
                className="
                  w-3
                  h-3
                  text-yellow-400
                "
              />

              <span
                className="
                  text-[9px]
                  font-mono
                  text-slate-400
                "
              >

                {batteryVoltage ?? 0}V

              </span>

            </div>


            <div
              className="
                text-[8px]
                font-mono
                text-slate-600
              "
            >

              {lastUpdate}

            </div>

          </div>


          {geofence?.enabled && (
            <div
              className="
                absolute
                top-3
                left-1/2
                -translate-x-1/2
                z-[1000]
                px-3
                py-1.5
                rounded-lg
                border
                border-rose-400/20
                bg-black/70
                backdrop-blur-xl
                text-[7px]
                font-mono
                uppercase
                tracking-widest
                text-rose-300/80
                pointer-events-none
              "
            >
              📍 Drag pin to move fence
            </div>
          )}

          {/* =================================================
              IGNITION STATUS
          ================================================= */}

          <div
            className="
              absolute
              top-3
              right-3
              z-[1000]
              px-3
              py-2
              rounded-xl
              border
              border-white/10
              bg-black/75
              backdrop-blur-xl
            "
          >

            <div
              className="
                text-[8px]
                uppercase
                tracking-widest
                text-slate-500
              "
            >
              VEHICLE
            </div>


            <div
              className={`
                text-[10px]
                font-bold
                font-mono
                mt-1
                ${
                  ignitionStatus
                    ? "text-emerald-400"
                    : "text-slate-400"
                }
              `}
            >

              {ignitionStatus
                ? "IGNITION ON"
                : "PARKED"
              }

            </div>

          </div>

        </div>

      </div>

    </GlassCard>

  );

}