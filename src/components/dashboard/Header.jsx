import {
  Activity,
  Cpu,
  Bike,
  User,
  LogOut,
} from "lucide-react";


export default function Header({
  vehicle,
  connectionStatus,
  profile,
  onProfileClick,
  onLogout,
}) {

  const connected =
    connectionStatus === "Telemetry Active";


  const firstName =
    profile?.firstName ||
    profile?.name ||
    "Profile";


  return (

    <header
      className="
        border-b
        border-white/5
        bg-black/80
        backdrop-blur-xl
        shadow-sm
        flex-col md:flex-row
        items-center justify-between
        py-4 px-6
        gap-6
      "
    >


      {/* =================================================
          LOGO + VEHICLE
      ================================================= */}

      <div className="flex items-center gap-3">

        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/15 p-2.5 flex items-center gap-2">

          <Bike
            className="h-5 w-5 text-indigo-400"
          />

          <div>
            <h1
              className="
                bg-gradient-to-r from-white via-slate-200 to-slate-500
                bg-clip-text text-3xl font-extrabold tracking-tighter
                text-transparent sm:text-4xl
              "
            >
              OBEN RORR
            </h1>

            <p
              className="mt-1 text-[8px] font-mono uppercase tracking-[0.25em] text-slate-400"
            >
              Vehicle Telemetry Dashboard
            </p>
          </div>

        </div>




        <p
          className="hidden md:block text-sm font-mono text-slate-500 uppercase tracking-wider"
        >
          VIN:
        </p>

        <span
          className="ml-2 min-w-[180px] truncate text-[9px] font-medium uppercase tracking-wider text-slate-300"
        >
          {vehicle?.VIN || "AUTHENTICATING..."}
        </span>

      </div>


      {/* =================================================
          RIGHT SIDE CONTROLS
      ================================================= */}

      <div className="flex items-center gap-3">




        {/* CONNECTION STATUS */}

        <div
          className="
            rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 backdrop-blur-xl
            shadow-[0_2px_8px_rgba(34,197,94,0.15)]
          "
        >



          <Activity
            className="h-4 w-4"
          />



          <span
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-wider
              text-slate-300
            "
          >
            {connectionStatus}
          </span>

        </div>




        {/* PROFILE BUTTON */}

        <button
          type="button"
          onClick={onProfileClick}
          className="
            rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-2.5
            flex items-center gap-2
            transition-all
            duration-200
            ease-in-out
            hover:border-indigo-400/40
            hover:bg-indigo-500/15
            hover:-translate-y-0.5
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-indigo-500/50
            focus-visible:ring-opacity-40
          "

        >

          <div
            className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20"
          >



            <User
              className="h-3.5 w-3.5 text-indigo-300"
            />

          </div>


          <span
            className="hidden ml-2 text-[8px] font-bold uppercase tracking-wider text-slate-200"
          >



            {firstName}



          </span>

          <span
            className="ml-2 text-[8px] font-medium uppercase tracking-wider text-slate-400"
          >
            My Profile
          </span>

          <svg
            className="ml-2 h-3.5 w-3.5 opacity-60 transition-transform duration-200"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>

        </button>




        {/* LOGOUT BUTTON */}

        <button
          type="button"
          onClick={onLogout}
          className="
            rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-2.5
            flex items-center gap-2
            transition-all
            duration-200
            ease-in-out
            hover:border-rose-400/50
            hover:bg-rose-400/10
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-rose-500/50
            focus-visible:ring-opacity-40
          "

        >

          <LogOut
            className="h-4 w-4 text-rose-400"
          />

          <span
            className="text-[8px] font-bold uppercase tracking-widest text-rose-400"
          >
            Logout
          </span>

          <svg
            className="-ml-1 h-3.5 w-3.5 opacity-60 transition-transform duration-200"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>

        </button>

      </div>

    </header>

  );
}