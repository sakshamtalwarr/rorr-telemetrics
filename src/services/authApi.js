import axios from "axios";


// =====================================================
// BACKEND
// =====================================================

const API_BASE =
  import.meta.env.VITE_API_URL;


const API_URL =
  `${API_BASE}/api/auth`;


// =====================================================
// SEND OTP
// =====================================================

export async function sendOtp(mobileNumber) {

  try {

    const response =
      await axios.post(
        `${API_URL}/send-otp`,
        {
          mobileNumber,
        },
        {
          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },
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

    const response =
      await axios.post(
        `${API_URL}/verify-otp`,
        {
          mobileNumber,
          otp,
        },
        {
          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },
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
      "oben_access_token",
      token
    );


    localStorage.setItem(
      "oben_mobile_number",
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
    "oben_access_token"
  );

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

  if (responseData?.profile) {

    return responseData.profile;

  }


  // ---------------------------------------------------
  // { success, user: {...} }
  // ---------------------------------------------------

  if (responseData?.user) {

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

  if (responseData?.data?.profile) {

    return responseData.data.profile;

  }


  // ---------------------------------------------------
  // { success, data: { user: {...} } }
  // ---------------------------------------------------

  if (responseData?.data?.user) {

    return responseData.data.user;

  }


  // ---------------------------------------------------
  // GRAPHQL STYLE:
  // { data: { getUserAllDetails: {...} } }
  // ---------------------------------------------------

  if (
    responseData?.data?.getUserAllDetails
  ) {

    return responseData.data.getUserAllDetails;

  }


  // ---------------------------------------------------
  // BACKEND MAY RETURN A DIFFERENT KEY
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


    console.log(
      "👤 Profile name:",
      profile.firstName,
      profile.lastName
    );


    console.log(
      "📱 Profile mobile:",
      profile.mobileNumber
    );


    console.log(
      "🏍️ Profile vehicle:",
      profile.vehicleDetails
    );


    return profile;

  } catch (error) {

    console.error(
      "❌ Profile request failed:",
      error.response?.status,
      error.response?.data ||
      error.message
    );


    // Only clear auth if the server explicitly
    // confirms that the token is invalid.

    if (
      error.response?.status === 401 ||
      error.response?.status === 403
    ) {

      clearAuth();

    }


    throw error;

  }

}


// =====================================================
// LOGOUT
// =====================================================

export function clearAuth() {

  localStorage.removeItem(
    "oben_access_token"
  );


  localStorage.removeItem(
    "oben_mobile_number"
  );


  localStorage.removeItem(
    "oben_profile"
  );


  console.log(
    "🔓 Local login session cleared."
  );

}