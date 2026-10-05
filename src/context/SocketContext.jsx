import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { io } from "socket.io-client";
import BASE_URL from "../config";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const connectSocket = () => {
      const token = localStorage.getItem("token");

      // If there is no token, make sure old socket is removed
      if (!token) {
        setSocket((oldSocket) => {
          if (oldSocket) {
            oldSocket.disconnect();
          }

          return null;
        });

        return;
      }

      console.log("Connecting socket...");

      const newSocket = io(BASE_URL, {
        transports: ["websocket"],
        auth: {
          token,
        },
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      newSocket.on("connect", () => {
        console.log(
          "Socket connected:",
          newSocket.id
        );
      });

      newSocket.on("connect_error", (error) => {
        console.error(
          "Socket connection error:",
          error.message
        );
      });

      newSocket.on("disconnect", (reason) => {
        console.log(
          "Socket disconnected:",
          reason
        );
      });

      setSocket(newSocket);

      return newSocket;
    };

    let currentSocket = connectSocket();

    // Login/logout will dispatch this event
    const handleAuthChange = () => {
      console.log("Auth changed. Reconnecting socket...");

      if (currentSocket) {
        currentSocket.disconnect();
      }

      currentSocket = connectSocket();
    };

    window.addEventListener(
      "auth-changed",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "auth-changed",
        handleAuthChange
      );

      if (currentSocket) {
        currentSocket.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}