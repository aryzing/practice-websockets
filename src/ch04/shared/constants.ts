export const stompRegisteredName = "v10.stomp";
export const queueStocksResult = "stocks.result";
export const queueStocksWork = "stocks.work";

export enum COMMAND {
  CONNECT = "CONNECT",
  CONNECTED = "CONNECTED",
  SUBSCRIBE = "SUBSCRIBE",
  UNSUBSCRIBE = "UNSUBSCRIBE",
  DISCONNECT = "DISCONNECT",
  MESSAGE = "MESSAGE",
}
