import {
  Wrench,
  Plus,
  Check,
  AlertTriangle,
  Disc3,
  CircleGauge,
  Battery,
  Calendar,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import GlassCard from "../common/GlassCard";


const STORAGE_KEY =
  "rorr_maintenance_tracker";


const DEFAULT_MAINTENANCE = {

  lastServiceKm: 0,

  lastServiceDate: "",

  nextServiceKm: 0,

  nextServiceDate: "",

  belt: "good",

  brakes: "good",

  tyres: "good",

  battery: "good",

  notes: "",

  history: [],

};


function getStoredMaintenance() {

  try {

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!saved) {
      return DEFAULT_MAINTENANCE;
    }


    return {
      ...DEFAULT_MAINTENANCE,
      ...JSON.parse(saved),
    };

  } catch {

    return DEFAULT_MAINTENANCE;

  }

}


function getStatusStyle(status) {

  if (status === "attention") {

    return `
      border-orange-500/20
      bg-orange-500/10
      text-orange-300
    `;

  }


  if (status === "replace") {

    return `
      border-red-500/20
      bg-red-500/10
      text-red-400
    `;

  }


  return `
    border-emerald-500/20
    bg-emerald-500/10
    text-emerald-400
  `;

}


function getStatusText(status) {

  if (status === "attention") {
    return "CHECK";
  }


  if (status === "replace") {
    return "REPLACE";
  }


  return "GOOD";

}


function MaintenanceItem({
  icon: Icon,
  title,
  status,
  onChange,
}) {

  return (

    <div
      className="
        flex
        items-center
        justify-between
        gap-3
        rounded-xl
        border
        border-white/5
        bg-black/15
        p-3
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
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            bg-white/5
          "
        >

          <Icon
            className="
              h-3.5
              w-3.5
              text-slate-400
            "
          />

        </div>


        <span
          className="
            text-[9px]
            font-medium
            text-slate-300
          "
        >
          {title}
        </span>

      </div>


      <select
        value={status}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className={`
          rounded-lg
          border
          px-2
          py-1.5
          text-[7px]
          font-bold
          outline-none
          cursor-pointer
          ${getStatusStyle(status)}
        `}
      >

        <option value="good">
          GOOD
        </option>

        <option value="attention">
          CHECK
        </option>

        <option value="replace">
          REPLACE
        </option>

      </select>

    </div>

  );

}


export default function MaintenanceTracker({
  odometer = 0,
}) {

  const [
    maintenance,
    setMaintenance,
  ] = useState(
    getStoredMaintenance
  );


  const [
    addingService,
    setAddingService,
  ] = useState(false);


  const [
    serviceKm,
    setServiceKm,
  ] = useState("");


  const [
    serviceNote,
    setServiceNote,
  ] = useState("");


  // =============================================
  // SAVE LOCALLY
  // =============================================

  useEffect(() => {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(maintenance)
    );

  }, [
    maintenance,
  ]);


  const currentKm =
    Number(odometer) || 0;


  const nextServiceKm =
    Number(
      maintenance.nextServiceKm
    ) || 0;


  const kmRemaining =
    nextServiceKm > 0
      ? nextServiceKm - currentKm
      : null;


  const overdue =
    kmRemaining !== null &&
    kmRemaining < 0;


  const attentionCount =
    [
      maintenance.belt,
      maintenance.brakes,
      maintenance.tyres,
      maintenance.battery,
    ].filter(
      (status) =>
        status !== "good"
    ).length;


  function updateField(
    field,
    value
  ) {

    setMaintenance(
      (previous) => ({

        ...previous,

        [field]: value,

      })
    );

  }


  function addServiceRecord() {

    const numericKm =
      Number(serviceKm) ||
      currentKm;


    if (
      !Number.isFinite(
        numericKm
      )
    ) {

      return;

    }


    const newRecord = {

      id:
        Date.now(),

      date:
        new Date()
          .toISOString(),

      km:
        numericKm,

      note:
        serviceNote ||
        "General maintenance service",

    };


    const nextDue =
      numericKm + 5000;


    setMaintenance(
      (previous) => ({

        ...previous,

        lastServiceKm:
          numericKm,

        lastServiceDate:
          newRecord.date,

        nextServiceKm:
          nextDue,

        history: [
          newRecord,
          ...previous.history,
        ],

      })
    );


    setServiceKm("");
    setServiceNote("");
    setAddingService(false);

  }


  function removeRecord(id) {

    setMaintenance(
      (previous) => ({

        ...previous,

        history:
          previous.history.filter(
            (record) =>
              record.id !== id
          ),

      })
    );

  }


  return (

    <GlassCard
      className="p-6"
      hover={false}
    >

      {/* =============================================
          HEADER
      ============================================== */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
          mb-6
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
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              border
              border-orange-500/20
              bg-orange-500/10
            "
          >

            <Wrench
              className="
                h-5
                w-5
                text-orange-300
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
              Maintenance Tracker
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
              Vehicle health & service records
            </p>

          </div>

        </div>


        <div
          className={`
            flex
            items-center
            gap-1.5
            rounded-full
            border
            px-2.5
            py-1
            text-[7px]
            font-bold
            uppercase
            tracking-widest
            ${
              attentionCount > 0
                ? `
                  border-orange-500/20
                  bg-orange-500/10
                  text-orange-300
                `
                : `
                  border-emerald-500/20
                  bg-emerald-500/5
                  text-emerald-400
                `
            }
          `}
        >

          {attentionCount > 0 ? (

            <AlertTriangle
              className="
                h-3
                w-3
              "
            />

          ) : (

            <Check
              className="
                h-3
                w-3
              "
            />

          )}

          {attentionCount > 0
            ? `${attentionCount} CHECK`
            : "HEALTHY"}

        </div>

      </div>


      {/* =============================================
          SERVICE OVERVIEW
      ============================================== */}

      <div
        className="
          grid
          grid-cols-3
          gap-3
          mb-5
        "
      >

        <div
          className="
            rounded-xl
            border
            border-white/5
            bg-black/20
            p-3
          "
        >

          <div
            className="
              text-[7px]
              font-bold
              uppercase
              tracking-widest
              text-slate-600
            "
          >
            Odometer
          </div>


          <div
            className="
              mt-2
              text-sm
              font-mono
              font-bold
              text-slate-200
            "
          >
            {Math.round(
              currentKm
            ).toLocaleString()}
          </div>


          <div
            className="
              mt-1
              text-[7px]
              font-mono
              text-slate-600
            "
          >
            KM
          </div>

        </div>


        <div
          className="
            rounded-xl
            border
            border-white/5
            bg-black/20
            p-3
          "
        >

          <div
            className="
              text-[7px]
              font-bold
              uppercase
              tracking-widest
              text-slate-600
            "
          >
            Last Service
          </div>


          <div
            className="
              mt-2
              text-sm
              font-mono
              font-bold
              text-slate-200
            "
          >
            {maintenance.lastServiceKm
              ? Math.round(
                  maintenance.lastServiceKm
                ).toLocaleString()
              : "—"}
          </div>


          <div
            className="
              mt-1
              text-[7px]
              font-mono
              text-slate-600
            "
          >
            KM
          </div>

        </div>


        <div
          className="
            rounded-xl
            border
            border-white/5
            bg-black/20
            p-3
          "
        >

          <div
            className="
              text-[7px]
              font-bold
              uppercase
              tracking-widest
              text-slate-600
            "
          >
            Next Service
          </div>


          <div
            className={`
              mt-2
              text-sm
              font-mono
              font-bold
              ${
                overdue
                  ? "text-red-400"
                  : "text-slate-200"
              }
            `}
          >
            {nextServiceKm
              ? nextServiceKm.toLocaleString()
              : "—"}
          </div>


          <div
            className="
              mt-1
              text-[7px]
              font-mono
              text-slate-600
            "
          >
            KM
          </div>

        </div>

      </div>


      {/* =============================================
          SERVICE STATUS
      ============================================== */}

      {kmRemaining !== null && (

        <div
          className={`
            mb-5
            rounded-xl
            border
            p-3
            ${
              overdue
                ? `
                  border-red-500/20
                  bg-red-500/5
                `
                : `
                  border-indigo-500/15
                  bg-indigo-500/5
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

            <span
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-widest
                text-slate-500
              "
            >
              Service distance
            </span>


            <span
              className={`
                text-[9px]
                font-mono
                font-bold
                ${
                  overdue
                    ? "text-red-400"
                    : "text-indigo-300"
                }
              `}
            >
              {overdue
                ? `${Math.abs(
                    Math.round(kmRemaining)
                  )} KM OVERDUE`
                : `${Math.round(
                    kmRemaining
                  ).toLocaleString()} KM LEFT`}
            </span>

          </div>

        </div>

      )}


      {/* =============================================
          COMPONENT HEALTH
      ============================================== */}

      <div className="space-y-2">

        <MaintenanceItem
          icon={CircleGauge}
          title="Belt Drive"
          status={maintenance.belt}
          onChange={(value) =>
            updateField(
              "belt",
              value
            )
          }
        />


        <MaintenanceItem
          icon={Disc3}
          title="Brakes"
          status={maintenance.brakes}
          onChange={(value) =>
            updateField(
              "brakes",
              value
            )
          }
        />


        <MaintenanceItem
          icon={CircleGauge}
          title="Tyres"
          status={maintenance.tyres}
          onChange={(value) =>
            updateField(
              "tyres",
              value
            )
          }
        />


        <MaintenanceItem
          icon={Battery}
          title="Battery System"
          status={maintenance.battery}
          onChange={(value) =>
            updateField(
              "battery",
              value
            )
          }
        />

      </div>


      {/* =============================================
          ADD SERVICE
      ============================================== */}

      {!addingService ? (

        <button
          type="button"
          onClick={() =>
            setAddingService(true)
          }
          className="
            mt-5
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-indigo-500/20
            bg-indigo-500/10
            px-4
            py-3
            text-[8px]
            font-bold
            uppercase
            tracking-widest
            text-indigo-300
            transition
            hover:bg-indigo-500/15
          "
        >

          <Plus
            className="
              h-3.5
              w-3.5
            "
          />

          Add Service Record

        </button>

      ) : (

        <div
          className="
            mt-5
            rounded-xl
            border
            border-white/10
            bg-black/20
            p-4
          "
        >

          <input
            type="number"
            value={serviceKm}
            onChange={(event) =>
              setServiceKm(
                event.target.value
              )
            }
            placeholder={`Service KM (${Math.round(
              currentKm
            )})`}
            className="
              w-full
              rounded-lg
              border
              border-white/10
              bg-black/20
              px-3
              py-2.5
              text-[9px]
              text-slate-200
              outline-none
              placeholder:text-slate-700
              focus:border-indigo-500/40
            "
          />


          <textarea
            value={serviceNote}
            onChange={(event) =>
              setServiceNote(
                event.target.value
              )
            }
            placeholder="Service notes..."
            rows="2"
            className="
              mt-2
              w-full
              resize-none
              rounded-lg
              border
              border-white/10
              bg-black/20
              px-3
              py-2.5
              text-[9px]
              text-slate-200
              outline-none
              placeholder:text-slate-700
              focus:border-indigo-500/40
            "
          />


          <div
            className="
              mt-3
              grid
              grid-cols-2
              gap-2
            "
          >

            <button
              type="button"
              onClick={() =>
                setAddingService(false)
              }
              className="
                rounded-lg
                border
                border-white/10
                px-3
                py-2.5
                text-[8px]
                font-bold
                uppercase
                text-slate-500
              "
            >
              Cancel
            </button>


            <button
              type="button"
              onClick={addServiceRecord}
              className="
                rounded-lg
                border
                border-emerald-500/20
                bg-emerald-500/10
                px-3
                py-2.5
                text-[8px]
                font-bold
                uppercase
                text-emerald-400
              "
            >
              Save Service
            </button>

          </div>

        </div>

      )}


      {/* =============================================
          HISTORY
      ============================================== */}

      {maintenance.history.length > 0 && (

        <div
          className="
            mt-5
            border-t
            border-white/5
            pt-5
          "
        >

          <div
            className="
              mb-3
              flex
              items-center
              gap-2
            "
          >

            <Calendar
              className="
                h-3.5
                w-3.5
                text-slate-500
              "
            />

            <span
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-widest
                text-slate-500
              "
            >
              Recent Services
            </span>

          </div>


          <div className="space-y-2">

            {maintenance.history
              .slice(0, 5)
              .map((record) => (

                <div
                  key={record.id}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-xl
                    border
                    border-white/5
                    bg-black/10
                    px-3
                    py-2.5
                  "
                >

                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >

                    <div
                      className="
                        truncate
                        text-[8px]
                        text-slate-300
                      "
                    >
                      {record.note}
                    </div>


                    <div
                      className="
                        mt-1
                        text-[7px]
                        font-mono
                        text-slate-600
                      "
                    >
                      {new Date(
                        record.date
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                      {" • "}
                      {Number(
                        record.km
                      ).toLocaleString()} KM
                    </div>

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      removeRecord(
                        record.id
                      )
                    }
                    className="
                      text-slate-700
                      transition
                      hover:text-red-400
                    "
                  >

                    <Trash2
                      className="
                        h-3.5
                        w-3.5
                      "
                    />

                  </button>

                </div>

              ))}

          </div>

        </div>

      )}

    </GlassCard>

  );

}