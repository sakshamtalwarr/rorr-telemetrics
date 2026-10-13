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
// STORAGE
// =====================================================

const PROFILE_STORAGE_KEY =
  "oben_profile";

// =====================================================
// JWT PAYLOAD
// =====================================================
//
// This reads the JWT payload locally.
// It DOES NOT verify the JWT signature.
// The server remains responsible for actual
// authentication.
// =====================================================

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

    const base64Url = parts[1];

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

    return JSON.parse(json);

  } catch (error) {
    console.warn(
      "⚠️ Unable to read token payload:",
      error
    );

    return null;
  }
}

// =====================================================
// TOKEN EXPIRY
// =====================================================

function isTokenExpired(token) {
  const payload =
    getTokenPayload(token);

  /*
   * If we cannot determine the expiry,
   * don't automatically log the user out.
   *
   * The backend can decide whether the token
   * is valid.
   */

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
// TOKEN EXPIRY DATE
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
// AUTHENTICATION ERROR
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
// PROFILE RETRY
// =====================================================
//
// Render may be sleeping.
//
// We retry several times before giving up.
// IMPORTANT: giving up DOES NOT log the user out.
// =====================================================

async function getProfileWithRetry(
  retries = 5
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

      // =================================================
      // STOP ONLY FOR REAL AUTH FAILURE
      // =================================================

      if (
        isAuthenticationError(error)
      ) {
        console.warn(
          "🔐 Server says customer token is unauthorized."
        );

        throw error;
      }

      // =================================================
      // RETRY
      // =================================================

      if (
        attempt < retries
      ) {
        const delay =
          Math.min(
            3000 * attempt,
            10000
          );

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
// FALLBACK PROFILE
// =====================================================
//
// If the token is valid but Render is temporarily
// unavailable and we don't have a cached profile,
// give Dashboard a minimal profile instead of
// showing Login.
// =====================================================

function createFallbackProfile() {
  return {
    firstName: "Rorr",
    lastName: "Rider",
    mobileNumber:
      localStorage.getItem(
        "oben_mobile_number"
      ) || "",
  };
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
  // RESTORE SESSION
  // ===================================================

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {

      // =================================================
      // GET SAVED TOKEN
      // =================================================

      const token =
        getAccessToken();

      // =================================================
      // NO TOKEN
      // =================================================

      if (!token) {

        console.log(
          "🔒 No saved login session."
        );

        if (!cancelled) {
          setAuthenticated(false);
          setProfile(null);
          setCheckingAuth(false);
        }

        return;
      }

      console.log(
        "🔐 Saved access token found."
      );

      // =================================================
      // CHECK LOCAL JWT EXPIRY
      // =================================================
      //
      // Note: Instead of immediately clearing the session on token expiry,
      // we proceed to try fetching the profile. The getProfile() function
      // now has built-in token refresh logic that will attempt to get a new
      // token if the current one is expired or near expiry. This provides a
      // smoother experience where the user may be re-authenticated silently.
      // Session is only cleared if profile fetch ultimately fails.

      if (
        isTokenExpired(token)
      ) {

        const expiry =
          getTokenExpiry(token);

        console.warn(
          "⌛ Saved access token has expired:",
          expiry
        );

        // Session refresh handled by getProfile() - do not clear session here.
        // If token can be refreshed, user stays logged in.
        // If refresh fails, session will be cleared in the catch block.

      }

      // =================================================
      // TOKEN IS LOCALLY VALID
      // =================================================

      const expiry =
        getTokenExpiry(token);

      console.log(
        "🔐 Token is still valid.",
        expiry
          ? `Expires: ${expiry.toLocaleString()}`
          : ""
      );

      // =================================================
      // RESTORE CACHED PROFILE
      // =================================================

      const cachedUser =
        getSavedProfile();

      if (
        cachedUser
      ) {

        console.log(
          "📦 Restoring cached profile immediately."
        );

        if (!cancelled) {

          setProfile(
            cachedUser
          );

          /*
           * IMPORTANT:
           *
           * The user is considered logged in
           * immediately because the local token
           * is still valid.
           */

          setAuthenticated(
            true
          );

          setCheckingAuth(
            false
          );
        }
      }

      // =================================================
      // NO CACHED PROFILE
      // =================================================

      if (
        !cachedUser
      ) {

        console.log(
          "📭 No cached profile found."
        );

        /*
         * We DO NOT show Login here.
         *
         * The token is still valid.
         *
         * We temporarily keep checking while the
         * backend wakes up.
         */
      }

      // =================================================
      // REFRESH PROFILE FROM SERVER
      // =================================================

      try {

        const user =
          await getProfileWithRetry(
            5
          );

        if (cancelled) {
          return;
        }

        // =================================================
        // SAVE NEW PROFILE
        // =================================================

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

        // =================================================
        // REAL AUTH FAILURE
        // =================================================

        if (
          isAuthenticationError(error)
        ) {

          console.warn(
            "🔒 Customer session is no longer authorized."
          );

          clearLocalSession();

          setProfile(null);
          setAuthenticated(false);
          setCheckingAuth(false);

          return;
        }

        // =================================================
        // SERVER / NETWORK FAILURE
        // =================================================

        console.warn(
          "🌐 Backend unavailable. Keeping local login session.",
          error
        );

        /*
         * THIS IS THE IMPORTANT PART.
         *
         * Render being asleep does NOT mean
         * the customer is logged out.
         */

        if (!cancelled) {

          if (cachedUser) {

            setProfile(
              cachedUser
            );

          } else {

            setProfile(
              createFallbackProfile()
            );

          }

          setAuthenticated(
            true
          );

          setCheckingAuth(
            false
          );
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
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

      // =================================================
      // TOKEN SHOULD ALREADY BE SAVED BY verifyOtp()
      // =================================================

      const token =
        getAccessToken();

      if (!token) {
        throw new Error(
          "Login succeeded but no access token was saved."
        );
      }

      // =================================================
      // CHECK TOKEN
      // =================================================

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

      /*
       * Mark the user authenticated immediately.
       *
       * Even if Render needs time to wake up,
       * the OTP login itself already succeeded.
       */

      setAuthenticated(
        true
      );

      setCheckingAuth(
        false
      );

      // =================================================
      // LOAD PROFILE
      // =================================================

      try {

        const user =
          await getProfileWithRetry(
            5
          );

        setProfile(
          user
        );

        saveProfile(
          user
        );

        console.log(
          "✅ Customer profile loaded."
        );

      } catch (profileError) {

        console.warn(
          "⚠️ Profile could not be loaded immediately.",
          profileError
        );

        /*
         * IMPORTANT:
         *
         * Do NOT log out here unless the token
         * was actually rejected.
         */

        if (
          isAuthenticationError(
            profileError
          )
        ) {

          clearLocalSession();

          setProfile(null);
          setAuthenticated(false);

          return;
        }

        // =================================================
        // SERVER TEMPORARILY UNAVAILABLE
        // =================================================

        const cachedUser =
          getSavedProfile();

        setProfile(
          cachedUser ||
            createFallbackProfile()
        );

        setAuthenticated(
          true
        );
      }

    } catch (error) {

      console.error(
        "❌ Failed after login:",
        error
      );

      const token =
        getAccessToken();

      // =================================================
      // TOKEN EXISTS AND IS STILL VALID
      // =================================================

      if (
        token &&
        !isTokenExpired(token) &&
        !isAuthenticationError(error)
      ) {

        console.warn(
          "⚠️ Login token is valid. Keeping session."
        );

        const cachedUser =
          getSavedProfile();

        setProfile(
          cachedUser ||
            createFallbackProfile()
        );

        setAuthenticated(
          true
        );

        setCheckingAuth(
          false
        );

        return;
      }

      // =================================================
      // GENUINE LOGIN FAILURE
      // =================================================

      clearLocalSession();

      setProfile(null);
      setAuthenticated(false);
      setCheckingAuth(false);
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

    setProfile(null);
    setAuthenticated(false);
    setCheckingAuth(false);

    console.log(
      "✅ Local session cleared."
    );
  }

  // ===================================================
  // SESSION CHECK
  // ===================================================

  if (
    checkingAuth
  ) {

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

        <span
          className="
            text-[10px]
            text-slate-600
          "
        >
          Connecting to telemetry backend
        </span>

      </div>
    );
  }

  // ===================================================
  // NOT AUTHENTICATED
  // ===================================================

  if (
    !authenticated
  ) {

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