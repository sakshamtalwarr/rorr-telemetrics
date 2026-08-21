import {
  User,
  Phone,
  Mail,
  Car,
  Hash,
  ShieldCheck,
  Calendar,
  Smartphone,
  LogOut,
} from "lucide-react";

import GlassCard from "../common/GlassCard";


export default function ProfilePanel({
  profile,
  onLogout,
}) {

  // =====================================================
  // PROFILE DATA
  // =====================================================

  const firstName =
    profile?.firstName ||
    "";

  const lastName =
    profile?.lastName ||
    "";

  const fullName =
    `${firstName} ${lastName}`.trim() ||
    profile?.name ||
    "Rorr Rider";


  const mobileNumber =
    profile?.mobileNumber ||
    "Not available";


  const email =
    profile?.email ||
    "Not available";


  // =====================================================
  // VEHICLE DATA
  // =====================================================

  const vehicle =
    profile?.vehicleDetails ||
    {};


  const vin =
    vehicle?.VIN ||
    "Not available";


  const imei =
    vehicle?.IMEI ||
    "Not available";


  const registrationNumber =
    profile?.customerDetails?.registrationNumber ||
    "Not available";


  // =====================================================
  // CUSTOMER DETAILS
  // =====================================================

  const customer =
    profile?.customerDetails ||
    {};


  const insuranceExpiry =
    customer?.insuranceExpDate ||
    "Not available";


  const packageExpiry =
    customer?.pkgExpDate ||
    "Not available";


  const profileImage =
    customer?.profileImage;


  // =====================================================
  // DATE FORMATTER
  // =====================================================

  function formatDate(value) {

    if (!value) {
      return "Not available";
    }


    try {

      // API may return timestamps as strings/numbers

      const numericValue =
        Number(value);


      const date =
        !Number.isNaN(numericValue) &&
        numericValue > 10000000000
          ? new Date(numericValue)
          : new Date(value);


      if (Number.isNaN(date.getTime())) {
        return String(value);
      }


      return date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

    } catch {

      return String(value);

    }

  }


  // =====================================================
  // PROFILE FIELD COMPONENT
  // =====================================================

  function ProfileField({
    icon: Icon,
    label,
    value,
  }) {

    return (

      <div
        className="
          flex
          items-center
          gap-3
          rounded-xl
          border
          border-white/10
          bg-black/20
          px-4
          py-3
        "
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
            border
            border-indigo-500/20
            bg-indigo-500/10
          "
        >

          <Icon
            className="
              h-4
              w-4
              text-indigo-300
            "
          />

        </div>


        <div className="min-w-0">

          <div
            className="
              text-[7px]
              font-bold
              uppercase
              tracking-[0.2em]
              text-slate-600
            "
          >
            {label}
          </div>


          <div
            className="
              mt-1
              truncate
              text-[10px]
              font-mono
              font-medium
              text-slate-300
            "
            title={String(value)}
          >
            {value}
          </div>

        </div>

      </div>

    );

  }


  // =====================================================
  // COMPONENT
  // =====================================================

  return (

    <GlassCard
      className="p-5 md:p-6"
      hover={false}
    >


      {/* ================================================
          HEADER
      ================================================= */}

      <div
        className="
          mb-5
          flex
          items-center
          justify-between
          gap-4
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
              h-10
              w-10
              items-center
              justify-center
              overflow-hidden
              rounded-xl
              border
              border-indigo-500/30
              bg-indigo-500/10
            "
          >

            {profileImage ? (

              <img
                src={profileImage}
                alt={fullName}
                className="
                  h-full
                  w-full
                  object-cover
                "
              />

            ) : (

              <User
                className="
                  h-5
                  w-5
                  text-indigo-300
                "
              />

            )}

          </div>


          <div>

            <h2
              className="
                text-sm
                font-bold
                uppercase
                tracking-[0.15em]
                text-slate-200
              "
            >
              Rider Profile
            </h2>


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
              Account & Vehicle Identity
            </p>

          </div>

        </div>


        <div
          className="
            rounded-full
            border
            border-emerald-500/20
            bg-emerald-500/5
            px-3
            py-1
            text-[7px]
            font-bold
            uppercase
            tracking-widest
            text-emerald-400
          "
        >
          Active
        </div>

      </div>



      {/* ================================================
          USER IDENTITY
      ================================================= */}

      <div
        className="
          mb-5
          flex
          items-center
          gap-4
          rounded-2xl
          border
          border-white/10
          bg-black/20
          p-4
        "
      >

        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            overflow-hidden
            rounded-full
            border
            border-white/10
            bg-white/5
            text-sm
            font-bold
            text-indigo-300
          "
        >

          {profileImage ? (

            <img
              src={profileImage}
              alt={fullName}
              className="
                h-full
                w-full
                object-cover
              "
            />

          ) : (

            fullName
              .charAt(0)
              .toUpperCase()

          )}

        </div>


        <div className="min-w-0">

          <div
            className="
              truncate
              text-sm
              font-bold
              text-slate-100
            "
          >
            {fullName}
          </div>


          <div
            className="
              mt-1
              text-[7px]
              font-mono
              uppercase
              tracking-widest
              text-slate-600
            "
          >
            Customer · Local Session
          </div>

        </div>

      </div>



      {/* ================================================
          PROFILE DETAILS
      ================================================= */}

      <div
        className="
          grid
          grid-cols-1
          gap-3

          md:grid-cols-2
        "
      >

        <ProfileField
          icon={Phone}
          label="Mobile"
          value={mobileNumber}
        />


        <ProfileField
          icon={Mail}
          label="Email"
          value={email}
        />


        <ProfileField
          icon={Car}
          label="Registration"
          value={registrationNumber}
        />


        <ProfileField
          icon={Hash}
          label="VIN"
          value={vin}
        />


        <ProfileField
          icon={Smartphone}
          label="IMEI"
          value={imei}
        />


        <ProfileField
          icon={ShieldCheck}
          label="Insurance Expires"
          value={formatDate(insuranceExpiry)}
        />


        <ProfileField
          icon={Calendar}
          label="Package Expires"
          value={formatDate(packageExpiry)}
        />

      </div>



      {/* ================================================
          LOGOUT
      ================================================= */}

      <button
        type="button"
        onClick={onLogout}
        className="
          mt-5
          flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-rose-500/25
          bg-rose-500/5
          px-4
          py-3
          text-[8px]
          font-bold
          uppercase
          tracking-widest
          text-rose-400
          transition-all
          duration-300

          hover:bg-rose-500/10
          hover:border-rose-500/40
        "
      >

        <LogOut
          className="
            h-3.5
            w-3.5
          "
        />

        Logout

      </button>


    </GlassCard>

  );

}