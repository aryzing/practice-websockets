import amqp from "amqplib";

const main = async () => {
  const connection = await amqp.connect("amqp://localhost");

  const channel = await connection.createChannel();

  const queue = "hello";

  channel.assertQueue(queue, {
    durable: false,
  });

  channel.consume(
    queue,
    (message) => {
      console.log("Consumed message: ", message?.content.toString());
    },
    { noAck: true }
  );
};

main();
