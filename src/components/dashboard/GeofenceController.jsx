import {
  MapPin,
  ShieldCheck,
  ShieldOff,
  Save,
  Crosshair,
} from "lucide-react";


import GlassCard from "../common/GlassCard";


export default function GeofenceController({
  geofence,
  onChange,
  onToggle,
  onSave,
  onUseBikeLocation,
  saving = false,
}) {

  const radius =
    Number(geofence?.radius) || 500;

  const enabled =
    Boolean(geofence?.enabled);


  function handleRadiusChange(event) {
    const newRadius =
      Number(event.target.value);

    onChange({
      ...geofence,
      radius: newRadius,
    });
  }


  return (

    <GlassCard
      className="p-6"
      hover={false}
    >



      <div
        className="
          flex
          items-center
          justify-between
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
              rounded-lg
              bg-rose-500/10
              p-2
            "
          >



            <MapPin
              className="h-4 w-4 text-rose-400"
            />

          </div>


          <div>
            <h3
              className="text-sm font-bold uppercase tracking-widest text-slate-200"
            >
              Geofence Controller
            </h3>

            <p
              className="mt-1 text-xs font-mono uppercase tracking-wider text-slate-500"
            >
              Vehicle boundary protection
            </p>

          </div>



        </div>



        <div>
          {enabled ? "ARMED" : "OFF"}
        </div>



      </div>




      <div
        className="mb-5 rounded-xl border border-white/5 bg-black/20 p-3"
      >



        <div
          className="flex items-center justify-between"
        >



          <div>
            <div
              className="text-xs font-bold uppercase tracking-widest text-slate-500"
            >
              Fence center
            </div>



            <div className="mt-1 font-mono text-sm text-slate-400">



              {Number.isFinite(Number(geofence?.lat)) &&
              Number.isFinite(Number(geofence?.lng))
                ? `${Number(geofence.lat).toFixed(4)}, ${Number(
                    geofence.lng
                  ).toFixed(4)}`
                : "Location not selected"}



            </div>



          </div>



          <button
            type="button"
            onClick={onUseBikeLocation}
            disabled={saving}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-blue-300 transition hover:bg-blue-500/15 disabled:opacity-40"
          >



            <Crosshair className="h-3 w-3" />



            Bike

          </button>

        </div>



      </div>




      <div>

        <div
          className="flex items-end justify-between mb-3"
        >



          <div>
            <div
              className="text-xs font-bold uppercase tracking-widest text-slate-500"
            >
              Fence radius
            </div>



            <div className="mt-1 font-medium text-base text-slate-200">



              {radius >= 1000
                ? `${(radius / 1000).toFixed(1)} km`
                : `${radius} m`}



            </div>



          </div>


          <div>{radius}m</div>

        </div>




        <input
          type="range"
          min="50"
          max="5000"
          step="50"
          value={radius}
          onChange={handleRadiusChange}
          disabled={saving}
          className="w-full accent-indigo-500 cursor-pointer disabled:opacity-40 rounded-full h-4"
        />


        <div
          className="mt-2 flex justify-between text-xs font-mono text-slate-600"
        >



          <span>50 M</span>
          <span>1 KM</span>
          <span>2.5 KM</span>
          <span>5 KM</span>

        </div>

      </div>




      <div className="mt-6 gap-3">



        <button
          type="button"
          onClick={onToggle}
          disabled={saving}
          className="
            rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-wider
            transition-all
            duration-200
            ease-in-out
            border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/15
          "
        >



          {enabled ? (
            <>
              <ShieldOff className="h-3.5 w-3.5" /> Disarm
            </>
          ) : (
            <>
              <ShieldCheck className="h-3.5 w-3.5" /> Arm
            </>
          )}



        </button>



        <button
          type="button"
          onClick={onUseBikeLocation}
          disabled={saving}
          className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 ease-in-out hover:bg-blue-500/15"
        >



          <Crosshair className="h-3.5 w-3.5" /> Locate

        </button>


        <Save
          className="h-3.5 w-3.5 animate-pulse"
        /> Saving

      </div>




      <div
        className="mt-5 rounded-xl border border-white/5 bg-black/20 p-3"
      >



        <div
          className="flex items-center justify-between"
        >



          <span
            className="text-xs font-bold uppercase tracking-widest text-slate-600"
          >
            Protection status
          </span>


          {enabled ? (
            <span
              className="text-emerald-400"
            >
              ACTIVE · {radius}M
            </span>
          ) : (
            <span
              className="text-slate-500"
            >
              DISABLED
            </span>
          )}



        </div>

        {enabled && (
          <p
            className="mt-2 text-xs font-mono leading-relaxed text-slate-600"
          >
            Move the fence center directly on the map or use
            the bike's current location. Save to apply changes.
          </p>

        )}



      </div>

    </GlassCard>
  );
}