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
  return localStorage.getItem(
    ACCESS_TOKEN_KEY
  );
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
  const token =
    getAccessToken();

  if (!token) {
    console.warn(
      "⚠️ No access token available."
    );

    return null;
  }

  try {
    console.log(
      "👤 Requesting customer profile..."
    );

    const response =
      await axios.get(
        `${API_URL}/profile`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,

            Accept:
              "application/json",
          },

          // Give Render enough time to wake.
          timeout: 30000,
        }
      );

    console.log(
      "📦 Full profile response:",
      response.data
    );

    const profile =
      extractProfile(
        response.data
      );

    if (!profile) {
      throw new Error(
        "Profile was returned, but the user data could not be found."
      );
    }

    console.log(
      "👤 Extracted profile:",
      profile
    );

    // =================================================
    // CACHE PROFILE
    // =================================================

    saveProfile(
      profile
    );

    return profile;

  } catch (error) {

    const status =
      error?.response?.status;

    console.error(
      "❌ Profile request failed:",
      status ||
        error?.code ||
        error?.message
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