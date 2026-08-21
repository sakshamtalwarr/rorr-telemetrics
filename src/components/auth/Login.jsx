import {
  useEffect,
  useState,
} from "react";

import {
  Smartphone,
  ArrowRight,
  Loader2,
  LogIn,
  CheckCircle2,
  Info,
  LockKeyhole,
  UserCheck,
  Wifi,
  ShieldCheck,
  ChevronRight,
  Sparkles,
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

      }, 5500);


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
          "Unable to send verification code."
        );

      }


      setStatusMessage(
        "Customer verified. Sending secure code..."
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


      await new Promise(
        (resolve) =>
          setTimeout(resolve, 700)
      );


      setOtpSent(true);


      setStatusMessage(
        "Verification code sent successfully."
      );


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
        "Unable to send verification code."
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
        bg-[#030507]
        px-5
        py-8
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


        {/* LARGE INDIGO AMBIENT LIGHT */}

        <div
          className="
            login-ambient-one
            absolute
            -left-40
            -top-40
            h-[600px]
            w-[600px]
            rounded-full
            bg-indigo-600/20
            blur-[160px]
          "
        />


        {/* CYAN AMBIENT LIGHT */}

        <div
          className="
            login-ambient-two
            absolute
            -bottom-40
            -right-40
            h-[600px]
            w-[600px]
            rounded-full
            bg-cyan-500/10
            blur-[160px]
          "
        />


        {/* CENTRE GLOW */}

        <div
          className="
            absolute
            left-1/2
            top-1/2
            h-[400px]
            w-[400px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-indigo-500/[0.035]
            blur-[100px]
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
              `
                linear-gradient(
                  rgba(255,255,255,0.5) 1px,
                  transparent 1px
                ),
                linear-gradient(
                  90deg,
                  rgba(255,255,255,0.5) 1px,
                  transparent 1px
                )
              `,
            backgroundSize:
              "48px 48px",
          }}
        />

      </div>



      {/* =================================================
          WELCOME NOTIFICATION
      ================================================= */}

      {showWelcome && (

        <div
          className="
            login-welcome
            absolute
            left-1/2
            top-5
            z-30
            flex
            w-[calc(100%-2rem)]
            max-w-md
            -translate-x-1/2
            items-center
            gap-3
            overflow-hidden
            rounded-2xl
            border
            border-indigo-400/20
            bg-[#080b12]/90
            px-4
            py-3
            shadow-[0_20px_60px_rgba(0,0,0,0.45)]
            backdrop-blur-2xl
          "
        >


          {/* ICON */}

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-indigo-400/20
              bg-indigo-500/10
            "
          >

            <Info
              className="
                h-4
                w-4
                text-indigo-300
              "
            />

          </div>


          {/* TEXT */}

          <div className="min-w-0">

            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
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
              Sign in using your registered mobile number.
            </p>

          </div>


          {/* LIVE DOT */}

          <div
            className="
              ml-auto
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
            "
          >

            <span
              className="
                h-2
                w-2
                animate-pulse
                rounded-full
                bg-emerald-400
                shadow-[0_0_12px_rgba(52,211,153,0.8)]
              "
            />

          </div>


          {/* AUTO DISMISS PROGRESS */}

          <div
            className="
              absolute
              bottom-0
              left-0
              h-[2px]
              w-full
              origin-left
              bg-gradient-to-r
              from-indigo-500
              via-cyan-400
              to-indigo-500
              animate-[welcomeProgress_5.5s_linear_forwards]
            "
          />

        </div>

      )}



      {/* =================================================
          LOGIN CARD
      ================================================= */}

      <div
        className="
          login-card-wrapper
          relative
          z-10
          w-full
          max-w-md
        "
      >


        {/* =============================================
            PROPER ROTATING BORDER
        ============================================= */}

        <div
          className="
            pointer-events-none
            absolute
            -inset-[2px]
            overflow-hidden
            rounded-[30px]
          "
        >

          {/* Rotating light source */}

          <div
            className="
              login-border-rotator
              absolute
              left-1/2
              top-1/2
              h-[220%]
              w-[220%]
              -translate-x-1/2
              -translate-y-1/2
            "
          />

        </div>



        {/* =============================================
            ACTUAL CARD
        ============================================= */}

        <div
          className="
            relative
            overflow-hidden
            rounded-[28px]
            border
            border-white/[0.08]
            bg-[#080a0f]/95
            p-7
            shadow-[0_30px_120px_rgba(0,0,0,0.75)]
            backdrop-blur-2xl
            sm:p-8
          "
        >


          {/* SUBTLE INNER LIGHT */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent_38%)]
            "
          />


          {/* =================================================
              TOP PROGRESS LINE
          ================================================= */}

          {loading && (

            <div
              className="
                absolute
                left-0
                top-0
                z-20
                h-[2px]
                w-full
                overflow-hidden
                bg-white/5
              "
            >

              <div
                className="
                  login-progress-light
                  h-full
                  w-[45%]
                  bg-gradient-to-r
                  from-transparent
                  via-cyan-300
                  to-indigo-400
                "
              />

            </div>

          )}



          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="relative z-10">


            {/* =============================================
                HEADER
            ============================================= */}

            <div
              className="
                mb-8
                flex
                flex-col
                items-center
                text-center
              "
            >


              {/* CUSTOM LOGO */}

              <div
                className={`
                  relative
                  mb-5
                  flex
                  h-[70px]
                  w-[62px]
                  items-center
                  justify-center
                  rounded-[24px]
                  border
                  bg-gradient-to-b
                  from-white/[0.06]
                  to-white/[0.015]
                  shadow-[0_0_40px_rgba(99,102,241,0.12)]
                  transition-all
                  duration-700
                  ${
                    loginSuccess
                      ? `
                        border-emerald-400/30
                        shadow-[0_0_45px_rgba(52,211,153,0.18)]
                      `
                      : `
                        border-indigo-400/20
                      `
                  }
                `}
              >


                {/* Glow */}

                <div
                  className="
                    absolute
                    inset-3
                    rounded-2xl
                    bg-indigo-500/10
                    blur-xl
                  "
                />


                {loginSuccess ? (

                  <CheckCircle2
                    className="
                      relative
                      z-10
                      h-10
                      w-10
                      text-emerald-400
                      drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]
                    "
                  />

                ) : (

                  <img
                    src="/rorr-logo.png"
                    alt="RORR Telematics"
                    className="
                      relative
                      z-10
                      h-14
                      w-14
                      object-contain
                      drop-shadow-[0_0_12px_rgba(129,140,248,0.35)]
                    "
                    onError={(event) => {

                      event.currentTarget.style.display =
                        "none";

                    }}
                  />

                )}


                {/* Small status indicator */}

                <span
                  className="
                    absolute
                    -right-1
                    -top-1
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#080a0f]
                    bg-indigo-500
                    shadow-[0_0_15px_rgba(99,102,241,0.6)]
                  "
                >

                  <Sparkles
                    className="
                      h-2.5
                      w-2.5
                      text-white
                    "
                  />

                </span>

              </div>


              {/* TITLE */}

              <h1
                className="
                  text-[22px]
                  font-bold
                  tracking-[0.08em]
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
                  tracking-[0.24em]
                  text-indigo-300/60
                "
              >
                Secure Vehicle Intelligence
              </p>


              <div
                className="
                  mt-4
                  flex
                  items-center
                  gap-2
                  text-[8px]
                  font-mono
                  text-slate-600
                "
              >

                <span
                  className="
                    h-px
                    w-7
                    bg-white/10
                  "
                />

                CUSTOMER AUTHENTICATION

                <span
                  className="
                    h-px
                    w-7
                    bg-white/10
                  "
                />

              </div>

            </div>



            {/* =============================================
                MOBILE NUMBER
            ============================================= */}

            <div>

              <label
                className="
                  mb-2
                  flex
                  items-center
                  justify-between
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-slate-500
                "
              >

                <span>
                  Registered Mobile Number
                </span>


                {!otpSent && (

                  <span
                    className="
                      text-[8px]
                      font-normal
                      normal-case
                      tracking-normal
                      text-slate-700
                    "
                  >
                    Required
                  </span>

                )}

              </label>


              <div
                className={`
                  group
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  px-4
                  py-3.5
                  transition-all
                  duration-300
                  ${
                    otpSent
                      ? `
                        border-indigo-400/15
                        bg-indigo-500/[0.035]
                      `
                      : `
                        border-white/[0.08]
                        bg-black/20
                        hover:border-white/[0.13]
                        focus-within:border-indigo-400/40
                        focus-within:bg-indigo-500/[0.035]
                        focus-within:shadow-[0_0_25px_rgba(99,102,241,0.08)]
                      `
                  }
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
                    rounded-xl
                    bg-white/[0.035]
                    transition
                    group-focus-within:bg-indigo-500/10
                  "
                >

                  <Smartphone
                    className="
                      h-4
                      w-4
                      text-slate-500
                      transition
                      group-focus-within:text-indigo-300
                    "
                  />

                </div>


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

            </div>



            {/* =============================================
                OTP
            ============================================= */}

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
                    tracking-[0.16em]
                    text-slate-500
                  "
                >

                  <LockKeyhole
                    className="
                      h-3
                      w-3
                      text-indigo-400
                    "
                  />

                  Verification Code

                </label>


                <div
                  className="
                    group
                    rounded-2xl
                    border
                    border-white/[0.08]
                    bg-black/20
                    p-1
                    transition
                    focus-within:border-indigo-400/40
                    focus-within:bg-indigo-500/[0.025]
                    focus-within:shadow-[0_0_25px_rgba(99,102,241,0.08)]
                  "
                >

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
                      bg-transparent
                      px-4
                      py-3.5
                      text-center
                      font-mono
                      text-xl
                      tracking-[0.45em]
                      text-white
                      outline-none
                      placeholder:text-sm
                      placeholder:tracking-normal
                      placeholder:text-slate-700
                    "
                  />

                </div>


                <p
                  className="
                    mt-2.5
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



            {/* =============================================
                STATUS MESSAGE
            ============================================= */}

            {(loading || statusMessage) && (

              <div
                className="
                  mt-5
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-indigo-400/15
                  bg-indigo-500/[0.045]
                  px-4
                  py-3
                  animate-[fadeIn_0.3s_ease-out]
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
                    rounded-xl
                    bg-indigo-500/10
                  "
                >

                  {loginSuccess ? (

                    <UserCheck
                      className="
                        h-4
                        w-4
                        text-emerald-400
                      "
                    />

                  ) : loading ? (

                    <Loader2
                      className="
                        h-4
                        w-4
                        animate-spin
                        text-indigo-300
                      "
                    />

                  ) : (

                    <Wifi
                      className="
                        h-4
                        w-4
                        text-indigo-300
                      "
                    />

                  )}

                </div>


                <div className="min-w-0">

                  <p
                    className="
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-indigo-300/70
                    "
                  >
                    {loginSuccess
                      ? "Authentication Complete"
                      : "System Status"}
                  </p>


                  <p
                    className="
                      mt-0.5
                      text-[9px]
                      font-mono
                      text-slate-400
                    "
                  >
                    {statusMessage}
                  </p>

                </div>

              </div>

            )}



            {/* =============================================
                ERROR
            ============================================= */}

            {error && (

              <div
                className="
                  mt-4
                  flex
                  items-start
                  gap-3
                  rounded-2xl
                  border
                  border-red-500/20
                  bg-red-500/[0.07]
                  px-4
                  py-3
                  animate-[fadeIn_0.3s_ease-out]
                "
              >

                <Info
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                    text-red-400
                  "
                />


                <p
                  className="
                    text-xs
                    text-red-300
                  "
                >
                  {error}
                </p>

              </div>

            )}



            {/* =============================================
                MAIN BUTTON
            ============================================= */}

            <button
              type="button"
              onClick={
                otpSent
                  ? handleVerifyOtp
                  : handleSendOtp
              }
              disabled={loading || loginSuccess}
              className={`
                group
                relative
                mt-6
                flex
                w-full
                items-center
                justify-center
                gap-2
                overflow-hidden
                rounded-2xl
                px-4
                py-4
                text-sm
                font-bold
                text-white
                transition-all
                duration-300
                ${
                  loginSuccess
                    ? `
                      bg-emerald-500
                      shadow-[0_12px_35px_rgba(16,185,129,0.18)]
                    `
                    : `
                      bg-gradient-to-r
                      from-indigo-600
                      via-indigo-500
                      to-violet-500
                      shadow-[0_12px_35px_rgba(79,70,229,0.22)]
                      hover:-translate-y-0.5
                      hover:shadow-[0_16px_45px_rgba(79,70,229,0.35)]
                    `
                }
                disabled:cursor-not-allowed
                disabled:opacity-60
              `}
            >


              {/* Button shine */}

              {!loading && !loginSuccess && (

                <span
                  className="
                    absolute
                    inset-y-0
                    -left-1/2
                    w-1/3
                    -skew-x-12
                    bg-gradient-to-r
                    from-transparent
                    via-white/20
                    to-transparent
                    transition-all
                    duration-700
                    group-hover:left-[120%]
                  "
                />

              )}


              <span className="relative z-10">

                {loading ? (

                  <Loader2
                    className="
                      h-4
                      w-4
                      animate-spin
                    "
                  />

                ) : loginSuccess ? (

                  <CheckCircle2
                    className="
                      h-4
                      w-4
                    "
                  />

                ) : otpSent ? (

                  <LogIn
                    className="
                      h-4
                      w-4
                    "
                  />

                ) : (

                  <ArrowRight
                    className="
                      h-4
                      w-4
                    "
                  />

                )}

              </span>


              <span className="relative z-10">

                {loading
                  ? "Please wait..."
                  : loginSuccess
                    ? "Access Granted"
                    : otpSent
                      ? "Verify & Continue"
                      : "Send Verification Code"}

              </span>


              {!loading && !loginSuccess && (

                <ChevronRight
                  className="
                    relative
                    z-10
                    h-4
                    w-4
                    opacity-60
                    transition-transform
                    group-hover:translate-x-1
                  "
                />

              )}

            </button>



            {/* =============================================
                CHANGE NUMBER
            ============================================= */}

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
                  hover:text-indigo-300
                "
              >
                ← Change mobile number
              </button>

            )}



            {/* =============================================
                SECURITY FOOTER
            ============================================= */}

            <div
              className="
                mt-7
                border-t
                border-white/[0.05]
                pt-5
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-[09px]
                  font-mono
                  uppercase
                  tracking-[0.12em]
                  text-slate-999
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


              <p
                className="
                  mt-3
                   
                  text-center
                  text-[12px]
                  font-mono
                  text-slate-999
                "
              >
                Developed by Saksham Talwar with ❤️ 
              </p>

            </div>


          </div>

        </div>

      </div>

    </div>

  );

}