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

import useVehicleTelemetry from "./hooks/useVehicleTelemetry";
import { vehicleApi } from "./services/vehicleApi";
const INITIAL_GEOFENCE = {
    id: null,
    enabled: true,
    lat: 12.9904,
    lng: 77.5712,
    radius: 500,
};


export default function Dashboard({
    profile,
    onLogout,
}) {

    // =====================================================
    // TELEMETRY
    // =====================================================

    const {
        liveData,
        connectionStatus,
    } = useVehicleTelemetry();


    // =====================================================
    // DASHBOARD STATE
    // =====================================================

    const [
        alerts,
        setAlerts
    ] = useState([]);


    const [
        trips,
        setTrips
    ] = useState([]);


    const [
        geofence,
        setGeofence
    ] = useState(
        INITIAL_GEOFENCE
    );


    const [
        geofenceSaving,
        setGeofenceSaving
    ] = useState(false);


    // =====================================================
    // LOAD DASHBOARD DATA
    // =====================================================

    useEffect(() => {

        let cancelled = false;


        async function loadDashboard() {

            try {

                console.log(
                    "📊 Loading dashboard..."
                );


                const [
                    tripsResponse,
                    alertsResponse
                ] = await Promise.all([

                    vehicleApi.getTrips(),

                    vehicleApi.getAlerts(),

                ]);


                if (cancelled) {
                    return;
                }


                // ---------------------------------------------
                // TRIPS
                // ---------------------------------------------

                if (
                    Array.isArray(
                        tripsResponse?.data
                    )
                ) {

                    setTrips(
                        tripsResponse.data
                    );

                }


                // ---------------------------------------------
                // ALERTS
                // ---------------------------------------------

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


    // =====================================================
    // GEOFENCE
    // =====================================================

    function changeGeofenceRadius(
        radius
    ) {

        setGeofence(
            previous => ({
                ...previous,
                radius,
            })
        );

    }


    function changeGeofenceLocation(
        lat,
        lng
    ) {

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
        ) {

            return;

        }


        setGeofence(
            previous => ({
                ...previous,
                lat,
                lng,
            })
        );

    }


    function useBikeLocationForGeofence() {

        const lat =
            liveData?.latitude;


        const lng =
            liveData?.longitude;


        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
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
            "📍 Geofence moved to bike:",
            lat,
            lng
        );

    }


    function toggleGeofence() {

        setGeofence(
            previous => ({
                ...previous,
                enabled:
                    !previous.enabled,
            })
        );

    }


    async function saveGeofence() {

        if (!geofence.id) {

            console.warn(
                "⚠️ No geofence ID available yet."
            );

            return;

        }


        try {

            setGeofenceSaving(
                true
            );


            await vehicleApi.updateGeofence(
                geofence.id,
                geofence.radius
            );


            console.log(
                "✅ Geofence updated successfully."
            );


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


    // =====================================================
    // DASHBOARD UI
    // =====================================================

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
                />


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


                <LiveTelemetry
                    liveData={liveData}
                    connectionStatus={
                        connectionStatus
                    }
                />


                <section
                    className="
                        grid
                        grid-cols-1
                        lg:grid-cols-3
                        gap-6
                    "
                >

                    <div
                        className="lg:col-span-2"
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

                            history={[]}
                        />

                    </div>


                    <GeofenceController
                        geofence={
                            geofence
                        }

                        onChange={
                            changeGeofenceRadius
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
                            geofenceSaving
                        }
                    />

                </section>


                <SignalTrace
                    history={
                        liveData?.history || []
                    }
                />


                <section
                    className="
                        grid
                        grid-cols-1
                        xl:grid-cols-3
                        gap-6
                    "
                >

                    <SubsystemArray
                        liveData={
                            liveData
                        }
                    />


                    <FaultPanel
                        liveData={
                            liveData
                        }
                    />

                </section>


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
                        trips={
                            trips
                        }
                    />


                    <VehicleActivity />

                </section>

            </main>

        </div>

    );

}