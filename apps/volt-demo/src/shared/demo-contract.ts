export interface FullstackHealthResponse {
  mode: "development" | "production";
  status: "ok";
  target: "web";
  time: string;
}

export interface FullstackInfoResponse {
  gamePublicWsUrl: string | null;
  gameWsUrl: string;
  publicUrl: string | null;
  shareEnabled: boolean;
  target: "web";
  version: string;
}

export interface FullstackTimeResponse {
  isoTime: string;
  target: "web";
  unixTime: number;
}

export interface FullstackEchoResponse {
  body: unknown;
  echoedAt: string;
  target: "web";
}

export interface GameClientMessage {
  sentAt: number;
  text?: string;
  type: "ping" | "say";
}

export interface GameServerMessage {
  body?: string;
  sentAt: number;
  type: "echo" | "heartbeat" | "pong" | "welcome";
}
