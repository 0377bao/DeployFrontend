import axios from 'axios';

// Một biến toàn cục hoặc callback để set loading
let setLoadingCallback = null;

export const setGlobalLoadingHandler = (callback) => {
  setLoadingCallback = callback;
};

const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

request.interceptors.request.use(
  (config) => {
    if (setLoadingCallback) setLoadingCallback(true); // bật loading
    return config;
  },
  (error) => {
    if (setLoadingCallback) setLoadingCallback(false); // tắt nếu lỗi
    return Promise.reject(error);
  }
);

// Thêm interceptor cho response
request.interceptors.response.use(
  (response) => {
    if (setLoadingCallback) setLoadingCallback(false); // tắt loading khi xong
    return response;
  },
  (error) => {
    if (setLoadingCallback) setLoadingCallback(false); // tắt loading nếu lỗi
    return Promise.reject(error);
  }
);

export const get = async (path, options = {}) => {
    const response = await request.get(path, options);
    return response.data;
};

export const post = async (path, options = {}, token, employeeID) => {
    const response = await request.post(path, options, {
        headers: {
            token: `Beare ${token}`,
            employeeid: employeeID,
        }
    });
    return response.data;
};

export const put = async (path, options = {}, token, employeeID, warehouseID) => {
    try {
        console.log(`Making PUT request to ${path} with options:`, options);
        const response = await request.put(path, options, {
            headers: {
                token: `Bearer ${token}`,
                employeeid: employeeID,
                warehouseid: warehouseID ? warehouseID : null
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error occurred while making PUT request:', error);
        throw error;
    }
};

export const del = async (path, token, employeeId) => {
    const response = await request.delete(path, {
        headers: {
            token: `Beare ${token}`,
            employeeid: employeeId,
        },
    });
    return response.data;
};

export default request;
