import axios from "axios";
import amqp from "amqplib";
import { StocksResult } from "../shared/types";
import { queueStocksResult, queueStocksWork } from "../shared/constants";

const fetchStocks = async (stocks: Array<string>): Promise<StocksResult> => {
  const stocksResult: StocksResult = [];
  let res;
  for (const stock of stocks) {
    try {
      res = await axios.get("https://finnhub.io/api/v1/quote", {
        params: {
          symbol: stock,
        },
        headers: {
          "X-Finnhub-Token": "bv7qtin48v6vtp9vinn0",
        },
      });
    } catch (error) {
      console.error("Failed to fetch.", error);
    }

    stocksResult.push({ symbol: stock, price: res?.data.c });
  }

  return stocksResult;
};

const isSymbols = (data: unknown): data is Array<string> => {
  if (!Array.isArray(data)) {
    return false;
  }

  for (const elem of data) {
    if (typeof elem !== "string") {
      return false;
    }
  }
  return true;
};

const main = async () => {
  const connection = await amqp.connect("amqp://localhost");

  const channelStocksResult = await connection.createChannel();
  channelStocksResult.assertQueue(queueStocksResult);

  const channelStocksWork = await connection.createChannel();
  channelStocksWork.assertQueue(queueStocksWork);

  channelStocksWork.consume(queueStocksWork, async (message) => {
    let symbols;
    try {
      const messageString = message?.content.toString();
      if (typeof messageString !== "string") {
        throw new Error("Expected `messageString` to be a string.");
      }
      symbols = JSON.parse(messageString);
    } catch (err) {
      console.error(err);
    }

    if (!isSymbols(symbols)) {
      console.error("Expected `stocks` to be of type `StockResult`.");
      return;
    }

    const stocks = await fetchStocks(symbols);

    channelStocksResult.sendToQueue(
      queueStocksResult,
      Buffer.from(JSON.stringify(stocks))
    );
  });
};

main();
