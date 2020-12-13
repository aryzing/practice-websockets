const stocks = {
  AAPL: 0,
  MSFT: 0,
  AMZN: 0,
  GOOG: 0,
  YHOO: 0,
};

const stockRequest = { stocks: ["AAPL", "MSFT", "AMZN", "GOOG", "YHOO"] };

const localIp = "192.168.1.9";
const ws = new WebSocket(`ws://${localIp}:8181`);

// Connection opened
ws.addEventListener("open", (event) => {
  console.log("Connection established");
  ws.send(JSON.stringify(stockRequest));
});

// WebSocket connection established
// ws.onopen = function(e) {
//   console.log('Connection established');
//   ws.send(JSON.stringify(stockRequest));
// };

// UI update function
const changeStockEntry = function (symbol, originalValue, newValue) {
  const valElem = $("#" + symbol + " span");
  valElem.html(newValue.toFixed(2));
  if (newValue < originalValue) {
    valElem.addClass("label-danger");
    valElem.removeClass("label-success");
  } else if (newValue > originalValue) {
    valElem.addClass("label-success");
    valElem.removeClass("label-danger");
  }
};

// WebSocket message handler
ws.onmessage = function (e) {
  const stocksData = JSON.parse(e.data);
  for (const symbol in stocksData) {
    if (stocksData.hasOwnProperty(symbol)) {
      changeStockEntry(symbol, stocks[symbol], stocksData[symbol]);
      stocks[symbol] = stocksData[symbol];
    }
  }
};

const handleErrors = (e) => {
  console.error(e);
};

ws.onerror = function (e) {
  console.log("WebSocket failure, error", e);
  handleErrors(e);
};

ws.onclose = function (e) {
  console.log(e.reason + " " + e.code);
  for (const symbol in stocks) {
    if (stocks.hasOwnProperty(symbol)) {
      stocks[symbol] = 0;
    }
  }
};
