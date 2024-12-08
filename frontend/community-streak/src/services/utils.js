// utils.js (or anywhere suitable)
export const getWebSocketUrl = () => {
    const hostname = process.env.REACT_APP_WEBSOCKET_HOSTNAME;
    const port = process.env.REACT_APP_WEBSOCKET_PORT;
    if (hostname && port) {
      return `${hostname}:${port}/ws/motivation`;
    }
    throw new Error("WebSocket hostname or port not found in environment variables");
  };
  