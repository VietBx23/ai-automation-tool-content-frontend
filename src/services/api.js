import axios from 'axios';

// Kết nối đến API Render 
const api = axios.create({
  baseURL: 'https://ai-automation-tool-content-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
