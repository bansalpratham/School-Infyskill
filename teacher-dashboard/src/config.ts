// src/config.ts

// Looks for the Netlify variable "VITE_API_URL"
// If not found, defaults to your local API gateway
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4100";

export default API_URL;
