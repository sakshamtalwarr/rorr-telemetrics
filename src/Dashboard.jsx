import {
  useEffect,
  useState,
} from "react";

import {
  Battery,
  Gauge,
  Navigation,
  Thermometer,
} from "lucide-react";

import Header from "./components/dashboard/Header";
import MetricCard from "./components/dashboard/MetricCard";
import VehicleActivity from "./components/dashboard/VehicleActivity";
import LiveTelemetry from "./components/dashboard/LiveTelemetry";
import GeofenceController from "./components/dashboard/GeofenceController";
import LiveMap from "./components/dashboard/LiveMap";
import SignalTrace from "./components/dashboard/SignalTrace";
import SubsystemArray from "./components/dashboard/SubsystemArray";
import FaultPanel from "./components/dashboard/FaultPanel";
import RidingTrends from "./components/dashboard/RidingTrends";
import TripLogs from "./components/dashboard/TripLogs";
import Alerts from "./components/dashboard/Alerts";
import ProfilePanel from "./components/dashboard/ProfilePanel";
import MaintenanceTracker from "./components/dashboard/MaintenanceTracker";
import useVehicleTelemetry from "./hooks/useVehicleTelemetry";
import { vehicleApi } from "./services/vehicleApi";


// =====================================================
// INITIAL GEOFENCE
// =====================================================

const INITIAL_GEOFENCE = {
  geofenceId: null,
  name: "My Geofence",

  lat: null,
  lng: null,

  radius: 500,

  enabled: false,

  notify: {
    entry: true,
    exit: true,
  },
};


// =====================================================
// DASHBOARD
// =====================================================

export default function Dashboard({
  profile,
  onLogout,
}) {

  // ===================================================
  // TELEMETRY
  // ===================================================

  const {
    liveData,
    connectionStatus,
  } = useVehicleTelemetry();


  // ===================================================
  // DASHBOARD STATE
  // ===================================================

  const [
    alerts,
    setAlerts,
  ] = useState([]);

  const [
  showProfile,
  setShowProfile,
] = useState(false);
  const [
    trips,
    setTrips,
  ] = useState([]);


  // ===================================================
  // GEOFENCE STATE
  // ===================================================

  const [
    geofence,
    setGeofence,
  ] = useState(
    INITIAL_GEOFENCE
  );


  const [
    geofenceSaving,
    setGeofenceSaving,
  ] = useState(false);


  const [
    geofenceLoading,
    setGeofenceLoading,
  ] = useState(false);


  // ===================================================
  // GET VEHICLE ID
  // ===================================================

  const vehicleId =
    profile?.vehicleDetails?.[0]?.vehicleId ||
    profile?.vehicleDetails?.vehicleId ||
    liveData?.vehicleId ||
    null;


  // ===================================================
  // LOAD DASHBOARD DATA
  // ===================================================

  useEffect(() => {

    let cancelled = false;


    async function loadDashboard() {

      try {

        console.log(
          "📊 Loading dashboard..."
        );


        const [
          tripsResponse,
          alertsResponse,
        ] = await Promise.all([

          vehicleApi.getTrips(),

          vehicleApi.getAlerts(),

        ]);


        if (cancelled) {
          return;
        }


        // ===============================================
        // TRIPS
        // ===============================================

        if (
          Array.isArray(
            tripsResponse?.data
          )
        ) {

          setTrips(
            tripsResponse.data
          );

        }


        // ===============================================
        // ALERTS
        // ===============================================

        const alertData =
          alertsResponse
            ?.data
            ?.getAlertLogsByImei
            ?.data;


        if (
          Array.isArray(
            alertData
          )
        ) {

          setAlerts(
            alertData
          );

        }


      } catch (error) {

        if (!cancelled) {

          console.error(
            "❌ Dashboard loading failed:",
            error
          );

        }

      }

    }


    loadDashboard();


    return () => {

      cancelled = true;

    };

  }, []);


  // ===================================================
  // LOAD GEOFENCE FROM SERVER
  // ===================================================

  useEffect(() => {

    let cancelled = false;


    async function loadGeofence() {

      if (!vehicleId) {

        console.log(
          "⏳ Waiting for vehicle ID before loading geofence..."
        );

        return;

      }


      try {

        setGeofenceLoading(
          true
        );


        console.log(
          "🛡️ Loading geofence for vehicle:",
          vehicleId
        );


        const response =
          await vehicleApi.getGeofences(
            vehicleId
          );


        if (cancelled) {
          return;
        }


        console.log(
          "🛡️ Geofence response:",
          response
        );


        // ===============================================
        // SUPPORT MULTIPLE POSSIBLE RESPONSE SHAPES
        // ===============================================

        const fences =
          response?.data?.getGeofences ||
          response?.getGeofences ||
          response?.data ||
          [];


        if (
          !Array.isArray(fences) ||
          fences.length === 0
        ) {

          console.log(
            "ℹ️ No existing geofence found."
          );

          return;

        }


        // Use first geofence for now

        const serverGeofence =
          fences[0];


        console.log(
          "📍 Server geofence found:",
          serverGeofence
        );


        // ===============================================
        // MAP BACKEND → FRONTEND STATE
        // ===============================================

        const mappedGeofence = {

          geofenceId:
            serverGeofence.geofenceId ||
            null,


          name:
            serverGeofence.name ||
            "My Geofence",


          lat:
            Number(
              serverGeofence.latitude
            ),


          lng:
            Number(
              serverGeofence.longitude
            ),


          radius:
            Number(
              serverGeofence.radius
            ) || 500,


          // If a geofence exists on server,
          // consider it available/active in UI.
          enabled:
            true,


          notify: {

            entry:
              serverGeofence.notify?.entry ??
              true,


            exit:
              serverGeofence.notify?.exit ??
              true,

          },

        };


        console.log(
          "✅ Mapped geofence:",
          mappedGeofence
        );


        setGeofence(
          mappedGeofence
        );


      } catch (error) {

        if (!cancelled) {

          console.error(
            "❌ Failed to load geofence:",
            error
          );

        }

      } finally {

        if (!cancelled) {

          setGeofenceLoading(
            false
          );

        }

      }

    }


    loadGeofence();


    return () => {

      cancelled = true;

    };

  }, [
    vehicleId,
  ]);


  // ===================================================
  // CHANGE ENTIRE GEOFENCE
  //
  // GeofenceController sends the complete updated object
  // ===================================================

  function changeGeofence(
    updatedGeofence
  ) {

    if (!updatedGeofence) {
      return;
    }


    console.log(
      "✏️ Updating local geofence:",
      updatedGeofence
    );


    setGeofence(
      previous => ({
        ...previous,
        ...updatedGeofence,

        notify: {
          ...previous.notify,
          ...updatedGeofence.notify,
        },
      })
    );

  }


  // ===================================================
  // CHANGE ONLY RADIUS
  //
  // Kept for compatibility if controller sends a number
  // ===================================================

  function changeGeofenceRadius(
    radius
  ) {

    const numericRadius =
      Number(radius);


    if (
      !Number.isFinite(
        numericRadius
      )
    ) {

      return;

    }


    console.log(
      "📏 Geofence radius changed:",
      numericRadius
    );


    setGeofence(
      previous => ({
        ...previous,
        radius: numericRadius,
      })
    );

  }


  // ===================================================
  // CHANGE GEOFENCE LOCATION
  //
  // Called when circle/center marker moves on map
  // ===================================================

  function changeGeofenceLocation(
    lat,
    lng
  ) {

    const numericLat =
      Number(lat);


    const numericLng =
      Number(lng);


    if (
      !Number.isFinite(
        numericLat
      ) ||
      !Number.isFinite(
        numericLng
      )
    ) {

      console.warn(
        "⚠️ Invalid geofence location:",
        lat,
        lng
      );

      return;

    }


    console.log(
      "📍 Geofence location changed:",
      numericLat,
      numericLng
    );


    setGeofence(
      previous => ({
        ...previous,
        lat: numericLat,
        lng: numericLng,
      })
    );

  }


  // ===================================================
  // USE BIKE LOCATION FOR GEOFENCE
  // ===================================================

  function useBikeLocationForGeofence() {

    const lat =
      Number(
        liveData?.latitude
      );


    const lng =
      Number(
        liveData?.longitude
      );


    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat === 0 ||
      lng === 0
    ) {

      console.warn(
        "⚠️ Cannot place geofence: vehicle GPS unavailable."
      );

      return;

    }


    setGeofence(
      previous => ({
        ...previous,
        lat,
        lng,
      })
    );


    console.log(
      "🏍️ Geofence moved to bike location:",
      lat,
      lng
    );

  }


  // ===================================================
  // TOGGLE GEOFENCE
  // ===================================================

  function toggleGeofence() {

    setGeofence(
      previous => ({

        ...previous,

        enabled:
          !previous.enabled,

      })
    );

  }


  // ===================================================
  // SAVE GEOFENCE
  // ===================================================

  async function saveGeofence() {

    if (
      !geofence?.geofenceId
    ) {

      console.warn(
        "⚠️ No geofence ID available. Cannot update."
      );

      return;

    }


    if (
      !Number.isFinite(
        Number(geofence.lat)
      ) ||
      !Number.isFinite(
        Number(geofence.lng)
      )
    ) {

      console.warn(
        "⚠️ Geofence location is invalid."
      );

      return;

    }


    if (
      !Number.isFinite(
        Number(geofence.radius)
      )
    ) {

      console.warn(
        "⚠️ Geofence radius is invalid."
      );

      return;

    }


    try {

      setGeofenceSaving(
        true
      );


      console.log(
        "💾 Saving geofence:",
        geofence
      );


      const response =
        await vehicleApi.updateGeofence(
          geofence
        );


      console.log(
        "✅ Geofence updated successfully:",
        response
      );


      // Keep latest local values
      // in case backend returns updated data.

      const updatedFence =
        response?.data?.updateGeofence ||
        response?.updateGeofence ||
        null;


      if (updatedFence) {

        setGeofence(
          previous => ({

            ...previous,

            name:
              updatedFence.name ||
              previous.name,


            lat:
              Number(
                updatedFence.latitude
              ) || previous.lat,


            lng:
              Number(
                updatedFence.longitude
              ) || previous.lng,


            radius:
              Number(
                updatedFence.radius
              ) || previous.radius,

          })
        );

      }


    } catch (error) {

      console.error(
        "❌ Geofence update failed:",
        error
      );


    } finally {

      setGeofenceSaving(
        false
      );

    }

  }


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <div
      className="
        min-h-screen
        bg-[#050505]
        text-slate-100
        font-sans
        p-4
        md:p-8
        pb-24
        overflow-x-hidden
        relative
      "
    >

      <main
        className="
          max-w-[1400px]
          mx-auto
          relative
          z-10
          space-y-8
        "
      >

        {/* =============================================
            HEADER
        ============================================== */}

        <Header
          vehicle={{
            VIN:
              liveData?.VIN ||
              liveData?.vin ||
              null,
          }}

          connectionStatus={
            connectionStatus
          }

          profile={
            profile
          }
          onProfileClick={() => {
            setShowProfile((current) => !current);
        }}

          onLogout={
            onLogout
          }
        />
        {/* =====================================================
            PROFILE PANEL
        ===================================================== */}

        {showProfile && (

        <div className="mt-6">

            <ProfilePanel
            profile={profile}
            liveData={liveData}
            onLogout={onLogout}
            />

  </div>

)}


        {/* =============================================
            METRICS
        ============================================== */}

        <section
          className="
            grid
            grid-cols-2
            lg:grid-cols-5
            gap-4
            md:gap-6
          "
        >

          <MetricCard
            title="Velocity"
            value={
              liveData?.speed ?? 0
            }
            unit="km/h"
            icon={Gauge}
          />


          <MetricCard
            title="Core Power"
            value={
              liveData?.soc ?? 0
            }
            unit="%"
            icon={Battery}
            iconClass={
              liveData?.soc < 20
                ? "text-red-400"
                : "text-emerald-400"
            }
          />


          <MetricCard
            title="Est Range"
            value={
              liveData?.range ?? 0
            }
            unit="km"
            icon={Navigation}
            iconClass="text-blue-400"
          />


          <MetricCard
            title="Pack Volts"
            value={
              liveData?.packVoltage ?? 0
            }
            unit="V"
          />


          <MetricCard
            title="Motor Temp"
            value={
              liveData?.motorTemperature ?? 0
            }
            unit="°C"
            icon={Thermometer}
            iconClass={
              liveData?.motorTemperature > 80
                ? "text-red-400"
                : "text-orange-400"
            }
          />

        </section>


        {/* =============================================
            LIVE TELEMETRY
        ============================================== */}

        <LiveTelemetry
          liveData={liveData}
          connectionStatus={connectionStatus}
        />
                
        {/* =============================================
            PROFILE + MAINTENANCE
        ============================================= */}

        <section
        className="
            grid
            grid-cols-1
            xl:grid-cols-2
            gap-6
        "
        >

        <ProfilePanel
            profile={profile}
            liveData={liveData}
            onLogout={onLogout}
        />

        <MaintenanceTracker
            odometer={
            liveData?.odometer ?? 0
            }
        />

        </section>

        {/* =============================================
            MAP + GEOFENCE
        ============================================== */}

        <section
          className="
            grid
            grid-cols-1
            lg:grid-cols-3
            gap-6
          "
        >

          <div
            className="
              lg:col-span-2
              min-w-0
            "
          >

            <LiveMap

              onGeofenceMove={
                changeGeofenceLocation
              }

              onUseBikeLocation={
                useBikeLocationForGeofence
              }

              latitude={
                liveData?.latitude
              }

              longitude={
                liveData?.longitude
              }

              address={null}

              geofence={
                geofence
              }

              speed={
                liveData?.speed
              }

              batteryVoltage={
                liveData?.packVoltage
              }

              SOC={
                liveData?.soc
              }

              ignitionStatus={
                liveData?.ignitionStatus
              }

              odometer={
                liveData?.odometer
              }

              packetCreatedAt={
                liveData?.packetCreatedAt
              }

              history={
                liveData?.history || []
              }

            />

          </div>


          <div
            className="
              min-w-0
            "
          >

            <GeofenceController

              geofence={
                geofence
              }


              // Controller can send either:
              //
              // 1. complete object
              // 2. just radius
              //
              onChange={
                (value) => {

                  if (
                    typeof value === "number"
                  ) {

                    changeGeofenceRadius(
                      value
                    );

                    return;

                  }


                  changeGeofence(
                    value
                  );

                }
              }


              onToggle={
                toggleGeofence
              }


              onSave={
                saveGeofence
              }


              onUseBikeLocation={
                useBikeLocationForGeofence
              }


              saving={
                geofenceSaving ||
                geofenceLoading
              }

            />

          </div>

        </section>


        {/* =============================================
            SIGNAL TRACE
        ============================================== */}

        <SignalTrace
          history={
            liveData?.history || []
          }
        />


        {/* =============================================
            SUBSYSTEMS + FAULTS
        ============================================== */}

        <section
          className="
            grid
            grid-cols-1
            xl:grid-cols-3
            gap-6
          "
        >

          <SubsystemArray
            liveData={liveData}
          />


          <FaultPanel
            liveData={liveData}
          />

        </section>


        {/* =============================================
            ANALYTICS
        ============================================== */}

        <section
          className="
            grid
            grid-cols-1
            lg:grid-cols-3
            gap-6
          "
        >

          <RidingTrends />


          <TripLogs
            trips={trips}
          />


          <VehicleActivity />

        </section>


        {/* =============================================
            ALERTS
        ============================================== */}

        {alerts.length > 0 && (

          <Alerts
            alerts={alerts}
          />

        )}
            

      </main>

    </div>

  );

}