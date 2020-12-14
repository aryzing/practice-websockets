import { FC, useEffect, useRef, useState, Fragment } from "react";
import { render } from "react-dom";
import {
  processFrame,
  sendFrame,
  symbolFromDestination,
} from "../shared/stompHelper";
import { COMMAND, stompRegisteredName } from "../shared/constants";
import styled from "styled-components";

const useStocks = (): {
  stocks: Map<string, number>;
  setStocks: (stocks: Array<[string, number]>) => void;
  deleteStock: (stock: string) => void;
} => {
  const [_, forceRender] = useState(0);
  const mapRef = useRef<Map<string, number>>(new Map<string, number>());

  const setStocks = (stocks: Array<[string, number]>) => {
    for (const [stock, value] of stocks) {
      mapRef.current.set(stock, value);
    }
    forceRender(Math.random());
  };

  const deleteStock = (symbol: string) => {
    mapRef.current.delete(symbol);
    forceRender(Math.random());
  };

  return { stocks: mapRef.current, setStocks, deleteStock };
};

const StockTable = styled("div")`
  display: grid;
  grid-template-columns: auto auto auto;
  grid-template-rows: auto;
  /* grid-template-areas: "symbol price actions"; */
`;

const StockSymbol = styled("div")`
  /* grid-area: symbol; */
`;
const StockPrice = styled("div")`
  /* grid-area: price; */
`;
const StockActions = styled("div")`
  /* grid-area: actions; */
`;

const App: FC = () => {
  const { stocks, setStocks, deleteStock } = useStocks();
  const [stock, setStock] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  const connect = () => {
    const localIp = "localhost"; // The TLS certs should cater for this ip or name
    const ws = new WebSocket(`ws://${localIp}:8181`, stompRegisteredName);

    wsRef.current = ws;

    ws.addEventListener("open", () => {
      sendFrame(ws, {
        command: COMMAND.CONNECT,
      });
    });

    ws.addEventListener("close", () => {
      console.log("Connection closed");
    });

    ws.addEventListener("message", (message) => {
      const { command, content, headers } = processFrame(message.data);
      switch (command) {
        case COMMAND.CONNECTED: {
          setIsOnline(true);
          return;
        }
        case COMMAND.MESSAGE: {
          const stock = symbolFromDestination(headers?.destination ?? "");
          const price = JSON.parse(content ?? "{}").price;
          setStocks([[stock, price]]);
        }
      }
    });
  };

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const subscribe = (stock: string) => {
    if (!wsRef.current) {
      return;
    }

    if (stocks.has(stock)) {
      alert(`You've already added ${stock}.`);
    }

    setStocks([[stock, 0]]);

    sendFrame(wsRef.current, {
      command: COMMAND.SUBSCRIBE,
      headers: {
        destination: `/queue/stocks.${stock}`,
      },
    });

    setStock("");
  };

  const unsubscribe = (symbol: string) => {
    deleteStock(symbol);
    if (!wsRef.current) {
      return;
    }
    sendFrame(wsRef.current, {
      command: COMMAND.UNSUBSCRIBE,
      headers: {
        destination: `/queue/stocks.${symbol}`,
      },
    });
  };
  return (
    <>
      <h1>Stocks</h1>
      <div>
        <input
          onChange={(e) => setStock(e.currentTarget.value)}
          value={stock}
        ></input>
        <button
          onClick={() => {
            subscribe(stock);
          }}
        >
          Add
        </button>
      </div>
      <StockTable>
        {[...stocks.entries()].map(([stock, price]) => {
          return (
            <Fragment key={stock}>
              <StockSymbol key={`${stock}-symbol`}>{stock}</StockSymbol>
              <StockPrice key={`${stock}-price`}>{price}</StockPrice>
              <StockActions key={`${stock}-actions`}>
                <button
                  onClick={() => {
                    unsubscribe(stock);
                  }}
                >
                  Remove
                </button>
              </StockActions>
            </Fragment>
          );
        })}
      </StockTable>
      <div>
        <button
          onClick={() => {
            if (!isOnline) {
              connect();
              return;
            }

            setIsOnline(false);

            if (!wsRef.current) {
              return;
            }

            sendFrame(wsRef.current, {
              command: COMMAND.DISCONNECT,
            });
            wsRef.current.close();
          }}
          style={{ backgroundColor: isOnline ? "green" : "red" }}
        >
          {isOnline ? "connected" : "disconnected"}
        </button>
      </div>
    </>
  );
};

const el = document.getElementById("root");

render(<App />, el);
