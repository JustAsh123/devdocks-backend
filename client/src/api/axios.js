import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.PROD ? import.meta.env.VITE_BASE_URL : "/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = token;
  }
  return req;
});

API.interceptors.response.use(
  (res) => {
    // Treat success:false as a thrown error so all catch() blocks fire consistently
    if (res.data && res.data.success === false) {
      const err = new Error(res.data.message || "Request failed");
      err.response = res; // preserve res so callers can still access res.data
      throw err;
    }
    return res;
  },
  (error) => {
    // Network errors, 4xx, 5xx — re-throw so callers always get a rejected promise
    return Promise.reject(error);
  }
);

export default API;
