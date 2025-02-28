"use strict";

import axios from "axios";

const baseURL = process.env.VUE_APP_API_BASE_URL;

const apiInstance = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error);
    return Promise.reject(error);
  }
);

const apiService = {
  get(resource, params = {}) {
    return apiInstance.get(resource, { params });
  },
  post(resource, data) {
    return apiInstance.post(resource, data);
  },
  put(resource, data) {
    return apiInstance.put(resource, data);
  },
  delete(resource) {
    return apiInstance.delete(resource);
  },
};

export default apiService;
