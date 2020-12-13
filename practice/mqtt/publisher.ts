import mqtt from "mqtt";

const client = mqtt.connect("mqtt://test.mosquitto.org");
await client.subscribe("presence");
client.on("message", (_topic, message) => {
  console.log(message.toString());
  client.end();
});
