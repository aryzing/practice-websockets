import WebSocket, { Server } from "ws";
import { v4 as uuidv4 } from "uuid";

const server = new Server({ port: 8181 });

interface Client {
  id: string;
  ws: WebSocket;
  nickname: string;
}

// const clients: Array<Client> = [];
const clients = new Map<string, Client>();

const wsSend = (
  // Message type to send
  type: string,

  // ID of connection requesting the message be sent
  id: string,

  // Nickname of connection requesting the message be sent
  nickname: string,

  // Message to send
  message: string
) => {
  for (const [_, client] of clients) {
    const clientSocket = client.ws;
    if (clientSocket?.readyState === WebSocket.OPEN) {
      clientSocket.send(
        JSON.stringify({
          type,
          id,
          nickname,
          message,
        })
      );
    }
  }
};

let clientIndex = 1;

server.on("connection", (ws) => {
  const id = uuidv4();
  let nickname = `AnonymousUser${clientIndex}`;
  clientIndex += 1;
  clients.set(id, { id, nickname, ws });

  console.log(`client ${id} connected`);

  const connectMessage = `${nickname} has connected"`;
  wsSend("notification", id, nickname, connectMessage);

  ws.on("message", (message) => {
    const messageText = message.toString();

    if (messageText.indexOf("/nick") === 0) {
      const nickArgs = messageText.split(" ");
      if (nickname.length >= 2) {
        const newNickname = nickArgs[1];
        if (typeof newNickname === "string") {
          const oldNickname = nickname;
          nickname = newNickname;
          const nicknameChangeMessage = `Client ${oldNickname} changed to ${nickname}`;
          wsSend("nick_update", id, nickname, nicknameChangeMessage);
        }
      }
    } else {
      wsSend("message", id, nickname, messageText);
    }
  });

  const closeSocket = (message?: string) => {
    for (const [_, client] of clients) {
      if (client.id === id) {
        const defaultMessage = `${nickname} has disconnected`;
        let messageToSend = defaultMessage;
        if (message) {
          messageToSend = message;
        }
        wsSend("notification", id, nickname, messageToSend);
      }
    }
  };

  ws.on("close", closeSocket);

  process.on("SIGINT", () => {
    console.log("closing things");
    closeSocket("server has disconnected");
    process.exit();
  });
});
