import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor for Auth Token
// Request Interceptor: Logging + Auth Token
api.interceptors.request.use(
  (config) => {
    // Add start time for duration calculation
    // @ts-ignore
    config.metadata = { startTime: new Date() };

    // Auth Logic
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Logging Logic
    const method = config.method?.toUpperCase();
    const url = config.url;
    
    console.groupCollapsed(
      `%c🔵 [${method}] ${url}`,
      "color: #3b82f6; font-weight: bold; font-size: 12px; padding: 2px 4px; border-radius: 4px; background: #eff6ff;"
    );

    console.log(
      `%c📡 Full URL:`, "font-weight: bold; color: #64748b;",
      `${config.baseURL}${url}`
    );

    if (config.params && Object.keys(config.params).length > 0) {
      console.log(`%c❓ Params:`, "font-weight: bold; color: #a855f7;", config.params);
    }

    if (config.data && !(config.data instanceof FormData)) {
      console.group(`%c📤 Body Data:`, "font-weight: bold; color: #f59e0b;");
      console.table(config.data);
      console.groupEnd();
    }

    if (config.data instanceof FormData) {
      console.group(`%c📦 FormData:`, "font-weight: bold; color: #f59e0b;");
      // @ts-ignore
      for (let [key, value] of config.data.entries()) {
        console.log(`${key}:`, value);
      }
      console.groupEnd();
    }

    console.groupEnd();
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Logging + Token Refresh
api.interceptors.response.use(
  (response) => {
    // Calculate duration
    // @ts-ignore
    const startTime = response.config.metadata?.startTime;
    const duration = startTime ? new Date().getTime() - startTime.getTime() : 0;
    
    console.groupCollapsed(
      `%c🟢 [${response.status}] ${response.config.url} %c(${duration}ms)`,
      "color: #22c55e; font-weight: bold; font-size: 12px; background: #f0fdf4; padding: 2px 4px; border-radius: 4px;",
      "color: #94a3b8; font-weight: normal; font-size: 11px;"
    );

    console.log(
      `%c📥 Response Data:`, "font-weight: bold; color: #22c55e;",
      response.data
    );
    
    console.groupEnd();
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    
    // Calculate duration for error too
    // @ts-ignore
    const startTime = originalRequest?.metadata?.startTime;
    const duration = startTime ? new Date().getTime() - startTime.getTime() : 0;

    // Logging
    console.groupCollapsed(
      `%c🔴 [${status || 'ERR'}] ${originalRequest?.url || 'Unknown URL'} %c(${duration}ms)`,
      "color: #ef4444; font-weight: bold; font-size: 12px; background: #fef2f2; padding: 2px 4px; border-radius: 4px;",
      "color: #94a3b8; font-weight: normal; font-size: 11px;"
    );

    console.log(`%c❌ Error Message:`, "font-weight: bold; color: #ef4444;", error.message);
    
    if (error.response?.data) {
      console.log(`%c⚠️ Server Error Data:`, "font-weight: bold; color: #f87171;", error.response.data);
    }
    
    console.groupEnd();

    // Auth Logic: Token Refresh
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        console.log('%c🔄 Attempting token refresh...', "color: #3b82f6; font-style: italic;");
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
        const { accessToken } = response.data.data;
        
        console.log('%c✅ Token refresh successful', "color: #22c55e; font-weight: bold;");
        localStorage.setItem('accessToken', accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // Update the failed request config with new token
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        console.error('%c⛔ Token refresh failed, logging out', "color: #ef4444; font-weight: bold;", err);
        localStorage.clear();
        window.dispatchEvent(new CustomEvent("unauthenticated"));
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error?.response?.data || error);
  }
);

export default api;
