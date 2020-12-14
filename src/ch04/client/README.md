# Stocks Client

Inspired by client code of O'Reilly's book Websocket, chatper 4, and using React.

To run,

```bash
yarn

# start RabbitMQ
docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# in another terminal, start the server
yarn ts-node src/ch04/server/server.ts

# in another terminal, start the deamon
yarn ts-node src/ch04/server/deamon.ts

# in another terminal
yarn rollup -c src/ch04/client/rollup.config.js -w

# in another terminal
yarn serve src/ch04/client
```

You can now open the browser at the URL provided by the `serve` command to view realtime stock data. The stock data is provided by [Finnhub][1].

The above processes are connected as follows

```mermaid
sequenceDiagram
    participant Browser
    participant Server
    participant Daemon
    participant RabbitMQ
    participant Finnhub

    Browser->>Server: [ws] STOMP: CONNECT
    Server->>Browser: [ws] STOMP: CONNECTED
    loop Subscribing to stocks
        Browser->>Server: [ws] STOMP: SUBSCRIBE(stock)
        loop
            Server->>RabbitMQ: [tcp] AMQP: publish queue `stocks.work`
            RabbitMQ->>Daemon: [tcp] AMQP: consume queue `stocks.work`
            Daemon->>Finnhub: [tcp] HTTP: GET stock price
            Finnhub-->>Daemon: [tcp] HTTP: response stock price
            Daemon->>RabbitMQ: [tcp] AMQP: publish queue `stocks.result`
            RabbitMQ->>Server: [tcp] AMQP: consume queue `stocks.result`
            Server->>Browser: [ws] STOMP: MESSAGE(stock,price)
        end
    end
    loop Unsubscribing to stocks
        Browser->>Server: [ws] STOMP: UNSUBSCRIBE(stock)
    end
    Browser->>Server: [ws] STOMP: DISCONNECT
```

[1]: https://finnhub.io/docs/api