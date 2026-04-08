export interface WebSocketConnection {
  close: () => void;
  send: (payload: string) => void;
}

// WebSocketService wraps the browser socket API so panels stay declarative.
export interface WebSocketService {
  connect: (options: {
    onClose?: () => void;
    onError?: (event: Event) => void;
    onMessage?: (payload: string) => void;
    onOpen?: () => void;
    url: string;
  }) => WebSocketConnection;
}

const createConnection = (socket: WebSocket): WebSocketConnection => ({
  close: () => socket.close(),
  send: (payload) => socket.send(payload),
});

export const createWebSocketService = (): WebSocketService => ({
  connect: ({ onClose, onError, onMessage, onOpen, url }) => {
    const socket = new WebSocket(url);
    socket.addEventListener("open", () => onOpen?.());
    socket.addEventListener("close", () => onClose?.());
    socket.addEventListener("error", (event) => onError?.(event));
    socket.addEventListener("message", (event) => {
      onMessage?.(String(event.data));
    });
    return createConnection(socket);
  },
});
