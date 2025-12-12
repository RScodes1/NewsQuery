import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || 'https://newsquery.onrender.com';

export const createSessionApi = async () => {
    const res = await axios.post(`${API_BASE}/api/session/create`);
    return res.data;
};

export const fetchChatHistoryApi = async (sessionId) => {
    const res = await axios.get(`${API_BASE}/api/session/${sessionId}/history`);
    return res?.data?.history || [];
};

export const clearSessionApi = async (sessionId) => {
    const res = await axios.delete(`${API_BASE}/api/session/${sessionId}/clear`);
    return res.data || [];
};
