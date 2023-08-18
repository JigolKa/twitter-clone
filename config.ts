export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://twitter-clone-jigolka.vercel.app"
    : "http://localhost:3000";

export const TOAST_ERROR_MESSAGE = "An error occured. Please try again later.";
