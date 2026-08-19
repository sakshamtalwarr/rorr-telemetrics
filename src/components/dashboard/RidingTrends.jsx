import { useEffect, useMemo, useState } from "react";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

import {
  TrendingUp,
  Route,
  Gauge,
  Timer,
  Activity,
  Clock3,
  Bike,
} from "lucide-react";

import GlassCard from "../common/GlassCard";
import { vehicleApi } from "../../services/vehicleApi";


// =====================================================
// PERIODS
// =====================================================

const PERIODS = [
  { id: "today", label: "TODAY" },
  { id: "week", label: "WEEK" },
  { id: "month", label: "MONTH" },
];


// =====================================================
// HELPERS
// =====================================================

function parseTimestamp(timestamp) {
  if (!timestamp) return null;

  const raw = String(timestamp);

  // Backend currently returns: YYYY-MM-DD HH:mm:ss
  const normalized = raw.includes("T")
    ? raw
    : raw.replace(" ", "T");

  const parsed = new Date(normalized);

  return Number.isNaN(parsed.getTime())
    ? null
    : parsed;
}


function formatTime(timestamp) {
  const date = parseTimestamp(timestamp);

  if (!date) return "--";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}


function formatDate(timestamp) {
  const date = parseTimestamp(timestamp);

  if (!date) return "--";

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
  });
}


function formatFullTimestamp(timestamp) {
  const date = parseTimestamp(timestamp);

  if (!date) return timestamp || "--";

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


function formatChartLabel(timestamp, period) {
  if (period === "today") {
    return formatTime(timestamp);
  }

  if (period === "week") {
    const date = parseTimestamp(timestamp);

    if (!date) return "--";

    return date.toLocaleDateString([], {
      weekday: "short",
      day: "numeric",
    });
  }

  return formatDate(timestamp);
}


// =====================================================
// TOOLTIP
// =====================================================

function RidingTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const record = payload[0]?.payload;

  if (!record) {
    return null;
  }

  return (
    <div
      className="
        min-w-[230px]
        rounded-xl
        border
        border-white/10
        bg-[#09090c]/95
        p-4
        shadow-2xl
        backdrop-blur-xl
      "
    >
      <div
        className="
          mb-3
          flex
          items-center
          gap-2
          border-b
          border-white/10
          pb-3
        "
      >
        <Clock3 className="h-4 w-4 text-indigo-400" />

        <div>
          <p className="text-xs font-bold text-white">
            {formatFullTimestamp(record.timestamp)}
          </p>

          <p className="mt-0.5 text-[8px] font-mono text-slate-600">
            RIDE ACTIVITY
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <MetricRow
          label="Trips / Ride Events"
          value={record.totalTrips}
          unit=""
          className="text-emerald-300"
        />

        <MetricRow
          label="Distance"
          value={record.totalDistance}
          unit="km"
          className="text-indigo-300"
        />

        <MetricRow
          label="Average Speed"
          value={record.avgSpeed}
          unit="km/h"
          className="text-amber-300"
        />
      </div>
    </div>
  );
}


function MetricRow({
  label,
  value,
  unit,
  className,
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <span className="text-[10px] text-slate-500">
        {label}
      </span>

      <span className={`text-[11px] font-bold ${className}`}>
        {value}
        {unit && (
          <span className="ml-1 text-[8px] text-slate-600">
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}


// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-white/5
        bg-black/30
        p-3
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
          text-[8px]
          font-bold
          tracking-wider
          text-slate-600
        "
      >
        <Icon className="h-3 w-3" />
        {label}
      </div>

      <div
        className={`
          mt-1
          text-lg
          font-black
          ${accent}
        `}
      >
        {value}
      </div>
    </div>
  );
}


// =====================================================
// RIDING TRENDS
// =====================================================

export default function RidingTrends() {
  const [period, setPeriod] = useState("today");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  // ===================================================
  // LOAD ANALYTICS
  // ===================================================

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      try {
        setLoading(true);
        setError(null);

        console.log(
          `📊 Loading riding analytics: ${period}`
        );

        const response =
          await vehicleApi.getTripStats({
            period,
          });

        if (cancelled) {
          return;
        }

        console.log(
          "📊 Analytics response:",
          response
        );

        const data = Array.isArray(response?.data)
          ? response.data
          : [];

        setRecords(data);
      } catch (err) {
        if (!cancelled) {
          console.error(
            "❌ Riding analytics error:",
            err
          );

          setError(
            err?.message ||
            "Unable to load riding analytics"
          );

          setRecords([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, [period]);


  // ===================================================
  // NORMALIZE / SORT
  // ===================================================

  const chartData = useMemo(() => {
    return records
      .map((item) => ({
        ...item,

        totalTrips:
          Number(item.totalTrips) || 0,

        totalDistance:
          Number(item.totalDistance) || 0,

        avgSpeed:
          Number(item.avgSpeed) || 0,

        label:
          formatChartLabel(
            item.timestamp,
            period
          ),
      }))
      .sort((a, b) => {
        const dateA = parseTimestamp(a.timestamp);
        const dateB = parseTimestamp(b.timestamp);

        if (!dateA || !dateB) return 0;

        return dateA.getTime() - dateB.getTime();
      });
  }, [records, period]);


  // ===================================================
  // SUMMARY
  // ===================================================

  const summary = useMemo(() => {
    const totalDistance =
      chartData.reduce(
        (sum, item) =>
          sum + item.totalDistance,
        0
      );

    const totalTrips =
      chartData.reduce(
        (sum, item) =>
          sum + item.totalTrips,
        0
      );

    const weightedSpeed =
      chartData.reduce(
        (sum, item) =>
          sum +
          item.avgSpeed *
          item.totalDistance,
        0
      );

    const averageSpeed =
      totalDistance > 0
        ? weightedSpeed / totalDistance
        : chartData.length > 0
          ? chartData.reduce(
              (sum, item) =>
                sum + item.avgSpeed,
              0
            ) / chartData.length
          : 0;

    const busiest =
      chartData.reduce(
        (best, item) => {
          if (
            !best ||
            item.totalTrips >
              best.totalTrips
          ) {
            return item;
          }

          return best;
        },
        null
      );

    return {
      totalDistance:
        Number(
          totalDistance.toFixed(1)
        ),

      totalTrips,

      averageSpeed:
        Number(
          averageSpeed.toFixed(1)
        ),

      busiestTime:
        busiest
          ? formatFullTimestamp(
              busiest.timestamp
            )
          : "--",

      busiestTrips:
        busiest?.totalTrips || 0,
    };
  }, [chartData]);


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <GlassCard
      className="
        flex
        min-h-[620px]
        flex-col
        p-5
      "
      hover={false}
    >

      {/* ===============================================
          HEADER
      =============================================== */}

      <div
        className="
          mb-5
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <h3
            className="
              flex
              items-center
              gap-3
              text-sm
              font-bold
              uppercase
              tracking-widest
              text-slate-200
            "
          >
            <TrendingUp
              className="
                h-5
                w-5
                text-purple-400
              "
            />

            Riding Analytics
          </h3>

          <p
            className="
              ml-8
              mt-1
              text-[9px]
              font-mono
              text-slate-600
            "
          >
            TRIP ACTIVITY • DISTANCE • SPEED • TIME
          </p>
        </div>


        {/* PERIOD SELECTOR */}

        <div
          className="
            flex
            gap-1
            rounded-xl
            border
            border-white/10
            bg-black/40
            p-1
          "
        >
          {PERIODS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                setPeriod(item.id)
              }
              className={`
                rounded-lg
                px-3
                py-1.5
                text-[9px]
                font-bold
                tracking-wider
                transition-all

                ${
                  period === item.id
                    ? `
                      border
                      border-indigo-500/30
                      bg-indigo-500/20
                      text-indigo-300
                    `
                    : `
                      text-slate-500
                      hover:text-slate-300
                    `
                }
              `}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>


      {/* ===============================================
          SUMMARY
      =============================================== */}

      <div
        className="
          mb-5
          grid
          grid-cols-2
          gap-2
          lg:grid-cols-4
        "
      >
        <SummaryCard
          icon={Route}
          label="DISTANCE"
          value={`${summary.totalDistance} km`}
          accent="text-indigo-300"
        />

        <SummaryCard
          icon={Bike}
          label="RIDE EVENTS"
          value={summary.totalTrips}
          accent="text-emerald-300"
        />

        <SummaryCard
          icon={Gauge}
          label="AVG SPEED"
          value={`${summary.averageSpeed} km/h`}
          accent="text-amber-300"
        />

        <SummaryCard
          icon={Timer}
          label="BUSIEST EVENT"
          value={
            summary.busiestTrips > 0
              ? `${summary.busiestTrips} rides`
              : "--"
          }
          accent="text-purple-300"
        />
      </div>


      {/* ===============================================
          CHART
      =============================================== */}

      <div
        className="
          relative
          h-[290px]
          w-full
        "
      >

        {loading && (
          <div
            className="
              absolute
              inset-0
              z-20
              flex
              items-center
              justify-center
              rounded-xl
              bg-black/40
              backdrop-blur-sm
            "
          >
            <div
              className="
                animate-pulse
                text-[10px]
                font-mono
                text-slate-400
              "
            >
              LOADING {period.toUpperCase()} TELEMETRY...
            </div>
          </div>
        )}


        {error ? (
          <div
            className="
              flex
              h-full
              items-center
              justify-center
              rounded-xl
              border
              border-red-500/20
              bg-red-950/10
              px-5
              text-center
              text-xs
              font-mono
              text-red-400
            "
          >
            {error}
          </div>
        ) : chartData.length === 0 ? (
          <div
            className="
              flex
              h-full
              flex-col
              items-center
              justify-center
              rounded-xl
              border
              border-white/5
              bg-black/20
              text-center
            "
          >
            <Activity
              className="
                mb-3
                h-7
                w-7
                text-slate-700
              "
            />

            <p className="text-xs text-slate-500">
              No riding activity
            </p>

            <p
              className="
                mt-1
                text-[9px]
                font-mono
                text-slate-700
              "
            >
              No records returned for {period}
            </p>
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <ComposedChart
              data={chartData}
              margin={{
                top: 10,
                right: 12,
                left: -12,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#ffffff10"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                stroke="#64748b"
                fontSize={9}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />

              <YAxis
                yAxisId="distance"
                stroke="#818cf8"
                fontSize={9}
                axisLine={false}
                tickLine={false}
                allowDecimals
                width={35}
              />

              <YAxis
                yAxisId="trips"
                orientation="right"
                stroke="#34d399"
                fontSize={9}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={30}
              />

              <Tooltip
                content={<RidingTooltip />}
                cursor={{
                  fill:
                    "rgba(255,255,255,0.04)",
                }}
              />

              <Legend
                verticalAlign="bottom"
                height={25}
                wrapperStyle={{
                  fontSize: "9px",
                }}
              />

              <Bar
                yAxisId="distance"
                dataKey="totalDistance"
                name="Distance (km)"
                fill="#818cf8"
                radius={[
                  5,
                  5,
                  0,
                  0,
                ]}
                maxBarSize={32}
              />

              <Line
                yAxisId="trips"
                type="monotone"
                dataKey="totalTrips"
                name="Trips"
                stroke="#34d399"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "#34d399",
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>


      {/* ===============================================
          DETAILED EVENT TABLE
      =============================================== */}

      {chartData.length > 0 && (
        <div
          className="
            mt-5
            overflow-hidden
            rounded-xl
            border
            border-white/5
            bg-black/20
          "
        >

          <div
            className="
              grid
              grid-cols-4
              border-b
              border-white/5
              px-4
              py-2
              text-[8px]
              font-bold
              tracking-widest
              text-slate-600
            "
          >
            <span>TIME</span>
            <span className="text-right">
              RIDES
            </span>
            <span className="text-right">
              DISTANCE
            </span>
            <span className="text-right">
              AVG SPEED
            </span>
          </div>


          <div
            className="
              max-h-[190px]
              overflow-y-auto
            "
          >
            {chartData.map(
              (item, index) => (
                <div
                  key={`${item.timestamp}-${index}`}
                  className="
                    grid
                    grid-cols-4
                    items-center
                    border-b
                    border-white/[0.03]
                    px-4
                    py-3
                    last:border-b-0
                    hover:bg-white/[0.02]
                  "
                >

                  <div>
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        text-[10px]
                        font-bold
                        text-slate-300
                      "
                    >
                      <span
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-emerald-400
                        "
                      />

                      {formatChartLabel(
                        item.timestamp,
                        period
                      )}
                    </div>

                    <div
                      className="
                        mt-1
                        text-[8px]
                        font-mono
                        text-slate-600
                      "
                    >
                      {formatFullTimestamp(
                        item.timestamp
                      )}
                    </div>
                  </div>


                  <div
                    className="
                      text-right
                      text-[11px]
                      font-bold
                      text-emerald-300
                    "
                  >
                    {item.totalTrips}
                  </div>


                  <div
                    className="
                      text-right
                      text-[11px]
                      font-bold
                      text-indigo-300
                    "
                  >
                    {item.totalDistance}
                    <span
                      className="
                        ml-1
                        text-[8px]
                        text-slate-600
                      "
                    >
                      km
                    </span>
                  </div>


                  <div
                    className="
                      text-right
                      text-[11px]
                      font-bold
                      text-amber-300
                    "
                  >
                    {item.avgSpeed}
                    <span
                      className="
                        ml-1
                        text-[8px]
                        text-slate-600
                      "
                    >
                      km/h
                    </span>
                  </div>

                </div>
              )
            )}
          </div>
        </div>
      )}

    </GlassCard>
  );
}