import { useEffect, useRef, useState } from "react";

import { BACKEND_WS } from "../config/api";


// =====================================================
// INITIAL DATA
// =====================================================

const INITIAL_DATA = {

  // GPS
  latitude: 0,
  longitude: 0,

  // Battery
  packVoltage: 0,
  soc: 0,
  range: 0,

  // Vehicle
  mode: "STANDBY",
  speed: 0,
  odometer: 0,

  // Vehicle states
  ignition: false,
  chargerConnected: false,
  sideStandStatus: false,
  killSwitchStatus: false,

  immobilize: false,
  safeMode: false,

  chargeContactorStatus: false,
  dischargeContactorStatus: false,

  // Motor
  motorTemperature: 0,

  // Faults
  gasSensorFault: false,
  thermalSensorAlarm: false,

  error: "No error",

  // Identity
  VIN: "Syncing...",
  IMEI: "Syncing...",
  VCUID: "Syncing...",

  vcuFirmwareVersion: "Syncing...",

  // Timestamps
  packetCreatedAt: null,
  flinkReceivedAt: null,
  mongoReceivedAt: null,

  lastUpdate: null,

  telemetryLatency: null,

  // Location
  address: "Awaiting Satellites...",

  // Rolling telemetry history
  history: [],

  // GPS route history
  routeHistory: [],

  // Current session statistics
  session: {

    startedAt: null,

    telemetryPackets: 0,

    maxSpeed: 0,

    minSoc: null,

    maxSoc: null,

    distanceStart: null,

    distanceTravelled: 0,

  },

};


// =====================================================
// HISTORY LIMIT
// =====================================================

const MAX_HISTORY_POINTS = 300;

const MAX_ROUTE_POINTS = 500;


// =====================================================
// NUMBER HELPER
// =====================================================

function toNumber(
  value,
  fallback = 0
) {

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;

}


// =====================================================
// DATE HELPER
// =====================================================

function parseDate(
  value
) {

  if (!value) {
    return null;
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return null;

  }


  return date;

}


// =====================================================
// TELEMETRY LATENCY
// =====================================================

function calculateLatency(
  data
) {

  const packetTime =
    parseDate(
      data.packetCreatedAt
    );

  const flinkTime =
    parseDate(
      data.flinkReceivedAt
    );


  if (
    !packetTime ||
    !flinkTime
  ) {

    return null;

  }


  const latency =
    flinkTime.getTime() -
    packetTime.getTime();


  if (
    latency < 0 ||
    latency > 600000
  ) {

    return null;

  }


  return latency;

}


// =====================================================
// HISTORY POINT
// =====================================================

function createHistoryPoint(data) {

  const now = new Date();

  return {

    time: now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),

    voltage:
      data.batteryVoltage ?? 0,

    speed:
      data.speed ?? 0,

    soc:
      data.SOC ?? 0,

    temperature:
      data.motorTemperature ?? 0,

  };
}

// =====================================================
// GPS ROUTE POINT
// =====================================================

function createRoutePoint(
  data
) {

  const latitude =
    toNumber(
      data.latitude
    );

  const longitude =
    toNumber(
      data.longitude
    );


  if (
    latitude === 0 ||
    longitude === 0
  ) {

    return null;

  }


  const packetDate =
    parseDate(
      data.packetCreatedAt
    );


  return {

    latitude,

    longitude,

    speed:
      toNumber(
        data.speed
      ),

    soc:
      toNumber(
        data.SOC
      ),

    odometer:
      toNumber(
        data.odometer
      ),

    timestamp:
      (
        packetDate ||
        new Date()
      ).toISOString(),

  };

}


// =====================================================
// NORMALIZE TELEMETRY
// =====================================================

function normalizeTelemetry(
  data,
  previous
) {

  const batteryVoltage =
    data.batteryVoltage ??
    previous.packVoltage;


  const soc =
    data.SOC ??
    previous.soc;


  const speed =
    data.speed ??
    previous.speed;


  const odometer =
    data.odometer ??
    previous.odometer;


  const latency =
    calculateLatency(
      data
    );


  return {

    ...previous,


    // -----------------------------------------------
    // GPS
    // -----------------------------------------------

    latitude:
      data.latitude ??
      previous.latitude,

    longitude:
      data.longitude ??
      previous.longitude,


    // -----------------------------------------------
    // BATTERY
    // -----------------------------------------------

    packVoltage:
      batteryVoltage,

    soc,

    range:
      data.estimatedDistanceRemaining ??
      previous.range,


    // -----------------------------------------------
    // VEHICLE
    // -----------------------------------------------

    mode:
      data.mode ??
      previous.mode,

    speed,

    odometer,


    // -----------------------------------------------
    // STATES
    // -----------------------------------------------

    ignition:
      data.ignitionStatus ??
      previous.ignition,

    chargerConnected:
      data.chargerConnected ??
      previous.chargerConnected,

    sideStandStatus:
      data.sideStandStatus ??
      previous.sideStandStatus,

    killSwitchStatus:
      data.killSwitchStatus ??
      previous.killSwitchStatus,


    // -----------------------------------------------
    // SECURITY
    // -----------------------------------------------

    immobilize:
      data.immobilize ??
      previous.immobilize,

    safeMode:
      data.safeMode ??
      previous.safeMode,


    // -----------------------------------------------
    // CONTACTORS
    // -----------------------------------------------

    chargeContactorStatus:
      data.chargeContactorStatus ??
      previous.chargeContactorStatus,

    dischargeContactorStatus:
      data.dischargeContactorStatus ??
      previous.dischargeContactorStatus,


    // -----------------------------------------------
    // MOTOR
    // -----------------------------------------------

    motorTemperature:
      data.motorTemperature ??
      previous.motorTemperature,


    // -----------------------------------------------
    // FAULTS
    // -----------------------------------------------

    gasSensorFault:
      data.gasSensorFault ??
      previous.gasSensorFault,

    thermalSensorAlarm:
      data.thermalSensorAlarm ??
      previous.thermalSensorAlarm,


    error:
      data.error ??
      previous.error,


    // -----------------------------------------------
    // IDENTITY
    // -----------------------------------------------

    VIN:
      data.VIN ??
      previous.VIN,

    IMEI:
      data.IMEI ??
      previous.IMEI,

    VCUID:
      data.VCUID ??
      previous.VCUID,

    vcuFirmwareVersion:
      data.vcuFirmwareVersion ??
      previous.vcuFirmwareVersion,


    // -----------------------------------------------
    // TELEMETRY TIMESTAMPS
    // -----------------------------------------------

    packetCreatedAt:
      data.packetCreatedAt ??
      previous.packetCreatedAt,

    flinkReceivedAt:
      data.flinkReceivedAt ??
      previous.flinkReceivedAt,

    mongoReceivedAt:
      data.mongoReceivedAt ??
      previous.mongoReceivedAt,


    lastUpdate:
      data.packetCreatedAt ??
      data.flinkReceivedAt ??
      previous.lastUpdate,


    telemetryLatency:
      latency ??
      previous.telemetryLatency,

  };

}


// =====================================================
// SESSION UPDATE
// =====================================================

function updateSession(
  previousSession,
  telemetry
) {

  const speed =
    toNumber(
      telemetry.speed
    );


  const soc =
    toNumber(
      telemetry.SOC
    );


  const odometer =
    toNumber(
      telemetry.odometer
    );


  const startedAt =
    previousSession.startedAt ||
    (
      telemetry.ignitionStatus
        ? (
            telemetry.packetCreatedAt ||
            telemetry.flinkReceivedAt ||
            new Date().toISOString()
          )
        : null
    );


  const distanceStart =
    previousSession.distanceStart === null
      ? odometer
      : previousSession.distanceStart;


  const distanceTravelled =
    distanceStart !== null
      ? Math.max(
          0,
          odometer - distanceStart
        )
      : 0;


  return {

    ...previousSession,

    startedAt,

    telemetryPackets:
      previousSession.telemetryPackets + 1,

    maxSpeed:
      Math.max(
        previousSession.maxSpeed,
        speed
      ),

    minSoc:
      previousSession.minSoc === null
        ? soc
        : Math.min(
            previousSession.minSoc,
            soc
          ),

    maxSoc:
      previousSession.maxSoc === null
        ? soc
        : Math.max(
            previousSession.maxSoc,
            soc
          ),

    distanceStart,

    distanceTravelled,

  };

}


// =====================================================
// HOOK
// =====================================================

export default function useVehicleTelemetry() {

  const [
    liveData,
    setLiveData
  ] = useState(
    INITIAL_DATA
  );


  const [
    connectionStatus,
    setConnectionStatus
  ] = useState(
    "Connecting..."
  );


  // Used to prevent duplicate packets

  const lastPacketRef =
    useRef(null);


  // Number of reconnect attempts

  const reconnectAttemptRef =
    useRef(0);


  useEffect(() => {

    let socket = null;

    let reconnectTimer = null;

    let destroyed = false;


    // =================================================
    // RECONNECT DELAY
    // =================================================

    function getReconnectDelay() {

      const attempt =
        reconnectAttemptRef.current;


      return Math.min(
        2000 *
          Math.pow(
            2,
            attempt
          ),

        30000
      );

    }


    // =================================================
    // CONNECT
    // =================================================

    function connect() {

      if (
        destroyed
      ) {

        return;

      }


      setConnectionStatus(
        "Connecting..."
      );


      console.log(
        "🔗 Connecting to telemetry proxy..."
      );


      try {

        socket =
          new WebSocket(
            BACKEND_WS
          );

      } catch (error) {

        console.error(
          "Telemetry WebSocket creation failed:",
          error
        );


        scheduleReconnect();

        return;

      }


      // =================================================
      // OPEN
      // =================================================

      socket.onopen = () => {

        console.log(
          "✅ Connected to telemetry proxy"
        );


        reconnectAttemptRef.current =
          0;


        setConnectionStatus(
          "Telemetry Active"
        );

      };


      // =================================================
      // MESSAGE
      // =================================================

      socket.onmessage = (
        event
      ) => {

        try {

          const payload =
            JSON.parse(
              event.data
            );


          // -------------------------------------------
          // SERVER ERROR
          // -------------------------------------------

          if (
            payload.status === "error"
          ) {

            console.warn(
              "Telemetry server error:",
              payload.error
            );

            return;

          }


          // -------------------------------------------
          // IGNORE UNKNOWN PACKETS
          // -------------------------------------------

          if (
            payload.status !== "success" ||
            !payload.data
          ) {

            return;

          }


          const telemetry =
            payload.data;


          // -------------------------------------------
          // DUPLICATE PROTECTION
          // -------------------------------------------

          const packetId =
            [
              telemetry.packetCreatedAt,
              telemetry.flinkReceivedAt,
              telemetry.odometer,
              telemetry.latitude,
              telemetry.longitude,
            ]
              .filter(
                value =>
                  value !==
                  undefined &&
                  value !== null
              )
              .join("|");


          if (
            packetId &&
            packetId ===
              lastPacketRef.current
          ) {

            return;

          }


          lastPacketRef.current =
            packetId;


          // -------------------------------------------
          // HISTORY
          // -------------------------------------------

          const historyPoint =
            createHistoryPoint(
              telemetry
            );


          // -------------------------------------------
          // ROUTE
          // -------------------------------------------

          const routePoint =
            createRoutePoint(
              telemetry
            );


          // -------------------------------------------
          // UPDATE STATE
          // -------------------------------------------

          setLiveData(
            previous => {

              const next =
                normalizeTelemetry(
                  telemetry,
                  previous
                );


              const newHistory = [

                ...previous.history,

                historyPoint,

              ].slice(
                -MAX_HISTORY_POINTS
              );


              const newRoute =
                routePoint
                  ? [
                      ...previous.routeHistory,
                      routePoint,
                    ].slice(
                      -MAX_ROUTE_POINTS
                    )
                  : previous.routeHistory;


              const session =
                updateSession(
                  previous.session,
                  telemetry
                );


              return {

                ...next,

                history:
                  newHistory,

                routeHistory:
                  newRoute,

                session,

              };

            }
          );


        } catch (error) {

          console.error(
            "❌ Telemetry parsing error:",
            error
          );

        }

      };


      // =================================================
      // ERROR
      // =================================================

      socket.onerror = (
        error
      ) => {

        console.warn(
          "⚠️ Telemetry socket error",
          error
        );


        setConnectionStatus(
          "Connection Error"
        );

      };


      // =================================================
      // CLOSE
      // =================================================

      socket.onclose = () => {

        if (
          destroyed
        ) {

          return;

        }


        setConnectionStatus(
          "Signal Lost"
        );


        console.log(
          "🔌 Telemetry disconnected."
        );


        scheduleReconnect();

      };

    }


    // =================================================
    // RECONNECT
    // =================================================

    function scheduleReconnect() {

      if (
        destroyed ||
        reconnectTimer
      ) {

        return;

      }


      const delay =
        getReconnectDelay();


      reconnectAttemptRef.current += 1;


      console.log(
        `🔄 Reconnecting in ${delay}ms...`
      );


      reconnectTimer =
        setTimeout(
          () => {

            reconnectTimer =
              null;

            connect();

          },
          delay
        );

    }


    // =================================================
    // INITIAL CONNECTION
    // =================================================

    connect();


    // =================================================
    // CLEANUP
    // =================================================

    return () => {

      destroyed =
        true;


      if (
        reconnectTimer
      ) {

        clearTimeout(
          reconnectTimer
        );

        reconnectTimer =
          null;

      }


      if (
        socket
      ) {

        socket.close();

      }

    };

  }, []);


  // ===================================================
  // RETURN
  // ===================================================

  return {

    liveData,

    connectionStatus,

  };

}