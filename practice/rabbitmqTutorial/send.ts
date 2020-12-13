import amqp from "amqplib";

const main = async () => {
  const connection = await amqp.connect("amqp://localhost");

  const channel = await connection.createChannel();

  const queue = "hello";

  channel.assertQueue(queue, {
    durable: false,
  });

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const message = `Hello queue! ${new Date().toISOString()}`;
    channel.sendToQueue(queue, Buffer.from(message));
    await new Promise((r) => setTimeout(r, 20));
  }
};

main();
