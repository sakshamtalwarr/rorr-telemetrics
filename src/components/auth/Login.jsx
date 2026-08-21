import {
  useEffect,
  useState,
} from "react";

import {
  ShieldCheck,
  Smartphone,
  ArrowRight,
  Loader2,
  LogIn,
  CheckCircle2,
  Info,
  LockKeyhole,
  UserCheck,
  Wifi,
} from "lucide-react";

import {
  sendOtp,
  verifyOtp,
} from "../../services/authApi";


export default function Login({
  onLogin,
}) {

  // =====================================================
  // FORM STATE
  // =====================================================

  const [
    mobileNumber,
    setMobileNumber,
  ] = useState("");

  const [
    otp,
    setOtp,
  ] = useState("");

  const [
    otpSent,
    setOtpSent,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    statusMessage,
    setStatusMessage,
  ] = useState("");

  const [
    loginSuccess,
    setLoginSuccess,
  ] = useState(false);

  const [
    showWelcome,
    setShowWelcome,
  ] = useState(true);


  // =====================================================
  // WELCOME NOTIFICATION
  // =====================================================

  useEffect(() => {

    const timer =
      setTimeout(() => {

        setShowWelcome(false);

      }, 6000);


    return () =>
      clearTimeout(timer);

  }, []);


  // =====================================================
  // SEND OTP
  // =====================================================

  async function handleSendOtp() {

    setError("");
    setStatusMessage("");


    const mobile =
      mobileNumber.trim();


    if (!mobile) {

      setError(
        "Enter your registered mobile number."
      );

      return;

    }


    try {

      setLoading(true);


      setStatusMessage(
        "Connecting to secure authentication service..."
      );


      await new Promise(
        (resolve) =>
          setTimeout(resolve, 500)
      );


      setStatusMessage(
        "Checking customer information..."
      );


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


      setStatusMessage(
        "Customer verified. Sending secure OTP..."
      );


      // =================================================
      // SAVE TEMPORARY LOGIN INFORMATION
      // =================================================

      localStorage.setItem(
        "oben_pending_user_id",
        userId
      );


      localStorage.setItem(
        "oben_user_mobile",
        mobile
      );


      // Small success animation delay

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 700)
      );


      setOtpSent(true);


      setStatusMessage(
        "Verification code sent successfully."
      );


      // Remove success message after a moment

      setTimeout(() => {

        setStatusMessage("");

      }, 2500);


    } catch (error) {

      console.error(
        "❌ Send OTP failed:",
        error
      );


      setStatusMessage("");


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
    setStatusMessage("");


    const mobile =
      mobileNumber.trim();


    const enteredOtp =
      otp.trim();


    if (!enteredOtp) {

      setError(
        "Enter the verification code."
      );

      return;

    }


    if (enteredOtp.length < 4) {

      setError(
        "Enter a valid verification code."
      );

      return;

    }


    try {

      setLoading(true);


      setStatusMessage(
        "Verifying your secure access code..."
      );


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
      // OTP VERIFIED
      // =================================================

      setStatusMessage(
        "Identity verified successfully..."
      );


      await new Promise(
        (resolve) =>
          setTimeout(resolve, 500)
      );


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

      setStatusMessage(
        "Creating secure login session..."
      );


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


      localStorage.removeItem(
        "oben_pending_user_id"
      );


      // =================================================
      // LOAD ACCOUNT
      // =================================================

      setStatusMessage(
        "Loading your vehicle and account information..."
      );


      await new Promise(
        (resolve) =>
          setTimeout(resolve, 600)
      );


      setLoginSuccess(true);


      setStatusMessage(
        "Access granted. Opening dashboard..."
      );


      await new Promise(
        (resolve) =>
          setTimeout(resolve, 900)
      );


      console.log(
        "✅ Customer authenticated successfully."
      );


      // =================================================
      // LOGIN COMPLETE
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


      setStatusMessage("");


      setError(
        error?.response?.data?.error ||
        error?.message ||
        "Invalid verification code."
      );


    } finally {

      setLoading(false);

    }

  }


  // =====================================================
  // CHANGE NUMBER
  // =====================================================

  function handleChangeNumber() {

    if (loading) {
      return;
    }


    setOtpSent(false);

    setOtp("");

    setError("");

    setStatusMessage("");


    localStorage.removeItem(
      "oben_pending_user_id"
    );

  }


  // =====================================================
  // ENTER KEY SUPPORT
  // =====================================================

  function handleKeyDown(event) {

    if (event.key !== "Enter") {
      return;
    }


    if (loading) {
      return;
    }


    if (otpSent) {

      handleVerifyOtp();

    } else {

      handleSendOtp();

    }

  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div
      className="
        relative
        flex
        min-h-screen
        items-center
        justify-center
        overflow-hidden
        bg-[#050505]
        p-6
        text-slate-100
      "
    >


      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >

        {/* TOP GLOW */}

        <div
          className="
            absolute
            -left-40
            -top-40
            h-[550px]
            w-[550px]
            rounded-full
            bg-indigo-600/20
            blur-[150px]
          "
        />


        {/* BOTTOM GLOW */}

        <div
          className="
            absolute
            -bottom-40
            -right-40
            h-[550px]
            w-[550px]
            rounded-full
            bg-cyan-600/10
            blur-[150px]
          "
        />


        {/* GRID */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.025]
          "
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize:
              "40px 40px",
          }}
        />

      </div>



      {/* =================================================
          WELCOME NOTIFICATION
      ================================================= */}

      {showWelcome && (

        <div
          className="
            absolute
            top-5
            left-1/2
            z-30
            flex
            w-[calc(100%-2rem)]
            max-w-md
            -translate-x-1/2
            items-center
            gap-3
            rounded-2xl
            border
            border-indigo-400/20
            bg-black/70
            px-4
            py-3
            shadow-2xl
            backdrop-blur-xl
            animate-[fadeIn_0.5s_ease-out]
          "
        >

          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-indigo-500/20
              bg-indigo-500/10
            "
          >

            <Info
              className="
                h-4
                w-4
                text-indigo-400
              "
            />

          </div>


          <div className="min-w-0">

            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-widest
                text-slate-200
              "
            >
              Welcome to RORR Telematics
            </p>


            <p
              className="
                mt-1
                text-[9px]
                font-mono
                text-slate-500
              "
            >
              Sign in with your registered mobile number.
            </p>

          </div>


          <div
            className="
              ml-auto
              h-2
              w-2
              shrink-0
              animate-pulse
              rounded-full
              bg-emerald-400
            "
          />

        </div>

      )}



      {/* =================================================
          LOGIN CARD WRAPPER / ANIMATED BORDER
      ================================================= */}

      <div
        className="
          relative
          z-10
          w-full
          max-w-md
        "
      >


        {/* Animated glow behind card */}

        <div
          className="
            absolute
            -inset-[1px]
            animate-[spin_7s_linear_infinite]
            rounded-[25px]
            bg-[conic-gradient(from_0deg,transparent_0deg,transparent_70deg,rgba(99,102,241,0.9)_120deg,rgba(34,211,238,0.8)_180deg,transparent_240deg,transparent_360deg)]
            blur-[1px]
          "
        />


        {/* =================================================
            LOGIN CARD
        ================================================= */}

        <div
          className="
            relative
            overflow-hidden
            rounded-3xl
            border
            border-white/10
            bg-[#090909]/95
            p-8
            shadow-[0_30px_100px_rgba(0,0,0,0.7)]
            backdrop-blur-2xl
          "
        >


          {/* =================================================
              TOP PROGRESS LINE
          ================================================= */}

          {loading && (

            <div
              className="
                absolute
                left-0
                top-0
                h-[2px]
                w-full
                overflow-hidden
                bg-white/5
              "
            >

              <div
                className="
                  h-full
                  w-1/2
                  bg-gradient-to-r
                  from-transparent
                  via-indigo-400
                  to-transparent
                  animate-[loginProgress_1.2s_linear_infinite]
                "
              />

            </div>

          )}



          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
              mb-8
              flex
              flex-col
              items-center
              text-center
            "
          >


            <div
              className={`
                mb-4
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                border
                transition-all
                duration-500
                ${
                  loginSuccess
                    ? `
                      border-emerald-500/30
                      bg-emerald-500/15
                    `
                    : `
                      border-indigo-500/20
                      bg-indigo-500/15
                    `
                }
              `}
            >

              {loginSuccess ? (

                <CheckCircle2
                  className="
                    h-8
                    w-8
                    text-emerald-400
                  "
                />

              ) : (

                <ShieldCheck
                  className="
                    h-8
                    w-8
                    text-indigo-400
                  "
                />

              )}

            </div>


            <h1
              className="
                text-xl
                font-bold
                tracking-wide
                text-white
              "
            >
              RORR TELEMATICS
            </h1>


            <p
              className="
                mt-2
                text-[9px]
                font-mono
                uppercase
                tracking-[0.2em]
                text-slate-500
              "
            >
              Secure Customer Authentication
            </p>


            <p
              className="
                mt-3
                text-[8px]
                font-mono
                tracking-wide
                text-slate-700
              "
            >
              Developed by Saksham Talwar
            </p>

          </div>



          {/* =================================================
              MOBILE NUMBER
          ================================================= */}

          <label
            className="
              mb-2
              block
              text-[9px]
              font-bold
              uppercase
              tracking-widest
              text-slate-500
            "
          >
            Registered Mobile Number
          </label>


          <div
            className={`
              flex
              items-center
              gap-3
              rounded-xl
              border
              px-4
              py-3
              transition-all
              duration-300
              ${
                otpSent
                  ? `
                    border-indigo-500/20
                    bg-indigo-500/[0.04]
                  `
                  : `
                    border-white/10
                    bg-black/30
                    focus-within:border-indigo-400/40
                    focus-within:bg-indigo-500/[0.03]
                  `
              }
            `}
          >

            <Smartphone
              className="
                h-4
                w-4
                shrink-0
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
              onKeyDown={handleKeyDown}
              placeholder="Enter mobile number"
              disabled={otpSent || loading}
              className="
                min-w-0
                flex-1
                bg-transparent
                text-sm
                text-slate-200
                outline-none
                placeholder:text-slate-700
                disabled:cursor-not-allowed
              "
            />

          </div>



          {/* =================================================
              OTP
          ================================================= */}

          {otpSent && (

            <div
              className="
                mt-5
                animate-[fadeIn_0.4s_ease-out]
              "
            >

              <label
                className="
                  mb-2
                  flex
                  items-center
                  gap-2
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-widest
                  text-slate-500
                "
              >

                <LockKeyhole
                  className="
                    h-3
                    w-3
                  "
                />

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
                onKeyDown={handleKeyDown}
                placeholder="Enter OTP"
                disabled={loading}
                autoFocus
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-black/30
                  px-4
                  py-3
                  text-center
                  font-mono
                  text-lg
                  tracking-[0.45em]
                  text-slate-200
                  outline-none
                  transition-all
                  placeholder:text-xs
                  placeholder:tracking-normal
                  placeholder:text-slate-700
                  focus:border-indigo-400/40
                  focus:bg-indigo-500/[0.03]
                "
              />


              <p
                className="
                  mt-2
                  text-center
                  text-[8px]
                  font-mono
                  text-slate-600
                "
              >
                Enter the verification code sent to your mobile
              </p>

            </div>

          )}



          {/* =================================================
              STATUS MESSAGE
          ================================================= */}

          {(loading || statusMessage) && (

            <div
              className="
                mt-5
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-indigo-500/15
                bg-indigo-500/[0.04]
                px-4
                py-3
                animate-[fadeIn_0.3s_ease-out]
              "
            >

              {loginSuccess ? (

                <UserCheck
                  className="
                    h-4
                    w-4
                    shrink-0
                    text-emerald-400
                  "
                />

              ) : loading ? (

                <Loader2
                  className="
                    h-4
                    w-4
                    shrink-0
                    animate-spin
                    text-indigo-400
                  "
                />

              ) : (

                <Wifi
                  className="
                    h-4
                    w-4
                    shrink-0
                    text-indigo-400
                  "
                />

              )}


              <span
                className="
                  text-[9px]
                  font-mono
                  text-slate-400
                "
              >
                {statusMessage}
              </span>

            </div>

          )}



          {/* =================================================
              ERROR
          ================================================= */}

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
                animate-[fadeIn_0.3s_ease-out]
              "
            >
              {error}
            </div>

          )}



          {/* =================================================
              MAIN BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={
              otpSent
                ? handleVerifyOtp
                : handleSendOtp
            }
            disabled={loading || loginSuccess}
            className={`
              mt-6
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              px-4
              py-3.5
              text-sm
              font-bold
              text-white
              transition-all
              duration-300
              ${
                loginSuccess
                  ? `
                    bg-emerald-500
                  `
                  : `
                    bg-indigo-500
                    hover:bg-indigo-400
                    hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]
                    hover:-translate-y-0.5
                  `
              }
              disabled:cursor-not-allowed
              disabled:opacity-60
            `}
          >

            {loading ? (

              <>

                <Loader2
                  className="
                    h-4
                    w-4
                    animate-spin
                  "
                />

                Please wait...

              </>

            ) : loginSuccess ? (

              <>

                <CheckCircle2
                  className="
                    h-4
                    w-4
                  "
                />

                Access Granted

              </>

            ) : otpSent ? (

              <>

                <LogIn
                  className="
                    h-4
                    w-4
                  "
                />

                Verify & Continue

              </>

            ) : (

              <>

                <ArrowRight
                  className="
                    h-4
                    w-4
                  "
                />

                Send Verification Code

              </>

            )}

          </button>



          {/* =================================================
              CHANGE NUMBER
          ================================================= */}

          {otpSent && !loading && !loginSuccess && (

            <button
              type="button"
              onClick={handleChangeNumber}
              className="
                mt-4
                w-full
                text-[10px]
                text-slate-600
                transition
                hover:text-slate-300
              "
            >
              Change mobile number
            </button>

          )}



          {/* =================================================
              SECURITY FOOTER
          ================================================= */}

          <div
            className="
              mt-7
              flex
              items-center
              justify-center
              gap-2
              border-t
              border-white/[0.05]
              pt-5
              text-[8px]
              font-mono
              uppercase
              tracking-wider
              text-slate-700
            "
          >

            <ShieldCheck
              className="
                h-3
                w-3
              "
            />

            Secure Authentication Session

          </div>


        </div>

      </div>

    </div>

  );

}