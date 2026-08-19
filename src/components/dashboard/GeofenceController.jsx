import {
  MapPin,
  ShieldCheck,
  ShieldOff,
  Save,
} from "lucide-react";

import GlassCard from "../common/GlassCard";


export default function GeofenceController({
  geofence,
  onChange,
  onToggle,
  onSave,
  saving = false,
}) {

  const radius =
    Number(geofence?.radius) || 500;

  const enabled =
    Boolean(geofence?.enabled);


  return (

    <GlassCard
      className="p-6"
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
              rounded-lg
              bg-rose-500/10
              p-2
            "
          >

            <MapPin
              className="
                h-4
                w-4
                text-rose-400
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
              Geofence Controller
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
              Vehicle boundary protection
            </p>

          </div>

        </div>


        {/* STATUS LIGHT */}

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
              enabled
                ? `
                  border-emerald-500/20
                  bg-emerald-500/5
                  text-emerald-400
                `
                : `
                  border-white/5
                  bg-white/[0.02]
                  text-slate-600
                `
            }
          `}
        >

          <span
            className={`
              h-1.5
              w-1.5
              rounded-full
              ${
                enabled
                  ? "bg-emerald-400"
                  : "bg-slate-600"
              }
            `}
          />

          {enabled
            ? "ARMED"
            : "OFF"}

        </div>

      </div>


      {/* =================================================
          RADIUS
      ================================================= */}

      <div>

        <div
          className="
            flex
            items-end
            justify-between
            mb-3
          "
        >

          <div>

            <div
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-widest
                text-slate-600
              "
            >
              Fence radius
            </div>

            <div
              className="
                mt-1
                font-mono
                text-xl
                font-bold
                text-slate-200
              "
            >
              {radius >= 1000
                ? `${(radius / 1000).toFixed(2)} km`
                : `${radius} m`}
            </div>

          </div>


          <div
            className="
              text-[8px]
              font-mono
              text-slate-600
            "
          >
            {radius}m
          </div>

        </div>


        <input
          type="range"
          min="50"
          max="5000"
          step="50"
          value={radius}
          onChange={(event) =>
            onChange(
              Number(
                event.target.value
              )
            )
          }
          className="
            w-full
            accent-indigo-500
            cursor-pointer
          "
        />


        <div
          className="
            mt-2
            flex
            justify-between
            text-[8px]
            font-mono
            text-slate-700
          "
        >

          <span>50 M</span>

          <span>1 KM</span>

          <span>2.5 KM</span>

          <span>5 KM</span>

        </div>

      </div>


      {/* =================================================
          CONTROLS
      ================================================= */}

      <div
        className="
          mt-7
          grid
          grid-cols-2
          gap-3
        "
      >

        <button
          type="button"
          onClick={onToggle}
          disabled={saving}
          className={`
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            px-4
            py-3
            text-[8px]
            font-bold
            uppercase
            tracking-widest
            transition
            disabled:cursor-not-allowed
            disabled:opacity-40
            ${
              enabled
                ? `
                  border-red-500/20
                  bg-red-500/10
                  text-red-400
                  hover:bg-red-500/15
                `
                : `
                  border-emerald-500/20
                  bg-emerald-500/10
                  text-emerald-400
                  hover:bg-emerald-500/15
                `
            }
          `}
        >

          {enabled ? (
            <>
              <ShieldOff
                className="h-3.5 w-3.5"
              />
              Disarm
            </>
          ) : (
            <>
              <ShieldCheck
                className="h-3.5 w-3.5"
              />
              Arm Fence
            </>
          )}

        </button>


        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="
            flex
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
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >

          <Save
            className={`
              h-3.5
              w-3.5
              ${
                saving
                  ? "animate-pulse"
                  : ""
              }
            `}
          />

          {saving
            ? "Saving..."
            : "Save Fence"}

        </button>

      </div>


      {/* =================================================
          STATUS
      ================================================= */}

      <div
        className="
          mt-5
          rounded-xl
          border
          border-white/5
          bg-black/20
          p-3
        "
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
              text-[7px]
              font-bold
              uppercase
              tracking-widest
              text-slate-700
            "
          >
            Protection status
          </span>

          <span
            className={`
              text-[8px]
              font-mono
              font-bold
              ${
                enabled
                  ? "text-emerald-400"
                  : "text-slate-500"
              }
            `}
          >
            {enabled
              ? `ACTIVE · ${radius}M`
              : "DISABLED"}
          </span>

        </div>


        {enabled && (
          <p
            className="
              mt-2
              text-[7px]
              font-mono
              leading-relaxed
              text-slate-700
            "
          >
            Vehicle movement outside this
            boundary can be detected by the
            geofence system.
          </p>
        )}

      </div>

    </GlassCard>

  );
}