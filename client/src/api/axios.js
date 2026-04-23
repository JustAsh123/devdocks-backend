import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = token;
  }
  return req;
});

API.interceptors.response.use((res) => {
  if (res.data.success === false) {
    throw new Error(res.data.message);
  }
  return res;
});

export default API;
