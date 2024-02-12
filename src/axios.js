import axios from "axios";

export const axiosClient = axios.create({
  withCredentials: true,
  baseURL: import.meta.env.VITE_API_ENDPOINT || "http://localhost:5000/api",
});
