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
// STORAGE KEYS
// =====================================================

const PROFILE_STORAGE_KEY =
  "oben_profile";


// =====================================================
// GET JWT PAYLOAD
// =====================================================
//
// This only reads the expiry from the JWT.
// It does NOT verify the JWT signature.
//

function getTokenPayload(token) {

  try {

    if (!token) {
      return null;
    }


    const parts =
      token.split(".");


    if (parts.length !== 3) {
      return null;
    }


    const base64Url =
      parts[1];


    const base64 =
      base64Url
        .replace(/-/g, "+")
        .replace(/_/g, "/");


    const json =
      decodeURIComponent(
        atob(base64)
          .split("")
          .map((character) => {

            const hex =
              character
                .charCodeAt(0)
                .toString(16)
                .padStart(2, "0");

            return `%${hex}`;

          })
          .join("")
      );


    return JSON.parse(
      json
    );

  } catch (error) {

    console.warn(
      "⚠️ Unable to read token payload:",
      error
    );

    return null;

  }

}


// =====================================================
// CHECK TOKEN EXPIRY
// =====================================================

function isTokenExpired(token) {

  const payload =
    getTokenPayload(token);


  // If we cannot determine expiry,
  // let the server decide.

  if (
    !payload ||
    !payload.exp
  ) {
    return false;
  }


  const currentTime =
    Math.floor(
      Date.now() / 1000
    );


  return (
    currentTime >= payload.exp
  );

}


// =====================================================
// GET TOKEN EXPIRY TIME
// =====================================================

function getTokenExpiry(token) {

  const payload =
    getTokenPayload(token);


  if (
    !payload ||
    !payload.exp
  ) {
    return null;
  }


  return new Date(
    payload.exp * 1000
  );

}


// =====================================================
// CHECK AUTHENTICATION ERROR
// =====================================================

function isAuthenticationError(error) {

  const status =
    error?.status ||
    error?.statusCode ||
    error?.response?.status;


  if (
    status === 401 ||
    status === 403
  ) {
    return true;
  }


  const message =
    String(
      error?.message || ""
    ).toLowerCase();


  return (
    message.includes("unauthorized") ||
    message.includes("forbidden") ||
    message.includes("invalid token") ||
    message.includes("token expired") ||
    message.includes("jwt expired")
  );

}


// =====================================================
// GET SAVED PROFILE
// =====================================================

function getSavedProfile() {

  try {

    const savedProfile =
      localStorage.getItem(
        PROFILE_STORAGE_KEY
      );


    if (!savedProfile) {
      return null;
    }


    return JSON.parse(
      savedProfile
    );

  } catch (error) {

    console.warn(
      "⚠️ Saved profile is corrupted:",
      error
    );


    localStorage.removeItem(
      PROFILE_STORAGE_KEY
    );


    return null;

  }

}


// =====================================================
// SAVE PROFILE
// =====================================================

function saveProfile(profile) {

  if (!profile) {
    return;
  }


  try {

    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify(profile)
    );

  } catch (error) {

    console.warn(
      "⚠️ Failed to save profile:",
      error
    );

  }

}


// =====================================================
// CLEAR LOCAL SESSION
// =====================================================

function clearLocalSession() {

  clearAuth();


  localStorage.removeItem(
    PROFILE_STORAGE_KEY
  );

}


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

      lastError =
        error;


      console.warn(
        `⚠️ Profile request failed. Attempt ${attempt}/${retries}`,
        error
      );


      // -----------------------------------------------
      // STOP RETRYING IF TOKEN IS ACTUALLY INVALID
      // -----------------------------------------------

      if (
        isAuthenticationError(error)
      ) {

        throw error;

      }


      // -----------------------------------------------
      // WAIT BEFORE NEXT ATTEMPT
      // -----------------------------------------------

      if (
        attempt < retries
      ) {

        const delay =
          2000 * attempt;


        console.log(
          `⏳ Retrying in ${delay / 1000}s...`
        );


        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              delay
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


  // ===================================================
  // STATE
  // ===================================================

  const [
    authenticated,
    setAuthenticated,
  ] = useState(false);


  const [
    profile,
    setProfile,
  ] = useState(null);


  const [
    checkingAuth,
    setCheckingAuth,
  ] = useState(true);


  // ===================================================
  // RESTORE SAVED LOGIN
  // ===================================================

  useEffect(() => {

    let cancelled =
      false;


    async function restoreSession() {


      // ------------------------------------------------
      // GET SAVED TOKEN
      // ------------------------------------------------

      const token =
        getAccessToken();


      // ------------------------------------------------
      // NO TOKEN
      // ------------------------------------------------

      if (!token) {

        console.log(
          "🔒 No saved login session."
        );


        if (!cancelled) {

          setCheckingAuth(
            false
          );

        }


        return;

      }


      console.log(
        "🔐 Saved token found."
      );


      // ------------------------------------------------
      // CHECK JWT EXPIRY
      // ------------------------------------------------

      if (
        isTokenExpired(token)
      ) {

        const expiry =
          getTokenExpiry(token);


        console.warn(
          "⌛ Saved access token has expired:",
          expiry
        );


        // Token is genuinely expired.
        // This is different from a network failure.

        clearLocalSession();


        if (!cancelled) {

          setProfile(
            null
          );


          setAuthenticated(
            false
          );


          setCheckingAuth(
            false
          );

        }


        return;

      }


      const expiry =
        getTokenExpiry(token);


      console.log(
        "🔐 Token is still valid.",
        expiry
          ? `Expires: ${expiry.toLocaleString()}`
          : ""
      );


      // ------------------------------------------------
      // RESTORE CACHED PROFILE IMMEDIATELY
      // ------------------------------------------------

      const cachedUser =
        getSavedProfile();


      if (cachedUser) {

        console.log(
          "📦 Restoring cached profile."
        );


        if (!cancelled) {

          setProfile(
            cachedUser
          );


          setAuthenticated(
            true
          );


          // Stop loading immediately.
          // Dashboard can open while profile refreshes.

          setCheckingAuth(
            false
          );

        }

      } else {

        console.log(
          "📭 No cached profile found."
        );

      }


      // ------------------------------------------------
      // IF NO CACHED PROFILE,
      // KEEP LOADING UNTIL WE TRY THE SERVER
      // ------------------------------------------------

      if (!cachedUser) {

        if (!cancelled) {

          setCheckingAuth(
            true
          );

        }

      }


      // ------------------------------------------------
      // VERIFY PROFILE IN BACKGROUND
      // ------------------------------------------------

      try {

        const user =
          await getProfileWithRetry(
            3
          );


        if (cancelled) {
          return;
        }


        setProfile(
          user
        );


        saveProfile(
          user
        );


        setAuthenticated(
          true
        );


        setCheckingAuth(
          false
        );


        console.log(
          "✅ Existing session verified with server."
        );


      } catch (error) {

        if (cancelled) {
          return;
        }


        // ----------------------------------------------
        // REAL AUTHENTICATION FAILURE
        // ----------------------------------------------

        if (
          isAuthenticationError(error)
        ) {

          console.warn(
            "🔒 Session is no longer authorized."
          );


          clearLocalSession();


          setProfile(
            null
          );


          setAuthenticated(
            false
          );


          setCheckingAuth(
            false
          );


          return;

        }


        // ----------------------------------------------
        // NETWORK / SERVER FAILURE
        // ----------------------------------------------

        console.warn(
          "🌐 Server unavailable. Keeping local session.",
          error
        );


        // If we have a cached profile,
        // keep the user logged in.

        if (cachedUser) {

          setAuthenticated(
            true
          );


          setCheckingAuth(
            false
          );


          return;

        }


        // No cached profile and server unavailable.
        // We cannot construct the dashboard safely.

        setAuthenticated(
          false
        );


        setCheckingAuth(
          false
        );

      }

    }


    restoreSession();


    return () => {

      cancelled =
        true;

    };

  }, []);


  // ===================================================
  // LOGIN SUCCESS
  // ===================================================

  async function handleLogin() {

    try {

      console.log(
        "🔐 OTP login successful."
      );


      // ----------------------------------------------
      // VERIFY TOKEN WAS ACTUALLY SAVED
      // ----------------------------------------------

      const token =
        getAccessToken();


      if (!token) {

        throw new Error(
          "Login succeeded but no access token was saved."
        );

      }


      // ----------------------------------------------
      // CHECK TOKEN
      // ----------------------------------------------

      if (
        isTokenExpired(token)
      ) {

        throw new Error(
          "Received an expired access token."
        );

      }


      const expiry =
        getTokenExpiry(token);


      console.log(
        "🎫 New access token saved.",
        expiry
          ? `Expires: ${expiry.toLocaleString()}`
          : ""
      );


      // ----------------------------------------------
      // LOAD PROFILE
      // ----------------------------------------------

      const user =
        await getProfileWithRetry(
          3
        );


      if (!user) {

        throw new Error(
          "Unable to load customer profile."
        );

      }


      setProfile(
        user
      );


      // Save profile for future app reloads.

      saveProfile(
        user
      );


      setAuthenticated(
        true
      );


      console.log(
        "✅ Customer profile loaded."
      );


    } catch (error) {

      console.error(
        "❌ Failed after login:",
        error
      );


      // ----------------------------------------------
      // CHECK IF TOKEN EXISTS
      // ----------------------------------------------

      const token =
        getAccessToken();


      // OTP login may have succeeded and token may
      // already be stored, while the profile API is
      // temporarily unavailable.

      if (
        token &&
        !isTokenExpired(token) &&
        !isAuthenticationError(error)
      ) {

        console.warn(
          "⚠️ Token exists but profile could not load."
        );


        const cachedUser =
          getSavedProfile();


        if (cachedUser) {

          setProfile(
            cachedUser
          );

        }


        setAuthenticated(
          true
        );


        return;

      }


      // Genuine failure.

      clearLocalSession();


      setProfile(
        null
      );


      setAuthenticated(
        false
      );

    }

  }


  // ===================================================
  // LOGOUT
  // ===================================================

  function handleLogout() {

    console.log(
      "🔓 Logging out..."
    );


    clearLocalSession();


    setProfile(
      null
    );


    setAuthenticated(
      false
    );


    console.log(
      "✅ Local session cleared."
    );

  }


  // ===================================================
  // CHECKING SESSION
  // ===================================================

  if (checkingAuth) {

    return (

      <div
        className="
          min-h-screen
          flex
          flex-col
          items-center
          justify-center
          gap-3
          bg-[#050505]
          text-slate-500
          font-mono
        "
      >

        <div
          className="
            h-8
            w-8
            rounded-full
            border-2
            border-indigo-500/20
            border-t-indigo-400
            animate-spin
          "
        />

        <span
          className="
            text-xs
            tracking-widest
            uppercase
          "
        >
          Restoring session...
        </span>

      </div>

    );

  }


  // ===================================================
  // NOT AUTHENTICATED
  // ===================================================

  if (!authenticated) {

    return (

      <Login
        onLogin={handleLogin}
      />

    );

  }


  // ===================================================
  // AUTHENTICATED
  // ===================================================

  return (

    <div
      className="
        rorr-app-background
      "
    >

      <div
        className="
          rorr-app-content
        "
      >

        <Dashboard
          profile={profile}
          onLogout={handleLogout}
        />

      </div>

    </div>

  );

}