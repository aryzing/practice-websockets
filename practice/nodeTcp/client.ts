import { Socket, AddressInfo } from "net";

const client = new Socket();
client.connect({
  port: 2222,
});

client.on("connect", function () {
  console.log("Client: connection established with server");

  console.log("---------client details -----------------");
  const address = client.address() as AddressInfo;

  const port = address.port;
  const family = address.family;
  const ipaddr = address.address;

  console.log("Client is listening on port" + port);
  console.log("Client ip: " + ipaddr);
  console.log("Client is IP4/IP6: " + family);

  // writing data to server
  client.write("hello from client");
});

client.setEncoding("utf8");

client.on("data", function (data) {
  console.log("Data from server:" + data);
});

setTimeout(function () {
  client.end("Bye bye server");
}, 5000);

// NOTE: all the events of the socket are applicable to `client`.

//
// Alternative: creating client using net.connect instead of custom socket
//

// const client = net.connect({ port: 2222 }, () => {
//   // 'connect' listener
//   console.log("connected to server!");
//   client.write("world!\r\n");
// });
// client.on("data", (data) => {
//   console.log(data.toString());
//   client.end();
// });
// client.on("end", () => {
//   console.log("disconnected from server");
// });
