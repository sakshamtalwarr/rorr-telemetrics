import {
    useEffect,
    useState,
} from "react";

import Login from "./components/auth/Login";
import Dashboard from "./Dashboard";

import {
    getProfile,
    getAccessToken,
    clearAuth,
} from "./services/authApi";


// =====================================================
// RETRY PROFILE REQUEST
// =====================================================

async function getProfileWithRetry(
    retries = 3
) {

    let lastError = null;


    for (
        let attempt = 1;
        attempt <= retries;
        attempt++
    ) {

        try {

            console.log(
                `🔄 Loading profile... Attempt ${attempt}/${retries}`
            );


            const user =
                await getProfile();


            if (user) {

                return user;

            }


            throw new Error(
                "Profile response was empty."
            );


        } catch (error) {

            lastError = error;


            console.warn(
                `⚠️ Profile request failed. Attempt ${attempt}/${retries}`,
                error
            );


            // Wait before retrying.
            // Gives free-tier backend time to wake up.

            if (attempt < retries) {

                await new Promise(
                    (resolve) =>
                        setTimeout(
                            resolve,
                            3000 * attempt
                        )
                );

            }

        }

    }


    throw lastError;

}


// =====================================================
// APP
// =====================================================

export default function App() {

    const [
        authenticated,
        setAuthenticated
    ] = useState(false);


    const [
        profile,
        setProfile
    ] = useState(null);


    const [
        checkingAuth,
        setCheckingAuth
    ] = useState(true);


    // =====================================================
    // RESTORE SAVED LOGIN
    // =====================================================

    useEffect(() => {

        async function restoreSession() {

            const token =
                getAccessToken();


            // -------------------------------------------------
            // NO SAVED TOKEN
            // -------------------------------------------------

            if (!token) {

                console.log(
                    "🔒 No saved login session."
                );


                setCheckingAuth(false);

                return;

            }


            // -------------------------------------------------
            // TOKEN EXISTS
            // -------------------------------------------------

            console.log(
                "🔐 Saved token found. Restoring session..."
            );


            // -------------------------------------------------
            // LOAD SAVED PROFILE IMMEDIATELY
            // -------------------------------------------------

            const savedProfile =
                localStorage.getItem(
                    "oben_profile"
                );


            if (savedProfile) {

                try {

                    const cachedUser =
                        JSON.parse(
                            savedProfile
                        );


                    setProfile(
                        cachedUser
                    );


                    setAuthenticated(
                        true
                    );


                    console.log(
                        "📦 Restored cached profile."
                    );


                } catch (error) {

                    console.warn(
                        "⚠️ Saved profile is corrupted.",
                        error
                    );

                }

            }


            // Stop loading screen.
            // The user can enter the dashboard even if
            // the backend is still waking up.

            setCheckingAuth(
                false
            );


            // -------------------------------------------------
            // VERIFY / REFRESH PROFILE IN BACKGROUND
            // -------------------------------------------------

            try {

                const user =
                    await getProfileWithRetry(3);


                setProfile(
                    user
                );


                localStorage.setItem(
                    "oben_profile",
                    JSON.stringify(user)
                );


                setAuthenticated(
                    true
                );


                console.log(
                    "✅ Existing session verified with server."
                );


            } catch (error) {

                console.warn(
                    "⚠️ Server unavailable. Keeping saved session.",
                    error
                );


                // IMPORTANT:
                // DO NOT clearAuth() here.
                //
                // A sleeping backend or temporary network
                // error should NOT log the user out.

            }

        }


        restoreSession();

    }, []);


    // =====================================================
    // LOGIN SUCCESS
    // =====================================================

    async function handleLogin() {

        try {

            console.log(
                "🔐 OTP login successful."
            );


            const user =
                await getProfileWithRetry(3);


            if (!user) {

                throw new Error(
                    "Unable to load customer profile."
                );

            }


            setProfile(
                user
            );


            // Save profile locally

            localStorage.setItem(
                "oben_profile",
                JSON.stringify(user)
            );


            setAuthenticated(
                true
            );


            console.log(
                "✅ Customer profile loaded."
            );


        } catch (error) {

            console.error(
                "❌ Failed to load profile after login:",
                error
            );


            // Don't clear the token automatically.
            // Login was successful, backend may simply
            // still be waking up.

            setAuthenticated(
                true
            );

        }

    }


    // =====================================================
    // LOGOUT
    // =====================================================

    function handleLogout() {

        console.log(
            "🔓 Logging out..."
        );


        clearAuth();


        localStorage.removeItem(
            "oben_profile"
        );


        setProfile(
            null
        );


        setAuthenticated(
            false
        );

    }


    // =====================================================
    // CHECKING SESSION
    // =====================================================

    if (checkingAuth) {

        return (

            <div
                className="
                    min-h-screen
                    flex
                    items-center
                    justify-center
                    bg-[#050505]
                    text-slate-500
                    font-mono
                "
            >

                Restoring session...

            </div>

        );

    }


    // =====================================================
    // NOT AUTHENTICATED
    // =====================================================

    if (!authenticated) {

        return (

            <Login
                onLogin={handleLogin}
            />

        );

    }


    // =====================================================
    // AUTHENTICATED
    // =====================================================

    return (

        <div className="rorr-app-background">

            <div className="rorr-app-content">

                <Dashboard
                    profile={profile}
                    onLogout={handleLogout}
                />

            </div>

        </div>

    );

}