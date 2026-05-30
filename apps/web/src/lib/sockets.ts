import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

export const socket = io(socketUrl || undefined, {
  autoConnect: true,
  transports: ["websocket"],
});
