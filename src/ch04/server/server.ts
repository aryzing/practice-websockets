import { v4 } from "uuid";
import WebSocket, { Server } from "ws";
import amqp from "amqplib";

import {
  processFrame,
  sendError,
  sendFrame,
  symbolFromDestination,
} from "../shared/stompHelper";
import { StocksResult } from "../shared/types";
import {
  stompRegisteredName,
  queueStocksResult,
  queueStocksWork,
  COMMAND,
} from "../shared/constants";

const isObject = (o: unknown): o is Record<string, unknown> => {
  return typeof o === "object" && o !== null;
};

const isStockResult = (data: unknown): data is StocksResult => {
  if (!Array.isArray(data)) {
    return false;
  }

  for (const stock of data) {
    if (!isObject(stock)) {
      return false;
    }

    if (typeof stock.symbol !== "string") {
      return false;
    }
    if (typeof stock.price !== "number") {
      return false;
    }
  }

  return true;
};

type Client = { ws: WebSocket; stocks: Set<string> };
const clients = new Map<string, Client>();

const closeSocket = (sessionId: string) => {
  const client = clients.get(sessionId);
  if (!client) {
    return;
  }

  client.ws.close();
  clients.delete(sessionId);
};

const connectToAmqp = async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channelStockResult = await connection.createChannel();
  const channelStockWork = await connection.createChannel();

  channelStockResult.assertQueue(queueStocksResult);

  channelStockWork.assertQueue(queueStocksWork);

  channelStockResult.consume(
    queueStocksResult,
    (message) => {
      let data;
      try {
        const messageString = message?.content.toString();
        if (typeof messageString !== "string") {
          throw new Error("Expected `messageString` to be a string.");
        }
        data = JSON.parse(messageString);
      } catch (err) {
        console.error(err);
      }

      if (!isStockResult(data)) {
        console.error("Expected `data` to be of type `StockResult`.");
        return;
      }

      for (const stockUpdate of data) {
        for (const [_, client] of clients) {
          for (const symbol of client.stocks) {
            if (symbol === stockUpdate.symbol) {
              sendFrame(client.ws, {
                command: COMMAND.MESSAGE,
                headers: {
                  destination: `/queue/stocks.${symbol}`,
                },
                content: JSON.stringify({ price: stockUpdate.price }),
              });
            }
          }
        }
      }
    },
    { noAck: true }
  );

  setInterval(() => {
    const symbols = new Set<string>();
    for (const [_, client] of clients) {
      for (const symbol of client.stocks) {
        symbols.add(symbol);
      }
    }

    if (symbols.size > 0) {
      console.log("Sending stocks to work queue", symbols);
      channelStockWork.sendToQueue(
        queueStocksWork,
        Buffer.from(JSON.stringify(Array.from(symbols.values())))
      );
    }
  }, 5 * 1000);
};

const wsServer = new Server({
  port: 8181,
  handleProtocols(protocol: string[]) {
    if (protocol.includes(stompRegisteredName)) {
      return stompRegisteredName;
    }
    return false;
  },
});

wsServer.on("connection", (ws) => {
  const sessionId = v4();
  console.log(`Client connected, assigend session ${sessionId}.`);

  const client: Client = { ws, stocks: new Set() };
  clients.set(sessionId, client);

  ws.on("message", (message: string) => {
    const { command, headers } = processFrame(message);
    switch (command) {
      case COMMAND.CONNECT:
        sendFrame(ws, {
          command: COMMAND.CONNECTED,
          headers: {
            session: sessionId,
          },
          // content: "" // This should not be necessary
        });
        break;
      case COMMAND.SUBSCRIBE: {
        const symbol = symbolFromDestination(headers?.destination ?? "");
        const client = clients.get(sessionId);
        console.log(`Subscription request from ${sessionId}, ${symbol}`);
        if (!client) {
          throw new Error("Expected `client` to be defined.");
        }

        client.stocks.add(symbol);
        break;
      }
      case COMMAND.UNSUBSCRIBE: {
        const symbol = symbolFromDestination(headers?.destination ?? "");
        const client = clients.get(sessionId);
        if (!client) {
          throw new Error("Expected `client` to be defined.");
        }

        client.stocks.delete(symbol);
        break;
      }
      case COMMAND.DISCONNECT:
        console.log("Disconnecting...");
        closeSocket(sessionId);
        break;

      default:
        sendError(ws, "No valid command frame");
        break;
    }
  });

  ws.on("close", function () {
    closeSocket(sessionId);
  });
});

connectToAmqp();
