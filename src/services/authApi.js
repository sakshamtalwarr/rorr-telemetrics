import axios from "axios";

// =====================================================
// BACKEND
// =====================================================

const API_BASE = import.meta.env.VITE_API_URL;

const API_URL = `${API_BASE}/api/auth`;

// =====================================================
// STORAGE KEYS
// =====================================================

const ACCESS_TOKEN_KEY = "oben_access_token";
const MOBILE_NUMBER_KEY = "oben_mobile_number";
const PROFILE_STORAGE_KEY = "oben_profile";

// =====================================================
// SEND OTP
// =====================================================

export async function sendOtp(mobileNumber) {
  try {
    const response = await axios.post(
      `${API_URL}/send-otp`,
      {
        mobileNumber,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        // Render may need time to wake up.
        timeout: 30000,
      }
    );

    console.log(
      "📱 Frontend OTP response:",
      response.data
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.error ||
          response.data?.message ||
          "Unable to send OTP."
      );
    }

    return response.data;

  } catch (error) {
    console.error(
      "❌ sendOtp API error:",
      error.response?.data ||
        error.message
    );

    throw new Error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Unable to send OTP."
    );
  }
}

// =====================================================
// VERIFY OTP
// =====================================================

export async function verifyOtp(
  mobileNumber,
  otp
) {
  try {
    const response = await axios.post(
      `${API_URL}/verify-otp`,
      {
        mobileNumber,
        otp,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        // Render may need time to wake up.
        timeout: 30000,
      }
    );

    console.log(
      "🔐 Frontend verify response:",
      response.data
    );

    const token =
      response.data?.accessToken ||
      response.data?.data?.accessToken ||
      response.data?.token;

    // =================================================
    // EXTRACT AND STORE REFRESH TOKEN (if provided)
    // =================================================
    //
    // OBEN may return a refreshToken along with the access token.
    // Storing it here enables automatic token refresh when the
    // access token expires, so the user is never logged out.
    //
    const refreshToken =
      response.data?.refreshToken ||
      response.data?.data?.refreshToken;

    if (refreshToken) {
      localStorage.setItem(
        "oben_refresh_token",
        refreshToken
      );
      console.log(
        "🔄 Refresh token stored automatically."
      );
    }

    if (
      !response.data?.success ||
      !token
    ) {
      throw new Error(
        response.data?.error ||
          response.data?.message ||
          "OTP verification failed."
      );
    }

    // =================================================
    // SAVE LOGIN SESSION
    // =================================================

    localStorage.setItem(
      ACCESS_TOKEN_KEY,
      token
    );

    localStorage.setItem(
      MOBILE_NUMBER_KEY,
      mobileNumber
    );

    console.log(
      "💾 Login session saved."
    );

    return response.data;

  } catch (error) {
    console.error(
      "❌ verifyOtp API error:",
      error.response?.data ||
        error.message
    );

    throw new Error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "OTP verification failed."
    );
  }
}

// =====================================================
// GET ACCESS TOKEN
// =====================================================

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

// =====================================================
// REFRESH ACCESS TOKEN
// =====================================================

export async function refreshAccessToken() {
  try {
    const token = getAccessToken();
    if (!token) return null;

    // Decode payload to check expiry
    const payload =
      getTokenPayload(token);

    if (
      !payload ||
      !payload.exp
    ) {
      return null;
    }

    const currentTime =
      Math.floor(Date.now() / 1000);

    // If token is not yet expired, no need to refresh
    if (currentTime < payload.exp - 60) {
      // Token valid for more than 60 seconds, keep it
      return token;
    }

    // Token is near expiry or expired, attempt refresh
    console.log(
      "🔄 Token near expiry, attempting refresh..."
    );

    // First, try using the refresh token stored during login
    // (this is set automatically when verifyOtp() runs)
    let refreshToken =
      localStorage.getItem("oben_refresh_token");

    // Fallback: use .env value if no stored token available
    if (!refreshToken) {
      refreshToken =
        process.env.OBEN_REFRESH_TOKEN;
    }

    if (!refreshToken) {
      console.warn(
        "⚠️ No refresh token available (neither stored nor in .env), keeping current token"
      );
      return token;
    }

    const API_BASE =
      import.meta.env.VITE_API_URL ||
      "http://localhost:5000";
    const refreshUrl = `${API_BASE}/api/auth/refresh`;

    const response = await fetch(
      refreshUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      }
    );

    if (!response.ok) {
      console.warn(
        "⚠️ Refresh token request failed, keeping current token"
      );
      return token;
    }

    const data = await response.json();

    if (data?.accessToken) {
      // Save new token
      localStorage.setItem(
        ACCESS_TOKEN_KEY,
        data.accessToken
      );
      console.log(
        "✅ Token refreshed successfully."
      );
      return data.accessToken;
    }

    console.warn(
      "⚠️ Refresh response missing accessToken",
      data
    );
    return token;

  } catch (error) {
    console.error(
      "❌ Token refresh failed:",
      error.message
    );
    return null;
  }
}

// Helper: decode JWT payload
function getTokenPayload(token) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 =
      base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
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
    return null;
  }
}

// =====================================================
// GET SAVED MOBILE NUMBER
// =====================================================

export function getSavedMobileNumber() {
  return localStorage.getItem(
    MOBILE_NUMBER_KEY
  );
}

// =====================================================
// GET SAVED PROFILE
// =====================================================

export function getSavedProfile() {
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

export function saveProfile(profile) {
  if (!profile) {
    return;
  }

  try {
    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify(profile)
    );

    console.log(
      "💾 Profile cached locally."
    );

  } catch (error) {
    console.warn(
      "⚠️ Failed to cache profile:",
      error
    );
  }
}

// =====================================================
// EXTRACT ACTUAL PROFILE
// =====================================================

function extractProfile(responseData) {
  console.log(
    "🔎 Raw profile API response:",
    responseData
  );

  // ---------------------------------------------------
  // DIRECT PROFILE OBJECT
  // ---------------------------------------------------

  if (
    responseData?.userId ||
    responseData?.firstName ||
    responseData?.mobileNumber
  ) {
    return responseData;
  }

  // ---------------------------------------------------
  // { success, profile: {...} }
  // ---------------------------------------------------

  if (
    responseData?.profile
  ) {
    return responseData.profile;
  }

  // ---------------------------------------------------
  // { success, user: {...} }
  // ---------------------------------------------------

  if (
    responseData?.user
  ) {
    return responseData.user;
  }

  // ---------------------------------------------------
  // { success, data: {...} }
  // ---------------------------------------------------

  if (
    responseData?.data?.userId ||
    responseData?.data?.firstName ||
    responseData?.data?.mobileNumber
  ) {
    return responseData.data;
  }

  // ---------------------------------------------------
  // { success, data: { profile: {...} } }
  // ---------------------------------------------------

  if (
    responseData?.data?.profile
  ) {
    return responseData.data.profile;
  }

  // ---------------------------------------------------
  // { success, data: { user: {...} } }
  // ---------------------------------------------------

  if (
    responseData?.data?.user
  ) {
    return responseData.data.user;
  }

  // ---------------------------------------------------
  // GRAPHQL STYLE
  // { data: { getUserAllDetails: {...} } }
  // ---------------------------------------------------

  if (
    responseData?.data?.getUserAllDetails
  ) {
    return responseData.data.getUserAllDetails;
  }

  // ---------------------------------------------------
  // UNKNOWN RESPONSE
  // ---------------------------------------------------

  console.warn(
    "⚠️ Could not automatically identify profile object.",
    responseData
  );

  return null;
}

// =====================================================
// GET PROFILE
// =====================================================
//
// IMPORTANT:
//
// This function NEVER clears localStorage.
//
// Even if:
// - Render is sleeping
// - Render is waking
// - request times out
// - network fails
// - backend returns 500
// - backend returns 502
// - backend returns 503
//
// The login session remains untouched.
//
// App.jsx decides what to do with authentication
// errors.
// =====================================================

export async function getProfile() {
  const token = getAccessToken();

  if (!token) {
    console.warn("⚠️ No access token available.");

    return null;
  }

  try {
    console.log("👤 Requesting customer profile...");

    // =================================================
    // ATTEMPT PROFILE FETCH WITH TOKEN REFRESH
    // =================================================

    let currentToken = token;

    // Try up to 2 times: original + 1 refresh
    for (let attempt = 0; attempt < 2; attempt++) {

      // Refresh token if this is the second attempt
      if (attempt === 1) {

        // Attempt silent refresh
        const refreshedToken = await refreshAccessToken();

        if (refreshedToken && refreshedToken !== token) {
          currentToken = refreshedToken;
          console.log("🔄 Token refreshed, retrying profile request.");
        } else if (refreshedToken === token) {
          console.log("ℹ️ Token refresh returned same token, proceeding.");
        } else {
          console.warn("⚠️ Token refresh failed, proceeding with current token.");
        }

      }

      try {
        const response = await axios.get(`${API_URL}/profile`, {

          headers: {
            Authorization: `Bearer ${currentToken}`,

            Accept: "application/json",
          },

          // Give Render enough time to wake.
          timeout: 30000,
        });

        console.log("📦 Full profile response:", response.data);

        const profile = extractProfile(response.data);

        if (!profile) {
          throw new Error(
            "Profile was returned, but the user data could not be found."
          );
        }

        console.log("👤 Extracted profile:", profile);

        // =================================================
        // CACHE PROFILE
        // =================================================

        saveProfile(profile);

        return profile;

      } catch (innerError) {

        const status = innerError?.response?.status;

        console.error(
          "❌ Profile request failed:",
          status || innerError?.code || innerError?.message
        );

        // If we just refreshed and still got 401, give up
        if (attempt === 1) {
          throw innerError;
        }

        // Otherwise, continue loop to try again with refreshed token
        console.log("🔁 Retrying profile request with refreshed token...");

        // Small delay before retry
        await new Promise((resolve) => setTimeout(resolve, 500));

      }

    } // end for loop

    // Should not reach here, but throw just in case
    throw new Error("Profile request failed after retries.");

  } catch (error) {

    console.error(
      "❌ Profile request failed:",
      error.response?.status || error?.code || error?.message
    );

    // =================================================
    // IMPORTANT
    // =================================================
    //
    // DO NOT CALL clearAuth() HERE.
    //
    // A 401/403 may need to be handled by App.jsx,
    // while network/server errors should NEVER log
    // the user out.
    //
    // =================================================

    throw error;

  }
}

// =====================================================
// CLEAR AUTH
// =====================================================
//
// This function deliberately destroys the local
// customer session.
//
// Only call this when:
// - user explicitly logs out
// - token is confirmed expired
// - authentication is genuinely rejected
// =====================================================

export function clearAuth() {

  localStorage.removeItem(
    ACCESS_TOKEN_KEY
  );

  localStorage.removeItem(
    MOBILE_NUMBER_KEY
  );

  localStorage.removeItem(
    PROFILE_STORAGE_KEY
  );

  console.log(
    "🔓 Local login session cleared."
  );
}