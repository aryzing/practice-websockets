# Client

Behaves like [chapter 4's client](../../ch04/client/README.md), but using TLS.

To get started, run

```bash
yarn

# start RabbitMQ
docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# in another terminal, start the server
yarn ts-node src/ch06/server/server.ts

# in another terminal, start the deamon
yarn ts-node src/ch06/server/deamon.ts

# in another terminal
yarn rollup -c src/ch06/client/rollup.config.js -w

# in another terminal
yarn serve src/ch06/client
# or with tls
yarn serve --ssl-cert src/ch06/server/localhost.crt --ssl-key src/ch06/server/localhost.key src/ch06/client
```

* what happens when not using https for `serve`?
  * nothing, everything works as expected
* and when using https for serve, is rollup impacted?
  * Yes. The `ws` connection is deemed insecure
* What happens when using `ws://` on client?
  * always fails, server only works with TLS
* What happens when using `wss://` on client?
  * always works