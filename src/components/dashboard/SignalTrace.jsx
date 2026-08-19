import { useMemo, useState } from "react";

import {
  Activity,
  Battery,
  Gauge,
  Thermometer,
  Zap,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import GlassCard from "../common/GlassCard";
import ErrorBoundary from "../common/ErrorBoundary";


export default function SignalTrace({
  history = [],
}) {

  const [metric, setMetric] =
    useState("voltage");


  const chartData =
    useMemo(() => {

      return history
        .filter(Boolean)
        .map((point, index) => ({

          ...point,

          index,

          time:
            point.time ||
            "--",

          voltage:
            Number(point.voltage ?? 0),

          speed:
            Number(point.speed ?? 0),

          soc:
            Number(point.soc ?? 0),

          temperature:
            Number(point.temperature ?? 0),

        }));

    }, [history]);


  const metricConfig = {

    voltage: {
      label: "Pack Voltage",
      unit: "V",
      dataKey: "voltage",
      icon: Zap,
      domain: ["auto", "auto"],
    },

    speed: {
      label: "Speed",
      unit: "km/h",
      dataKey: "speed",
      icon: Gauge,
      domain: [0, "auto"],
    },

    soc: {
      label: "Battery SOC",
      unit: "%",
      dataKey: "soc",
      icon: Battery,
      domain: [0, 100],
    },

    temperature: {
      label: "Motor Temperature",
      unit: "°C",
      dataKey: "temperature",
      icon: Thermometer,
      domain: ["auto", "auto"],
    },

  };


  const activeMetric =
    metricConfig[metric];

  const ActiveIcon =
    activeMetric.icon;


  const latest =
    chartData.length > 0
      ? chartData[chartData.length - 1]
      : null;


  return (

    <GlassCard
      className="
        p-6
        flex
        flex-col
        h-[450px]
      "
      hover={false}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          mb-5
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              p-2
              bg-indigo-500/20
              rounded-lg
            "
          >

            <Activity
              className="
                w-4
                h-4
                text-indigo-400
              "
            />

          </div>


          <div>

            <h3
              className="
                text-sm
                font-bold
                text-slate-200
                uppercase
                tracking-widest
              "
            >
              Signal Trace
            </h3>

            <p
              className="
                mt-1
                text-[7px]
                font-mono
                uppercase
                tracking-widest
                text-slate-600
              "
            >
              Live telemetry signal history
            </p>

          </div>

        </div>


        {/* =================================================
            CURRENT VALUE
        ================================================= */}

        <div
          className="
            text-right
          "
        >

          <div
            className="
              flex
              items-center
              justify-end
              gap-1.5
              text-[7px]
              font-bold
              uppercase
              tracking-widest
              text-slate-600
            "
          >

            <ActiveIcon
              className="
                h-3
                w-3
                text-indigo-400
              "
            />

            {activeMetric.label}

          </div>


          <div
            className="
              mt-1
              font-mono
              text-sm
              font-bold
              text-slate-300
            "
          >

            {latest
              ? `${latest[activeMetric.dataKey]} ${activeMetric.unit}`
              : "--"}

          </div>

        </div>

      </div>


      {/* =================================================
          METRIC SELECTOR
      ================================================= */}

      <div
        className="
          mb-4
          flex
          items-center
          gap-1
          rounded-xl
          border
          border-white/5
          bg-black/20
          p-1
        "
      >

        {Object.entries(metricConfig).map(
          ([key, config]) => {

            const Icon =
              config.icon;

            const active =
              metric === key;

            return (

              <button
                key={key}
                type="button"
                onClick={() =>
                  setMetric(key)
                }
                className={`
                  flex
                  flex-1
                  items-center
                  justify-center
                  gap-1.5
                  rounded-lg
                  px-2
                  py-2
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-wider
                  transition
                  ${
                    active
                      ? `
                        bg-indigo-500/15
                        text-indigo-300
                        border
                        border-indigo-500/20
                      `
                      : `
                        text-slate-600
                        hover:text-slate-400
                      `
                  }
                `}
              >

                <Icon
                  className="
                    h-3
                    w-3
                  "
                />

                {key}

              </button>

            );

          }
        )}

      </div>


      {/* =================================================
          CHART
      ================================================= */}

      <div
        className="
          flex-1
          min-h-0
          w-full
        "
      >

        <ErrorBoundary>

          {chartData.length >= 2 ? (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#ffffff10"
                  vertical={false}
                />


                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  fontSize={9}
                  tickMargin={8}
                  axisLine={false}
                  tickLine={false}
                />


                <YAxis
                  stroke="#64748b"
                  fontSize={9}
                  domain={
                    activeMetric.domain
                  }
                  axisLine={false}
                  tickLine={false}
                />


                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      "rgba(10, 12, 18, 0.96)",

                    border:
                      "1px solid rgba(255,255,255,0.08)",

                    borderRadius:
                      "10px",

                    fontSize:
                      "10px",
                  }}

                  labelStyle={{
                    color:
                      "#94a3b8",
                    marginBottom:
                      "4px",
                  }}

                  formatter={(
                    value
                  ) => [
                    `${value} ${activeMetric.unit}`,
                    activeMetric.label,
                  ]}
                />


                <Line
                  type="monotone"
                  dataKey={
                    activeMetric.dataKey
                  }
                  name={
                    activeMetric.label
                  }
                  stroke="#818cf8"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />

              </LineChart>

            </ResponsiveContainer>

          ) : (

            <div
              className="
                h-full
                flex
                flex-col
                items-center
                justify-center
                text-center
              "
            >

              <Activity
                className="
                  h-6
                  w-6
                  text-slate-700
                  mb-3
                "
              />

              <div
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-widest
                  text-slate-600
                "
              >
                Waiting for telemetry history
              </div>

              <div
                className="
                  mt-1
                  text-[8px]
                  font-mono
                  text-slate-700
                "
              >
                Signal points will appear as the vehicle
                sends telemetry
              </div>

            </div>

          )}

        </ErrorBoundary>

      </div>


      {/* =================================================
          FOOTER
      ================================================= */}

      <div
        className="
          mt-4
          flex
          items-center
          justify-between
          border-t
          border-white/5
          pt-3
        "
      >

        <span
          className="
            text-[7px]
            font-mono
            uppercase
            tracking-widest
            text-slate-700
          "
        >
          {chartData.length} SIGNAL POINTS
        </span>


        <span
          className="
            text-[7px]
            font-mono
            uppercase
            tracking-widest
            text-slate-700
          "
        >
          LIVE STREAM
        </span>

      </div>

    </GlassCard>

  );
}