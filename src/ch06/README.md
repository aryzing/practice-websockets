# Stocks Client using TLS

This example builds atop [Chapter 4's example](../ch04/README.md). It uses TLS for WebSockets. It is otherwise identical.

In order to be able to run this examaple, make sure you've generated a self-signed certificate that can be used in `localhost`. You can follow the steps from this [Stackoverflow post][1] to generate one.

The server expects the key and certificate files to be called `localhost.key` and `localhost.crt`, respectively, and placed in the `server` directory.

[1]: https://stackoverflow.com/a/60516812/1494725