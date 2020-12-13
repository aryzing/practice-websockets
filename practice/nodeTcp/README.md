# Practicing TCP connections

Code taken from [this gist][1].

## 1. Sending text over TCP to server

To start, 

```bash
yarn
yarn ts-node practice/nodeTcp/server.ts

# In another terminal.
nc localhost 2222
```

Note: netcat sends the text on newline or EOF (ctrl-d). The NULL character (ctrl+shift+2) doesn't trigger any special behaviour in netcat. A message with a NULL character will only be sent once netcat receives a newline or a EOF.

## 2. Using a Node.js TCP client

```bash
yarn
yarn ts-node practice/nodeTcp/server.ts

# In another terminal.
yarn ts-node practice/nodeTcp/client.ts
```


[1]: https://gist.github.com/sid24rane/2b10b8f4b2f814bd0851d861d3515a10