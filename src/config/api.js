// =====================================================
// BACKEND CONFIGURATION
// =====================================================

const BACKEND_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";


// =====================================================
// HTTP API
// =====================================================

export const BACKEND_API =
    BACKEND_URL;


// =====================================================
// WEBSOCKET
// =====================================================

export const BACKEND_WS =
    import.meta.env.VITE_WS_URL ||
    BACKEND_URL
        .replace(/^https:/, "wss:")
        .replace(/^http:/, "ws:");