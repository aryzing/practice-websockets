import {Server} from 'ws';

const wss = new Server({port: 8181});

wss.on('connection', (ws) => {
  console.log('client connected');
  ws.on('message', (message) => {
    console.log(message);
  });
});
