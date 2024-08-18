import axios from "axios";

console.log(
  "import.meta.env.VITE_API_ENDPOINT",
  import.meta.env.VITE_API_ENDPOINT
);

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT,
});

axiosInstance.interceptors.request.use((config) => {
  //   if (accessToken) {
  //     config.headers["Authorization"] = `Bearer ${accessToken || ""}`;
  //   }
  return config;
});

// axiosInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem("access_token");
//   config.params = config.params || {};
//   config.params["auth"] = token;
//   return config;
// });

export default axiosInstance;
