import { createServer } from "net";

// creates the server
const server = createServer();

// emitted when server closes ...not emitted until all connections closes.
server.on("close", function () {
  console.log("Server closed !");
});

// emitted when new client connects
server.on("connection", function (socket) {
  // this property shows the number of characters currently buffered to be written. (Number of characters is approximately equal to the number of bytes to be written, but the buffer may contain strings, and the strings are lazily encoded, so the exact number of bytes is not known.)
  // Users who experience large or growing bufferSize should attempt to "throttle" the data flows in their program with pause() and resume().

  console.log("Buffer size : " + socket.bufferSize);

  console.log("---------server details -----------------");

  const address = server.address();

  let port;
  let family;
  let ipaddr;
  if (address && typeof address !== "string") {
    port = address.port;
    family = address.family;
    ipaddr = address.address;
  }
  console.log("Server is listening at port " + port);
  console.log("Server ip: " + ipaddr);
  console.log("Server is IP4/IP6 : " + family);

  const lport = socket.localPort;
  const laddr = socket.localAddress;
  console.log("Server is listening at LOCAL port " + lport);
  console.log("Server LOCAL ip:" + laddr);

  console.log("------------remote client info --------------");

  const rport = socket.remotePort;
  const raddr = socket.remoteAddress;
  const rfamily = socket.remoteFamily;

  console.log("REMOTE Socket is listening at port: " + rport);
  console.log("REMOTE Socket ip: " + raddr);
  console.log("REMOTE Socket is IP4/IP6: " + rfamily);

  console.log("--------------------------------------------");
  // var no_of_connections =  server.getConnections(); // sychronous version
  server.getConnections(function (_error, count) {
    console.log("Number of concurrent connections to the server: " + count);
  });

  socket.setEncoding("utf8");

  socket.setTimeout(800 * 1000, function () {
    // called after timeout -> same as socket.on('timeout')
    // it just tells that soket timed out => its ur job to end or destroy the socket.
    // socket.end() vs socket.destroy() => end allows us to send final data and allows some i/o activity to finish before destroying the socket
    // whereas destroy kills the socket immediately irrespective of whether any i/o operation is goin on or not...force destry takes place
    console.log("Socket timed out");
  });

  socket.on("data", function (data) {
    const bread = socket.bytesRead;
    const bwrite = socket.bytesWritten;
    console.log("Bytes read : " + bread);
    console.log("Bytes written : " + bwrite);
    console.log("Data sent to server : " + data);

    // echo data
    //
    // Docs for `socket.write` briefly mention the relationship between
    // `socket.write`, the kernel buffer, and the `drain` event.
    // https://nodejs.org/api/net.html#net_socket_write_data_encoding_callback
    const isKernelBufferFull = socket.write("Data ::" + data);
    if (isKernelBufferFull) {
      console.log(
        "Data was flushed successfully to kernel buffer i.e written successfully!"
      );
    } else {
      socket.pause();
    }
  });

  socket.on("drain", function () {
    console.log(
      "write buffer is empty now .. u can resume the writable stream"
    );
    socket.resume();
  });

  socket.on("error", function (error) {
    console.log("Error : " + error);
  });

  socket.on("timeout", function () {
    console.log("Socket timed out !");
    socket.end("Timed out!");
    // can call socket.destroy() here too.
  });

  socket.on("end", function (data: unknown) {
    console.log("Socket ended from other end!");
    console.log("End data : " + data);
  });

  socket.on("close", function (error) {
    const bread = socket.bytesRead;
    const bwrite = socket.bytesWritten;
    console.log("Bytes read : " + bread);
    console.log("Bytes written : " + bwrite);
    console.log("Socket closed!");
    if (error) {
      console.log("Socket was closed coz of transmission error");
    }
  });

  setTimeout(function () {
    const isdestroyed = socket.destroyed;
    console.log("Socket destroyed:" + isdestroyed);
    socket.destroy();
  }, 1200 * 1000);
});

// emits when any error occurs -> calls closed event immediately after this.
server.on("error", function (error) {
  console.log("Error: " + error);
});

// emits when server is bound with server.listen
server.on("listening", function () {
  console.log("Server is listening!");
});

server.maxConnections = 10;

// static port allocation
server.listen(2222);

// for dyanmic port allocation
// server.listen(function () {
//   const address = server.address();
//   const port = address.port;
//   const family = address.family;
//   const ipaddr = address.address;
//   console.log("Server is listening at port" + port);
//   console.log("Server ip :" + ipaddr);
//   console.log("Server is IP4/IP6 : " + family);
// });

const islistening = server.listening;

if (islistening) {
  console.log("Server is listening");
} else {
  console.log("Server is not listening");
}

setTimeout(function () {
  server.close();
}, 5000000);
