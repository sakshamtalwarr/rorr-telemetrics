import {
    useState
} from "react";

import {
    Smartphone,
    ShieldCheck,
    ArrowRight,
    Loader2,
    RefreshCw,
    LockKeyhole,
} from "lucide-react";

import GlassCard from "../common/GlassCard";

import {
    sendOtp,
    verifyOtp,
} from "../../services/authApi";


// =====================================================
// LOGIN
// =====================================================

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

    const [message, setMessage] =
        useState("");


    // =================================================
    // SEND OTP
    // =================================================

    async function handleSendOtp(event) {

        event.preventDefault();

        setError("");
        setMessage("");


        const cleanedNumber =
            mobileNumber
                .replace(/\D/g, "");


        if (
            cleanedNumber.length !== 10
        ) {

            setError(
                "Enter a valid 10-digit mobile number."
            );

            return;

        }


        setLoading(true);


        try {

            console.log(
                "📱 Requesting OTP..."
            );


            const result =
                await sendOtp(
                    cleanedNumber
                );


            console.log(
                "📱 OTP result:",
                result
            );


            if (
                !result?.success
            ) {

                throw new Error(
                    result?.error ||
                    "Unable to send OTP."
                );

            }


            setOtpSent(true);

            setMessage(
                result.message ||
                "OTP sent successfully."
            );


        } catch (error) {

            console.error(
                "❌ Send OTP failed:",
                error
            );


            setError(
                error.message ||
                "Unable to send OTP."
            );


        } finally {

            setLoading(false);

        }

    }


    // =================================================
    // VERIFY OTP
    // =================================================

    async function handleVerifyOtp(event) {

        event.preventDefault();

        setError("");
        setMessage("");


        const cleanedNumber =
            mobileNumber
                .replace(/\D/g, "");


        const cleanedOtp =
            otp
                .replace(/\D/g, "");


        if (
            cleanedNumber.length !== 10
        ) {

            setError(
                "Invalid mobile number."
            );

            return;

        }


        if (
            cleanedOtp.length !== 4
        ) {

            setError(
                "Enter the 4-digit OTP."
            );

            return;

        }


        setLoading(true);


        try {

            console.log(
                "🔐 Verifying OTP..."
            );


            const result =
                await verifyOtp(
                    cleanedNumber,
                    cleanedOtp
                );


            console.log(
                "✅ OTP verification successful."
            );


            if (
                !result?.accessToken
            ) {

                throw new Error(
                    "No access token received."
                );

            }


            setMessage(
                "Login successful."
            );


            // =============================================
            // TELL APP LOGIN IS COMPLETE
            // =============================================

            if (
                typeof onLogin === "function"
            ) {

                await onLogin(
                    result
                );

            }


        } catch (error) {

            console.error(
                "❌ OTP verification failed:",
                error
            );


            setError(
                error.response?.data?.error ||
                error.message ||
                "Invalid OTP."
            );


        } finally {

            setLoading(false);

        }

    }


    // =================================================
    // CHANGE NUMBER
    // =================================================

    function changeNumber() {

        setOtpSent(false);

        setOtp("");

        setError("");

        setMessage("");

    }


    // =================================================
    // RENDER
    // =================================================

    return (

        <div
            className="
                min-h-screen
                w-full
                flex
                items-center
                justify-center
                bg-[#05070d]
                px-4
                py-8
            "
        >

            {/* BACKGROUND */}

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
                        left-1/2
                        top-1/2
                        -translate-x-1/2
                        -translate-y-1/2
                        w-[500px]
                        h-[500px]
                        rounded-full
                        bg-indigo-500/10
                        blur-[120px]
                    "
                />

            </div>


            {/* LOGIN CARD */}

            <GlassCard
                className="
                    relative
                    z-10
                    w-full
                    max-w-md
                    p-8
                "
                hover={false}
            >

                {/* =================================================
                    LOGO / HEADER
                ================================================= */}

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
                            flex
                            items-center
                            justify-center
                            w-16
                            h-16
                            rounded-2xl
                            bg-indigo-500/10
                            border
                            border-indigo-500/20
                            shadow-lg
                            shadow-indigo-500/10
                            mb-5
                        "
                    >

                        {otpSent ? (

                            <ShieldCheck
                                className="
                                    w-8
                                    h-8
                                    text-indigo-400
                                "
                            />

                        ) : (

                            <Smartphone
                                className="
                                    w-8
                                    h-8
                                    text-indigo-400
                                "
                            />

                        )}

                    </div>


                    <h1
                        className="
                            text-2xl
                            font-bold
                            text-slate-100
                        "
                    >
                        RORR
                    </h1>


                    <p
                        className="
                            mt-1
                            text-[9px]
                            uppercase
                            tracking-[0.3em]
                            font-mono
                            text-slate-600
                        "
                    >
                        Personal Telematics
                    </p>


                    <p
                        className="
                            mt-5
                            text-sm
                            text-slate-400
                        "
                    >

                        {otpSent
                            ? "Enter the OTP sent to your mobile"
                            : "Sign in to access your vehicle"}

                    </p>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div
                        className="
                            mb-5
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


                {/* =================================================
                    SUCCESS
                ================================================= */}

                {message && (

                    <div
                        className="
                            mb-5
                            rounded-xl
                            border
                            border-emerald-500/20
                            bg-emerald-500/10
                            px-4
                            py-3
                            text-xs
                            text-emerald-400
                        "
                    >

                        {message}

                    </div>

                )}


                {!otpSent ? (

                    /* =============================================
                       MOBILE FORM
                       ============================================= */

                    <form
                        onSubmit={handleSendOtp}
                        className="space-y-5"
                    >
<div
    className={`
        group
        relative
        rounded-xl
        transition-all
        duration-300
        ${
            mobileNumber.length > 0
                ? "scale-[1.01]"
                : "scale-100"
        }
    `}
>

    {/* typing glow */}

    <div
        className={`
            absolute
            -inset-[1px]
            rounded-xl
            bg-indigo-500/20
            blur-sm
            transition-opacity
            duration-300
            ${
                mobileNumber.length > 0
                    ? "opacity-100"
                    : "opacity-0"
            }
        `}
    />


    <div
        className="
            relative
            flex
            items-center
            rounded-xl
            border
            border-white/10
            bg-black/30
            transition-all
            duration-300
            focus-within:border-indigo-500/50
            focus-within:bg-black/40
        "
    >

        <Phone
            className={`
                ml-4
                h-4
                w-4
                transition-all
                duration-300
                ${
                    mobileNumber.length
                        ? "text-indigo-400 scale-110"
                        : "text-slate-600"
                }
            `}
        />


        <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            value={mobileNumber}

            onChange={(event) => {

                const value =
                    event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);

                setMobileNumber(value);

            }}

            placeholder="Enter mobile number"

            className="
                w-full
                bg-transparent
                px-3
                py-4
                text-sm
                text-slate-200
                outline-none
                placeholder:text-slate-700
            "
        />

    </div>

</div>
<button
    type="submit"
    disabled={
        loading ||
        mobileNumber.length !== 10
    }
    className="
        group
        flex
        w-full
        items-center
        justify-center
        gap-2
        rounded-xl
        bg-indigo-500
        px-4
        py-3
        text-sm
        font-bold
        text-white
        transition-all
        duration-300
        hover:bg-indigo-400
        hover:shadow-lg
        hover:shadow-indigo-500/20
        active:scale-[0.98]
        disabled:cursor-not-allowed
        disabled:opacity-40
    "
>{loading ? (
    <>
        <span
            className="
                h-4
                w-4
                animate-spin
                rounded-full
                border-2
                border-white/30
                border-t-white
            "
        />

        Sending...
    </>
) : (
    <>
        Send OTP

        <ArrowRight
            className="
                h-4
                w-4
                transition-transform
                duration-300
                group-hover:translate-x-1
            "
        />
    </>
)}
                        </button>

                    </form>

                ) : (

                    /* =============================================
                       OTP FORM
                       ============================================= */

                    <form
                        onSubmit={handleVerifyOtp}
                        className="space-y-5"
                    >

                        <div
                            className="
                                rounded-xl
                                border
                                border-white/5
                                bg-black/20
                                p-4
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                "
                            >

                                <div>

                                    <p
                                        className="
                                            text-[8px]
                                            uppercase
                                            tracking-widest
                                            text-slate-600
                                        "
                                    >
                                        OTP sent to
                                    </p>


                                    <p
                                        className="
                                            mt-1
                                            font-mono
                                            text-sm
                                            text-slate-300
                                        "
                                    >
                                        +91 {mobileNumber}
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={changeNumber}
                                    className="
                                        text-[8px]
                                        uppercase
                                        tracking-widest
                                        text-indigo-400
                                        hover:text-indigo-300
                                    "
                                >
                                    Change
                                </button>

                            </div>

                        </div>


                        <div>

                            <label
                                className="
                                    block
                                    mb-2
                                    text-[9px]
                                    font-bold
                                    uppercase
                                    tracking-widest
                                    text-slate-600
                                "
                            >
                                Verification Code
                            </label>


                            <div
                                className="
                                    relative
                                "
                            >

                                <LockKeyhole
                                    className="
                                        absolute
                                        left-4
                                        top-1/2
                                        -translate-y-1/2
                                        w-4
                                        h-4
                                        text-slate-600
                                    "
                                />


                                <input
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={4}
                                    autoFocus
                                    value={otp}
                                    onChange={(event) => {

                                        const value =
                                            event.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 4);

                                        setOtp(value);

                                        setError("");

                                    }}
                                    placeholder="••••"
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-white/10
                                        bg-black/20
                                        py-5
                                        pl-12
                                        pr-4
                                        text-center
                                        text-2xl
                                        font-mono
                                        tracking-[0.5em]
                                        text-slate-100
                                        outline-none
                                        focus:border-indigo-500/40
                                        placeholder:text-slate-700
                                    "
                                />

                            </div>

                        </div>


                        <button
                            type="submit"
                            disabled={
                                loading ||
                                otp.length !== 4
                            }
                            className="
                                w-full
                                flex
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-indigo-500/15
                                border
                                border-indigo-500/30
                                px-4
                                py-4
                                text-xs
                                font-bold
                                uppercase
                                tracking-widest
                                text-indigo-300
                                hover:bg-indigo-500/25
                                disabled:opacity-40
                                disabled:cursor-not-allowed
                                transition
                            "
                        >

                            {loading ? (

                                <>

                                    <Loader2
                                        className="
                                            w-4
                                            h-4
                                            animate-spin
                                        "
                                    />

                                    Verifying...

                                </>

                            ) : (

                                <>

                                    <ShieldCheck
                                        className="
                                            w-4
                                            h-4
                                        "
                                    />

                                    Verify & Continue

                                </>

                            )}

                        </button>


                        <button
                            type="button"
                            disabled={loading}
                            onClick={handleSendOtp}
                            className="
                                w-full
                                flex
                                items-center
                                justify-center
                                gap-2
                                py-2
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-widest
                                text-slate-600
                                hover:text-indigo-400
                                disabled:opacity-30
                                transition
                            "
                        >

                            <RefreshCw
                                className="w-3 h-3"
                            />

                            Resend OTP

                        </button>

                    </form>

                )}


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div
                    className="
                        mt-8
                        pt-5
                        border-t
                        border-white/5
                        text-center
                    "
                >

                    <p
                        className="
                            text-[8px]
                            font-mono
                            uppercase
                            tracking-widest
                            text-slate-700
                        "
                    >
                        Secure vehicle access
                    </p>

                </div>

            </GlassCard>

        </div>

    );

}