import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

const socket = io(socketUrl || undefined, {
  autoConnect: true,
  transports: ["websocket"],
});

export function useSocketEvent<TPayload>(
  eventName: string,
  handler: (payload: TPayload) => void,
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const handleEvent = (payload: TPayload) => {
      handlerRef.current(payload);
    };

    socket.on(eventName, handleEvent);

    return () => {
      socket.off(eventName, handleEvent);
    };
  }, [eventName]);
}

export function useSocketManagerEvent(
  eventName: Parameters<typeof socket.io.on>[0],
  handler: () => void,
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const handleEvent = () => {
      handlerRef.current();
    };

    socket.io.on(eventName, handleEvent);

    return () => {
      socket.io.off(eventName, handleEvent);
    };
  }, [eventName]);
}
