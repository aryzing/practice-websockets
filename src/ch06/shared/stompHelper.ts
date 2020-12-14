import WsWebSocket from "ws";

export interface Frame {
  command: string;
  headers?: Record<string, string>;
  content?: string;
}

export const symbolFromDestination = (destination: string) => {
  return destination.substring(destination.indexOf(".") + 1);
};

export const processFrame = (data: string): Frame => {
  const lines = data.split("\n");

  const command = lines[0];
  if (typeof command !== "string") {
    throw new Error("Expected `command` to be a string.");
  }

  let i = 1;
  let line = lines[i];
  const headers: Record<string, string> = {};
  while (typeof line === "string" && line.length > 0) {
    const headerSplit = line.split(":");
    const elem0 = headerSplit[0];
    const elem1 = headerSplit[1];

    if (typeof elem0 !== "string") {
      throw new Error("Expected `elem0` to be a string.");
    }
    if (typeof elem1 !== "string") {
      throw new Error("Expected `elem1` to be a string.");
    }

    const key = elem0.trim();
    const val = elem1.trim();

    headers[key] = val;

    i += 1;
    line = lines[i];
  }

  const content = lines.slice(i + 1, lines.length - 1).join("\n");
  const frame: Frame = {
    command,
    headers,
    content,
  };
  return frame;
};

export const sendFrame = function (
  ws: WsWebSocket | WebSocket,
  frame: Frame
): void {
  let data = frame["command"] + "\n";
  let headerContent = "";
  if (frame.headers) {
    for (const key of Object.keys(frame.headers)) {
      headerContent += key + ": " + frame.headers[key] + "\n";
    }
  }
  data += headerContent;
  data += "\n\n";
  data += frame.content ?? "";
  data += "\n\0";
  ws.send(data);
};

export const sendError = (
  ws: WsWebSocket | WebSocket,
  message: string,
  detail?: string
): void => {
  const headers: Record<string, string> = {};
  if (message) headers.message = message;
  else headers.message = "No error message given";

  sendFrame(ws, {
    command: "ERROR",
    headers: headers,
    content: detail,
  });
};
