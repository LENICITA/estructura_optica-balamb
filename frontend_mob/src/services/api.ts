import axios from "axios";

const API_URL = "http://10.1.202.45:5000/api";

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000
});

export default api;