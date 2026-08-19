import { useState } from "react";
import {
  ShieldCheck,
  Smartphone,
  ArrowRight,
  Loader2,
  LogIn,
} from "lucide-react";

import {
  sendOtp,
  verifyOtp,
} from "../../services/authApi";


export default function Login({
  onLogin,
}) {

  const [mobileNumber, setMobileNumber] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [otpSent, setOtpSent] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // =====================================================
  // SEND OTP
  // =====================================================

  async function handleSendOtp() {

    setError("");


    const mobile =
      mobileNumber.trim();


    if (!mobile) {

      setError(
        "Enter your mobile number."
      );

      return;
    }


    try {

      setLoading(true);


const result =
  await sendOtp(
    mobile
  );


console.log(
  "📱 OTP request successful:",
  result
);


const userId =
  result?.userId;


if (
  !result?.success ||
  !userId
) {

  throw new Error(
    result?.error ||
    "Unable to send OTP."
  );

}

      // Save the user ID temporarily.
      //
      // We will use this after OTP verification.

      localStorage.setItem(
        "oben_pending_user_id",
        userId
      );


      localStorage.setItem(
        "oben_user_mobile",
        mobile
      );


      setOtpSent(true);


    } catch (error) {

      console.error(
        "❌ Send OTP failed:",
        error
      );


      setError(
        error?.response?.data?.error ||
        error?.message ||
        "Failed to send OTP."
      );


    } finally {

      setLoading(false);

    }

  }


  // =====================================================
  // VERIFY OTP
  // =====================================================

  async function handleVerifyOtp() {

    setError("");


    const mobile =
      mobileNumber.trim();


    const enteredOtp =
      otp.trim();


    if (!enteredOtp) {

      setError(
        "Enter the OTP."
      );

      return;
    }


    try {

      setLoading(true);


      // =================================================
      // THIS IS WHERE YOUR SNIPPET GOES
      // =================================================
const result =
  await verifyOtp(
    mobile,
    enteredOtp
  );


console.log(
  "🔐 OTP verification successful:",
  result
);


const token =
  result?.accessToken;


if (
  !result?.success ||
  !token
) {

  throw new Error(
    result?.error ||
    "No access token received."
  );

}


      // =================================================
      // GET USER ID
      // =================================================

      const userId =
        localStorage.getItem(
          "oben_pending_user_id"
        );


      if (!userId) {

        throw new Error(
          "User ID missing. Please request OTP again."
        );

      }


      // =================================================
      // SAVE LOGIN SESSION
      // =================================================

      localStorage.setItem(
        "oben_access_token",
        token
      );


      localStorage.setItem(
        "oben_user_id",
        userId
      );


      localStorage.setItem(
        "oben_user_mobile",
        mobile
      );


      // Pending ID is no longer needed.

      localStorage.removeItem(
        "oben_pending_user_id"
      );


      console.log(
        "✅ Customer authenticated successfully."
      );


      // =================================================
      // TELL APP LOGIN IS COMPLETE
      // =================================================

      if (onLogin) {

        await onLogin({
          token,
          userId,
          mobile,
        });

      }


    } catch (error) {

      console.error(
        "❌ OTP verification failed:",
        error
      );


      setError(
        error?.response?.data?.error ||
        error?.message ||
        "Invalid OTP."
      );


    } finally {

      setLoading(false);

    }

  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div
      className="
        min-h-screen
        bg-[#050505]
        text-slate-100
        flex
        items-center
        justify-center
        p-6
      "
    >

      <div
        className="
          fixed
          inset-0
          pointer-events-none
          overflow-hidden
        "
      >

        <div
          className="
            absolute
            top-[-15%]
            left-[-10%]
            w-[500px]
            h-[500px]
            rounded-full
            bg-indigo-900/30
            blur-[140px]
          "
        />

        <div
          className="
            absolute
            bottom-[-15%]
            right-[-10%]
            w-[500px]
            h-[500px]
            rounded-full
            bg-emerald-900/20
            blur-[140px]
          "
        />

      </div>


      <div
        className="
          relative
          z-10
          w-full
          max-w-md
          rounded-3xl
          border
          border-white/10
          bg-white/[0.035]
          backdrop-blur-xl
          shadow-2xl
          p-8
        "
      >

        {/* HEADER */}

        <div
          className="
            flex
            flex-col
            items-center
            text-center
            mb-8
          "
        >

          <div
            className="
              w-14
              h-14
              rounded-2xl
              bg-indigo-500/15
              border
              border-indigo-500/20
              flex
              items-center
              justify-center
              mb-4
            "
          >

            <ShieldCheck
              className="
                w-7
                h-7
                text-indigo-400
              "
            />

          </div>


          <h1
            className="
              text-xl
              font-bold
              tracking-wide
            "
          >
            RORR TELEMATICS
          </h1>

 
          <p
            className="
              mt-2
              text-xs
              text-slate-500
              font-mono
            "
          >
            CUSTOMER AUTHENTICATION 
          </p>
          <p
            className="
              mt-2
              text-xs
              text-slate-500
              font-mono
            "
          >
            Developed by Saksham Talwar
          </p>

        </div>


        {/* MOBILE NUMBER */}

        <label
          className="
            block
            text-[9px]
            font-bold
            uppercase
            tracking-widest
            text-slate-500
            mb-2
          "
        >
          Mobile Number
        </label>


        <div
          className="
            flex
            items-center
            gap-3
            rounded-xl
            border
            border-white/10
            bg-black/30
            px-4
            py-3
          "
        >

          <Smartphone
            className="
              w-4
              h-4
              text-slate-500
            "
          />


          <input
            type="tel"
            value={mobileNumber}
            onChange={(event) =>
              setMobileNumber(
                event.target.value
              )
            }
            placeholder="Enter mobile number"
            disabled={otpSent || loading}
            className="
              flex-1
              bg-transparent
              outline-none
              text-sm
              text-slate-200
              placeholder:text-slate-700
            "
          />

        </div>


        {/* OTP */}

        {otpSent && (

          <div className="mt-5">

            <label
              className="
                block
                text-[9px]
                font-bold
                uppercase
                tracking-widest
                text-slate-500
                mb-2
              "
            >
              Verification Code
            </label>


            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(event) =>
                setOtp(
                  event.target.value
                    .replace(/\D/g, "")
                )
              }
              placeholder="Enter OTP"
              disabled={loading}
              className="
                w-full
                rounded-xl
                border
                border-white/10
                bg-black/30
                px-4
                py-3
                outline-none
                text-center
                text-lg
                tracking-[0.5em]
                font-mono
                text-slate-200
                placeholder:text-slate-700
              "
            />

          </div>

        )}


        {/* ERROR */}

        {error && (

          <div
            className="
              mt-4
              rounded-xl
              border
              border-red-500/20
              bg-red-500/10
              px-4
              py-3
              text-xs
              text-red-400
            "
          >
            {error}
          </div>

        )}


        {/* BUTTON */}

        <button
          type="button"
          onClick={
            otpSent
              ? handleVerifyOtp
              : handleSendOtp
          }
          disabled={loading}
          className="
            mt-6
            w-full
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-indigo-500
            hover:bg-indigo-400
            disabled:opacity-50
            disabled:cursor-not-allowed
            px-4
            py-3
            text-sm
            font-bold
            text-white
            transition
          "
        >

          {loading ? (

            <Loader2
              className="
                w-4
                h-4
                animate-spin
              "
            />

          ) : otpSent ? (

            <>

              <LogIn
                className="
                  w-4
                  h-4
                "
              />

              Verify & Continue

            </>

          ) : (

            <>

              <ArrowRight
                className="
                  w-4
                  h-4
                "
              />

              Send OTP

            </>

          )}

        </button>


        {/* CHANGE NUMBER */}

        {otpSent && !loading && (

          <button
            type="button"
            onClick={() => {

              setOtpSent(false);
              setOtp("");
              setError("");

              localStorage.removeItem(
                "oben_pending_user_id"
              );

            }}
            className="
              mt-4
              w-full
              text-[10px]
              text-slate-600
              hover:text-slate-400
              transition
            "
          >
            Change mobile number
          </button>

        )}

      </div>

    </div>

  );

}