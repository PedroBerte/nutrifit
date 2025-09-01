import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "https://localhost:8080/v1",
  withCredentials: true,
});

export default api;
