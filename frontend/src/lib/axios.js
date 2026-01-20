import axios from "axios";
export const axiosInstance = axios.create({
  baseURL: "http://localhost:5678/api",
  withCredentials: true,
});
