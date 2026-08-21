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
        flex
        flex-col
        gap-5
        border-b
        border-white/10
        pb-6

        md:flex-row
        md:items-end
        md:justify-between
      "
    >


      {/* =================================================
          LOGO + VEHICLE
      ================================================= */}

      <div>

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              rounded-xl
              border
              border-indigo-500/30
              bg-indigo-500/20
              p-2.5
            "
          >

            <Bike
              className="
                h-6
                w-6
                text-indigo-400
              "
            />

          </div>


          <div>

            <h1
              className="
                bg-gradient-to-r
                from-white
                via-slate-200
                to-slate-500
                bg-clip-text
                text-3xl
                font-extrabold
                tracking-tighter
                text-transparent

                sm:text-4xl
              "
            >
              OBEN RORR
            </h1>


            <p
              className="
                mt-1
                text-[9px]
                font-mono
                uppercase
                tracking-[0.25em]
                text-slate-500
              "
            >
              Vehicle Telemetry Dashboard
            </p>

          </div>

        </div>


        <p
          className="
            mt-4
            flex
            items-center
            gap-2
            text-sm
            font-mono
            text-slate-400
          "
        >

          <Cpu
            className="
              h-4
              w-4
            "
          />

          <span className="text-slate-600">
            VIN:
          </span>

          <span>
            {vehicle?.VIN || "AUTHENTICATING..."}
          </span>

        </p>

      </div>



      {/* =================================================
          RIGHT SIDE CONTROLS
      ================================================= */}

      <div
        className="
          flex
          flex-wrap
          items-center
          gap-3
        "
      >


        {/* CONNECTION STATUS */}

        <div
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-white/10
            bg-black/40
            px-4
            py-2.5
            backdrop-blur-xl
          "
        >

          <Activity
            className={`
              h-4
              w-4
              ${
                connected
                  ? "text-emerald-400"
                  : "text-rose-400"
              }
            `}
          />


          <span
            className="
              text-[10px]
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
            flex
            items-center
            gap-2
            rounded-2xl
            border
            border-indigo-500/20
            bg-indigo-500/10
            px-4
            py-2.5
            transition-all
            duration-300

            hover:border-indigo-400/40
            hover:bg-indigo-500/20
            hover:-translate-y-0.5
          "
        >

          <div
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              bg-indigo-500/20
            "
          >

            <User
              className="
                h-3.5
                w-3.5
                text-indigo-300
              "
            />

          </div>


          <div
            className="
              hidden
              text-left

              lg:block
            "
          >

            <div
              className="
                max-w-[120px]
                truncate
                text-[9px]
                font-bold
                uppercase
                tracking-wider
                text-slate-200
              "
            >
              {firstName}
            </div>


            <div
              className="
                text-[7px]
                font-mono
                uppercase
                tracking-wider
                text-slate-600
              "
            >
              My Profile
            </div>

          </div>

        </button>



        {/* LOGOUT BUTTON */}

        <button
          type="button"
          onClick={onLogout}
          className="
            flex
            items-center
            justify-center
            gap-2
            rounded-2xl
            border
            border-rose-500/20
            bg-rose-500/5
            px-4
            py-2.5
            text-rose-400
            transition-all
            duration-300

            hover:-translate-y-0.5
            hover:border-rose-500/40
            hover:bg-rose-500/15
          "
        >

          <LogOut
            className="
              h-4
              w-4
            "
          />

          <span
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-widest
            "
          >
            Logout
          </span>

        </button>


      </div>

    </header>

  );

}