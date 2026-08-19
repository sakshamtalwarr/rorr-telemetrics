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

            try {

                console.log(
                    "🔐 Saved token found. Restoring session..."
                );


                const user =
                    await getProfile();


                if (!user) {

                    throw new Error(
                        "Unable to load customer profile."
                    );

                }


                setProfile(
                    user
                );


                setAuthenticated(
                    true
                );


                console.log(
                    "✅ Existing session restored."
                );


            } catch (error) {

                console.error(
                    "❌ Saved session is invalid:",
                    error
                );


                clearAuth();


                setProfile(
                    null
                );


                setAuthenticated(
                    false
                );

            } finally {

                setCheckingAuth(
                    false
                );

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
                await getProfile();


            if (!user) {

                throw new Error(
                    "Unable to load customer profile."
                );

            }


            setProfile(
                user
            );


            // Save profile locally for convenience
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
                "❌ Failed to load profile:",
                error
            );


            clearAuth();


            setProfile(
                null
            );


            setAuthenticated(
                false
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

                Checking session...

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