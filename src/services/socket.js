import { io } from 'socket.io-client';

// Lấy URL backend từ biến môi trường, mặc định là localhost khi dev
const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const socket = io(BACKEND_URL, {
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1500,
    transports: ['websocket', 'polling']
});

socket.on('connect', () => {
    console.log(`🔌 [Socket.io] Kết nối thành công: ${socket.id}`);
});

socket.on('disconnect', (reason) => {
    console.warn(`🔌 [Socket.io] Ngắt kết nối: ${reason}`);
});

socket.on('connect_error', (error) => {
    console.warn(`🔌 [Socket.io] Lỗi kết nối: ${error.message}`);
});

export default socket;
