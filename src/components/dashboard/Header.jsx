import {
  Activity,
  Cpu,
  Bike,
} from "lucide-react";

export default function Header({
  vehicle,
  connectionStatus,
}) {

  const connected =
    connectionStatus === "Telemetry Active";


  return (
    <header className="
      flex
      flex-col
      md:flex-row
      justify-between
      items-start
      md:items-end
      border-b
      border-white/10
      pb-6
      gap-4
    ">

      <div>

        <div className="
          flex
          items-center
          gap-3
        ">

          <div className="
            p-2.5
            bg-indigo-500/20
            rounded-xl
            border border-indigo-500/30
          ">

            <Bike className="
              w-6 h-6
              text-indigo-400
            " />

          </div>


          <h1 className="
            text-4xl
            font-extrabold
            tracking-tighter
            bg-gradient-to-r
            from-white
            via-slate-200
            to-slate-500
            bg-clip-text
            text-transparent
          ">
            OBEN RORR
          </h1>

        </div>


        <p className="
          text-slate-400
          text-sm
          font-mono
          mt-2
          flex items-center
          gap-2
        ">

          <Cpu className="w-4 h-4" />

          VIN:
          {" "}
          {vehicle?.VIN || "AUTHENTICATING..."}

        </p>

      </div>


      <div className="
        flex items-center
        gap-3
        bg-black/40
        backdrop-blur-xl
        border border-white/10
        px-5 py-2.5
        rounded-2xl
      ">

        <Activity
          className={`
            w-4 h-4
            ${
              connected
                ? "text-emerald-400"
                : "text-rose-400"
            }
          `}
        />

        <span className="
          text-sm
          font-bold
          tracking-wide
          uppercase
        ">
          {connectionStatus}
        </span>

      </div>

    </header>
  );
}