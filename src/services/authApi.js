import axios from "axios";


// =====================================================
// BACKEND
// =====================================================


const API_BASE =
    import.meta.env.VITE_API_URL;
    
const API_URL =
    `${import.meta.env.VITE_API_URL}/api/auth`;


// =====================================================
// SEND OTP
// =====================================================

export async function sendOtp(mobileNumber) {

    try {

        const response =
            await axios.post(
                `${API_URL}/send-otp`,
                {
                    mobileNumber
                },
                {
                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    }
                }
            );


        console.log(
            "📱 Frontend OTP response:",
            response.data
        );


        if (!response.data?.success) {

            throw new Error(
                response.data?.error ||
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
                    otp
                },
                {
                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    }
                }
            );


        console.log(
            "🔐 Frontend verify response:",
            response.data
        );


        const token =
            response.data?.accessToken;


        if (
            !response.data?.success ||
            !token
        ) {

            throw new Error(
                response.data?.error ||
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
// GET PROFILE
// =====================================================

export async function getProfile() {

    const token =
        getAccessToken();


    if (!token) {

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
                            "application/json"
                    }
                }
            );


        return response.data;

} catch (error) {

    console.error(
        "❌ Profile request failed:",
        error.response?.status,
        error.response?.data ||
        error.message
    );

    // Only clear the session when the server explicitly
    // says the token is unauthorized/expired.
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


    console.log(
        "🔓 Local login session cleared."
    );

}
