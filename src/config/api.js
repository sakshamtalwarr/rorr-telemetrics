const hostname = window.location.hostname;

export const BACKEND_HTTP =
  import.meta.env.VITE_BACKEND_URL ||
  `http://${hostname}:5000`;

export const BACKEND_WS =
  import.meta.env.VITE_BACKEND_WS ||
  `ws://${hostname}:5000`;