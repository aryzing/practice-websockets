# Using STOMP over WebSocket and TCP

This example showcases how a web client and a TCP client interact with a STOMP broker using STOMP over WebSockets and TCP, respectively. This example uses RabbitMQ as configured in [`rabbitmq.dockerfile`](practice/rabbitMqWithPlugins/rabbitmq.dockerfile) as the broker.

To run this example, run the following commands from the root of the repo,

```bash
yarn
docker build -f practice/rabbitMqWithPlugins/rabbitmq.dockerfile -t rabbitmqwithplugins:1.0.0 .

# in another terminal
# notes:
#   * port 15674 is for STOMP over WebSockets
#   * port 61613 is for STOMP over TCP
docker run -it --rm --name rabbitmqwithplugins -p 5672:5672 -p 15672:15672 -p 15674:15674 -p 61613:61613 rabbitmqwithplugins:1.0.0

# in another terminal
yarn rollup -c src/ch04/clientStompWs/rollup.config.js -w

# in another terminal
yarn serve src/ch04/clientStompWs
```

You can now open a browser and navigate to this example's path using the link provided by the `serve` command above.

# Experiments

Opened multiple tabs of the app and started to send messages using a queue or a topic:

* When sending message to a topic, all consumers receive the message
* when sending message to a queue, one consumer receives the message. The consumer changes for each message.

[Here][1] is an overview of STOMP destinations used by RabbitMQ

With the tabs still opened, started a STOMP session using `netcat` to send messages,

```bash
nc localhost 61613
```

Then typed the following to initiate a session and send a message to `/topic/echo`. Note,
  * Lines beginning with `>` are server responses. The `>` character is not present in the server responses but has been added here for clarity.
  * The sequence `^@` represents the null byte, which is produced with the key combination `ctrl+shift+2` in bash.
```
CONNECT
accept-version:1.2

^@
> CONNECTED
> server:RabbitMQ/3.7.28
> session:session-cDEFm7b2aG0lk_7F4uKrrQ
> heart-beat:0,0
> version:1.2
>
>
SEND
destination:/topic/echo
content-length:5

hello^@

```

# Useful link

* [Using StompJs v5 - StompJS Family][2]

[1]: https://www.rabbitmq.com/stomp.html#d
[2]: https://stomp-js.github.io/guide/stompjs/using-stompjs-v5.html