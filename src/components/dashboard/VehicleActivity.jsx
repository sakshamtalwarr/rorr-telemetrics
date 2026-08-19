import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  AlertTriangle,
  BatteryWarning,
  CircleOff,
  ChevronLeft,
  ChevronRight,
  Power,
  RefreshCw,
  ShieldAlert,
  X,
} from "lucide-react";

import GlassCard from "../common/GlassCard";
import { vehicleApi } from "../../services/vehicleApi";


// =====================================================
// HELPERS
// =====================================================

function parseDate(value) {
  if (!value) return null;

  const date = new Date(
    String(value).replace(" ", "T")
  );

  return Number.isNaN(date.getTime())
    ? null
    : date;
}


function formatTime(value) {
  const date = parseDate(value);

  if (!date) return "--";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}


function formatDate(value) {
  const date = parseDate(value);

  if (!date) return "--";

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


function formatDay(value) {
  const date = parseDate(value);

  if (!date) return "UNKNOWN";

  return date.toLocaleDateString([], {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });
}


function getEventIcon(event) {

  const type =
    String(event?.subType || "")
      .toLowerCase();

  const content =
    String(event?.content || "")
      .toLowerCase();


  if (type.includes("ignition")) {

    return content.includes("on")
      ? Power
      : CircleOff;
  }


  if (type.includes("battery")) {
    return BatteryWarning;
  }


  if (
    type.includes("security") ||
    type.includes("immobil")
  ) {
    return ShieldAlert;
  }


  return AlertTriangle;
}


function getEventTone(event) {

  const severity =
    String(event?.severity || "")
      .toUpperCase();

  const type =
    String(event?.subType || "")
      .toLowerCase();

  const content =
    String(event?.content || "")
      .toLowerCase();


  if (
    type.includes("ignition") &&
    content.includes("on")
  ) {
    return {
      dot: "bg-emerald-400",
      icon: "text-emerald-400",
      text: "text-emerald-400",
      background: "bg-emerald-500/[0.04]",
      border: "border-emerald-500/10",
    };
  }


  if (
    type.includes("ignition") &&
    content.includes("off")
  ) {
    return {
      dot: "bg-slate-500",
      icon: "text-slate-400",
      text: "text-slate-300",
      background: "bg-white/[0.015]",
      border: "border-white/5",
    };
  }


  if (
    severity === "HIGH" ||
    severity === "CRITICAL"
  ) {
    return {
      dot: "bg-red-400",
      icon: "text-red-400",
      text: "text-red-400",
      background: "bg-red-500/[0.04]",
      border: "border-red-500/15",
    };
  }


  if (severity === "MEDIUM") {
    return {
      dot: "bg-amber-400",
      icon: "text-amber-400",
      text: "text-amber-400",
      background: "bg-amber-500/[0.04]",
      border: "border-amber-500/10",
    };
  }


  return {
    dot: "bg-indigo-400",
    icon: "text-indigo-400",
    text: "text-indigo-400",
    background: "bg-indigo-500/[0.03]",
    border: "border-indigo-500/10",
  };
}


function isIgnition(event) {
  return String(event?.subType || "")
    .toLowerCase()
    .includes("ignition");
}


function isIgnitionOn(event) {
  return String(event?.content || "")
    .toLowerCase()
    .includes("ignition is on");
}


// =====================================================
// EVENT ROW
// =====================================================

function EventRow({ event }) {

  const Icon =
    getEventIcon(event);

  const tone =
    getEventTone(event);


  return (
    <div
      className={`
        flex
        items-center
        gap-3
        rounded-xl
        border
        p-3
        ${tone.background}
        ${tone.border}
      `}
    >

      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-black/20
        "
      >
        <Icon
          className={`
            h-4
            w-4
            ${tone.icon}
          `}
        />
      </div>


      <div className="min-w-0 flex-1">

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <span
            className={`
              h-1.5
              w-1.5
              shrink-0
              rounded-full
              ${tone.dot}
            `}
          />

          <span
            className={`
              truncate
              text-[9px]
              font-bold
              ${tone.text}
            `}
          >
            {event?.title ||
              event?.subType ||
              "Vehicle Event"}
          </span>

        </div>


        <p
          className="
            mt-1
            truncate
            text-[8px]
            font-mono
            text-slate-500
          "
        >
          {event?.content || "--"}
        </p>

      </div>


      <div className="shrink-0 text-right">

        <div
          className="
            text-[9px]
            font-mono
            text-slate-300
          "
        >
          {formatTime(event?.createdAt)}
        </div>

        <div
          className="
            mt-0.5
            text-[7px]
            font-mono
            text-slate-700
          "
        >
          {formatDate(event?.createdAt)}
        </div>

      </div>

    </div>
  );
}


// =====================================================
// HISTORY MODAL
// =====================================================

function ActivityHistory({
  onClose,
}) {

  const [events, setEvents] =
    useState([]);

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalCount, setTotalCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [filter, setFilter] =
    useState("all");


  async function loadPage(targetPage) {

    try {

      setLoading(true);
      setError(null);


      const response =
        await vehicleApi.getAlerts(
          targetPage,
          25
        );


      const result =
        response?.data?.getAlertLogsByImei;


      setEvents(
        result?.data || []
      );


      setPage(
        result?.currentPage ||
        targetPage
      );


      setTotalPages(
        result?.totalPages || 1
      );


      setTotalCount(
        result?.totalCount || 0
      );


    } catch (err) {

      console.error(
        "Activity history error:",
        err
      );

      setError(
        err.message ||
        "Unable to load activity history"
      );

    } finally {

      setLoading(false);
    }
  }


  useEffect(() => {

    loadPage(1);

  }, []);


  const filteredEvents =
    useMemo(() => {

      if (filter === "all") {
        return events;
      }


      if (filter === "ignition") {
        return events.filter(
          isIgnition
        );
      }


      if (filter === "battery") {
        return events.filter(
          event =>
            String(
              event?.subType || ""
            )
              .toLowerCase()
              .includes("battery")
        );
      }


      if (filter === "alerts") {
        return events.filter(
          event => {

            const severity =
              String(
                event?.severity || ""
              ).toUpperCase();

            return (
              severity === "HIGH" ||
              severity === "CRITICAL" ||
              severity === "MEDIUM"
            );
          }
        );
      }


      return events;

    }, [events, filter]);


  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/70
        p-4
        backdrop-blur-md
      "
    >

      <div
        className="
          flex
          max-h-[90vh]
          w-full
          max-w-4xl
          flex-col
          overflow-hidden
          rounded-3xl
          border
          border-white/10
          bg-[#080b12]
          shadow-2xl
        "
      >

        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-white/5
            px-5
            py-4
          "
        >

          <div>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <Activity
                className="
                  h-4
                  w-4
                  text-indigo-400
                "
              />

              <h2
                className="
                  text-sm
                  font-bold
                  uppercase
                  tracking-widest
                  text-slate-200
                "
              >
                Vehicle Activity
              </h2>

            </div>


            <p
              className="
                mt-1
                text-[8px]
                font-mono
                uppercase
                tracking-widest
                text-slate-600
              "
            >
              Last 30 days · {totalCount} events
            </p>

          </div>


          <button
            onClick={onClose}
            className="
              rounded-xl
              border
              border-white/5
              p-2
              text-slate-500
              transition
              hover:bg-white/5
              hover:text-white
            "
          >
            <X className="h-4 w-4" />
          </button>

        </div>


        {/* FILTERS */}

        <div
          className="
            flex
            flex-wrap
            gap-2
            border-b
            border-white/5
            px-5
            py-3
          "
        >

          {[
            ["all", "All"],
            ["ignition", "Ignition"],
            ["battery", "Battery"],
            ["alerts", "Alerts"],
          ].map(
            ([value, label]) => (

              <button
                key={value}
                onClick={() =>
                  setFilter(value)
                }
                className={`
                  rounded-lg
                  border
                  px-3
                  py-1.5
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-wider
                  transition
                  ${
                    filter === value
                      ? `
                        border-indigo-500/30
                        bg-indigo-500/10
                        text-indigo-400
                      `
                      : `
                        border-white/5
                        bg-white/[0.02]
                        text-slate-600
                        hover:text-slate-300
                      `
                  }
                `}
              >
                {label}
              </button>

            )
          )}

        </div>


        {/* EVENTS */}

        <div
          className="
            flex-1
            overflow-y-auto
            p-5
          "
        >

          {loading && (
            <div
              className="
                py-12
                text-center
                text-[9px]
                font-mono
                text-slate-600
              "
            >
              Loading activity...
            </div>
          )}


          {error && (
            <div
              className="
                rounded-xl
                border
                border-red-500/20
                bg-red-500/[0.04]
                p-5
                text-center
                text-[9px]
                text-red-400
              "
            >
              {error}
            </div>
          )}


          {!loading &&
            !error &&
            filteredEvents.length === 0 && (
              <div
                className="
                  py-12
                  text-center
                  text-[9px]
                  font-mono
                  text-slate-600
                "
              >
                No events found for this filter.
              </div>
            )}


          <div className="space-y-2">

            {filteredEvents.map(
              (event, index) => (
                <EventRow
                  key={
                    event?.packetId ||
                    `${event?.createdAt}-${index}`
                  }
                  event={event}
                />
              )
            )}

          </div>

        </div>


        {/* PAGINATION */}

        <div
          className="
            flex
            items-center
            justify-between
            border-t
            border-white/5
            px-5
            py-3
          "
        >

          <span
            className="
              text-[8px]
              font-mono
              text-slate-600
            "
          >
            Page {page} / {totalPages}
          </span>


          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <button
              disabled={
                loading ||
                page <= 1
              }
              onClick={() =>
                loadPage(page - 1)
              }
              className="
                rounded-lg
                border
                border-white/5
                p-2
                text-slate-500
                hover:bg-white/5
                disabled:opacity-20
              "
            >
              <ChevronLeft
                className="h-4 w-4"
              />
            </button>


            <button
              disabled={
                loading ||
                page >= totalPages
              }
              onClick={() =>
                loadPage(page + 1)
              }
              className="
                rounded-lg
                border
                border-white/5
                p-2
                text-slate-500
                hover:bg-white/5
                disabled:opacity-20
              "
            >
              <ChevronRight
                className="h-4 w-4"
              />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


// =====================================================
// MAIN COMPONENT
// =====================================================

export default function VehicleActivity() {

  const [events, setEvents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [showHistory, setShowHistory] =
    useState(false);

  const [lastRefresh, setLastRefresh] =
    useState(null);


  async function loadRecentEvents() {

    try {

      setError(null);

      const response =
        await vehicleApi.getAlerts(
          1,
          8
        );


      const result =
        response?.data?.getAlertLogsByImei;


      setEvents(
        result?.data || []
      );


      setLastRefresh(
        new Date()
      );

    } catch (err) {

      console.error(
        "Vehicle activity error:",
        err
      );

      setError(
        err.message ||
        "Unable to load vehicle activity"
      );

    } finally {

      setLoading(false);
    }
  }


  useEffect(() => {

    loadRecentEvents();

    const timer =
      setInterval(
        loadRecentEvents,
        30000
      );

    return () =>
      clearInterval(timer);

  }, []);


  const latestIgnition =
    useMemo(
      () =>
        events.find(
          isIgnition
        ),
      [events]
    );


  const bikeIsOn =
    isIgnitionOn(
      latestIgnition
    );


  return (
    <>
      <GlassCard
        className="p-5"
        hover={false}
      >

        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <div
              className="
                rounded-lg
                bg-indigo-500/10
                p-2
              "
            >
              <Activity
                className="
                  h-4
                  w-4
                  text-indigo-400
                "
              />
            </div>


            <div>

              <h3
                className="
                  text-sm
                  font-bold
                  uppercase
                  tracking-widest
                  text-slate-200
                "
              >
                Vehicle Activity
              </h3>

              <p
                className="
                  mt-0.5
                  text-[7px]
                  font-mono
                  uppercase
                  tracking-widest
                  text-slate-600
                "
              >
                Recent system events
              </p>

            </div>

          </div>


          <button
            onClick={() =>
              setShowHistory(true)
            }
            className="
              rounded-lg
              border
              border-indigo-500/20
              bg-indigo-500/[0.06]
              px-3
              py-1.5
              text-[7px]
              font-bold
              uppercase
              tracking-widest
              text-indigo-400
              transition
              hover:bg-indigo-500/10
            "
          >
            View All
          </button>

        </div>


        {/* CURRENT STATUS */}

        <div
          className={`
            mt-5
            rounded-2xl
            border
            p-4
            ${
              bikeIsOn
                ? `
                  border-emerald-500/20
                  bg-emerald-500/[0.04]
                `
                : `
                  border-white/5
                  bg-black/20
                `
            }
          `}
        >

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <Power
                className={`
                  h-5
                  w-5
                  ${
                    bikeIsOn
                      ? "text-emerald-400"
                      : "text-slate-500"
                  }
                `}
              />

              <div>

                <div
                  className="
                    text-[7px]
                    font-bold
                    uppercase
                    tracking-widest
                    text-slate-600
                  "
                >
                  Latest ignition
                </div>

                <div
                  className={`
                    mt-1
                    text-base
                    font-black
                    ${
                      bikeIsOn
                        ? "text-emerald-400"
                        : "text-slate-300"
                    }
                  `}
                >
                  {bikeIsOn
                    ? "BIKE IS ON"
                    : "BIKE IS OFF"}
                </div>

              </div>

            </div>


            <div
              className="
                text-right
              "
            >

              <div
                className="
                  text-[8px]
                  font-mono
                  text-slate-400
                "
              >
                {formatTime(
                  latestIgnition?.createdAt
                )}
              </div>

              <div
                className="
                  mt-0.5
                  text-[7px]
                  font-mono
                  text-slate-700
                "
              >
                {formatDate(
                  latestIgnition?.createdAt
                )}
              </div>

            </div>

          </div>

        </div>


        {/* RECENT EVENTS */}

        <div className="mt-5">

          <div
            className="
              mb-3
              flex
              items-center
              justify-between
            "
          >

            <span
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-widest
                text-slate-600
              "
            >
              Recent Events
            </span>


            <button
              onClick={loadRecentEvents}
              disabled={loading}
              className="
                flex
                items-center
                gap-1.5
                text-[7px]
                font-bold
                uppercase
                tracking-widest
                text-slate-600
                hover:text-slate-300
                disabled:opacity-30
              "
            >
              <RefreshCw
                className={`
                  h-3
                  w-3
                  ${
                    loading
                      ? "animate-spin"
                      : ""
                  }
                `}
              />
              Refresh
            </button>

          </div>


          {error && (
            <div
              className="
                rounded-xl
                border
                border-red-500/20
                bg-red-500/[0.04]
                p-4
                text-[8px]
                text-red-400
              "
            >
              {error}
            </div>
          )}


          {!error && (
            <div className="space-y-2">

              {events
                .slice(0, 5)
                .map(
                  (event, index) => (
                    <EventRow
                      key={`${event.packetId || "event"}-${event.createdAt || "time"}-${index}`}
                      event={event}
                    />
                  )
                )}

            </div>
          )}

        </div>


        {/* FOOTER */}

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
            ALERT STREAM
          </span>

          <span
            className="
              text-[7px]
              font-mono
              text-slate-700
            "
          >
            {lastRefresh
              ? `SYNC ${lastRefresh.toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }
                )}`
              : "NOT SYNCED"}
          </span>

        </div>

      </GlassCard>


      {/* HISTORY MODAL */}

      {showHistory && (
        <ActivityHistory
          onClose={() =>
            setShowHistory(false)
          }
        />
      )}
    </>
  );
}