import WebSocket, { Server } from "ws";
const wsServer = new Server({ port: 8181 });

const stocks: Record<string, number> = {
  AAPL: 95.0,
  MSFT: 50.0,
  AMZN: 300.0,
  GOOG: 550.0,
  YHOO: 35.0,
};

const randomInterval = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// let stockUpdater;
const randomStockUpdater = () => {
  for (const symbol in stocks) {
    if (stocks.hasOwnProperty(symbol)) {
      const randomizedChange = randomInterval(-150, 150);
      const floatChange = randomizedChange / 100;
      stocks[symbol] += floatChange;
    }
  }
  const randomMSTime = randomInterval(500, 2500);
  /* stockUpdater = */ setTimeout(function () {
    randomStockUpdater();
  }, randomMSTime);
};

randomStockUpdater();

wsServer.on("connection", function (ws) {
  console.log("client connected");
  // let clientStockUpdater: NodeJS.Timeout | undefined;
  let clientStocks: Array<string> = [];
  const sendStockUpdates = (ws: WebSocket) => {
    if (ws.readyState == 1) {
      const stocksObj: Record<string, number> = {};

      for (let i = 0; i < clientStocks.length; i++) {
        const symbol = clientStocks[i];
        if (typeof symbol === "string") {
          const val = stocks[symbol];
          if (typeof val === "number") {
            stocksObj[symbol] = val;
          }
        }
      }

      ws.send(JSON.stringify(stocksObj));
    }
  };
  const clientStockUpdater = setInterval(function () {
    sendStockUpdates(ws);
  }, 1000);

  ws.on("message", function (message) {
    const stockRequest = JSON.parse(message.toString());
    clientStocks = stockRequest["stocks"];
    sendStockUpdates(ws);
  });

  ws.on("close", function () {
    if (typeof clientStockUpdater !== "undefined") {
      clearInterval(clientStockUpdater);
    }
  });
});
