import axios from "axios";

const API_URL = "http://192.168.10.4:5000/api";

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000
});

export default api;