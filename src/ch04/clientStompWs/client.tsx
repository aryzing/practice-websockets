import { FC, useEffect, useRef, useState } from "react";
import { render } from "react-dom";
import { Client } from "@stomp/stompjs";

// const queueEcho = "/queue/echo";
const topicEcho = "/topic/echo";

const initialMessage = "hi echo";

const App: FC = () => {
  const clientRef = useRef<Client | null>(null);
  const messageRef = useRef<string>(initialMessage);
  const [isOnline, setIsOnline] = useState(false);
  const [echoMessage, setEchoMessage] = useState(initialMessage);
  const [receivedMessages, setReceivedMessages] = useState<Array<string>>([]);

  const connect = () => {
    const localIp = "192.168.1.9";
    const brokerURL = `ws://${localIp}:15674/ws`;

    const client = new Client({
      brokerURL,
      // Apparently no creds needed when running everything in localhost
      // connectHeaders: {
      //   login: "guest",
      //   passcode: "guest",
      // },
    });

    clientRef.current = client;

    // Disable hearbeating. Makes debugging easier as logs aren't cluttered by
    // heartbeats.
    // https://stomp-js.github.io/guide/stompjs/using-stompjs-v5.html#heart-beating
    client.heartbeatOutgoing = 0;
    client.heartbeatIncoming = 0;

    client.onConnect = function () {
      client.subscribe(topicEcho, (message) => {
        console.log("ARY message", message);
        setReceivedMessages((prevState) => {
          return [message.body, ...prevState].splice(0, 10); // just keep latest 10 messages
        });
      });
    };

    client.onStompError = function (frame) {
      // Will be invoked in case of error encountered at Broker
      // Bad login/passcode typically will cause an error
      // Complaint brokers will set `message` header with a brief message. Body may contain details.
      // Compliant brokers will terminate the connection after any error
      console.log("Broker reported error: " + frame.headers["message"]);
      console.log("Additional details: " + frame.body);
    };

    client.activate();

    setIsOnline(true);
  };

  const disconnect = () => {
    setIsOnline(false);

    if (!clientRef.current) {
      return;
    }

    clientRef.current.deactivate();
  };

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  const sendMessage = () => {
    if (!clientRef.current) {
      return;
    }

    clientRef.current.publish({
      destination: topicEcho,
      body: echoMessage,
    });
  };

  return (
    <>
      <h1>Echo</h1>
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <input
            onChange={(e) => {
              const msg = e.currentTarget.value;
              setEchoMessage(msg);
              messageRef.current = msg;
            }}
            value={echoMessage}
          ></input>
          <button type="submit">Send</button>
        </form>
      </div>
      <div>
        {receivedMessages.map((m, i) => {
          return <p key={i}>{m}</p>;
        })}
      </div>
      <div>
        <button
          onClick={() => {
            if (!isOnline) {
              connect();
              return;
            }

            disconnect();
          }}
          style={{ backgroundColor: isOnline ? "green" : "red" }}
        >
          {isOnline ? "connected" : "disconnected"}
        </button>
      </div>
    </>
  );
};

const el = document.getElementById("root");

render(<App />, el);
