import React from "react";
import io from "socket.io-client";
import { v4 as uuid } from "uuid";

const myId = uuid();
const socket = io("http://localhost:8080");
socket.on("connect", () => {
  console.log("Connected to server");
});

export const Chat = () => {
  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const [typing, setTyping] = React.useState(false);

  const handleFormSubmit = (event) => {
    event.preventDefault();

    if (message.trim()) {
      socket.emit("chat.message", {
        id: myId,
        message,
      });
      setMessage("");
    }
  };

  const handleInputChange = (event) => {
    setMessage(event.target.value);
    socket.emit("chat.typing", {
      id: myId,
      message,
    });
  };

  React.useEffect(() => {
    const handleNewMessage = (newMessage) => {
      setMessages((messages) => [...messages, newMessage]);
      setTyping(false);
    };

    socket.on("chat.message", handleNewMessage);

    return () => {
      socket.off("chat.message", handleNewMessage);
    };
  }, [messages]);

  React.useEffect(() => {
    const handleTyping = (data) => {
      console.log(data);
      if (data.id !== myId) {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
        }, 10000);
      }
    };

    socket.on("chat.typing", handleTyping);

    return () => {
      socket.off("chat.typing", handleTyping);
    };
  }, [message]);

  return (
    <main className="container">
      <ul className="list">
        {messages.map((m, index) => (
          <li
            className={`list__item list__item--${
              m.id === myId ? "mine" : "other"
            }`}
            key={index}
          >
            <span
              className={`message message--${m.id === myId ? "mine" : "other"}`}
            >
              {m.message}
            </span>
          </li>
        ))}
      </ul>
      <span>
        {typing ? <strong>{myId} está escrevendo:</strong> : ""}
      </span>
      <form className="form" onSubmit={handleFormSubmit}>
        <input
          type="text"
          className="form__field"
          placeholder="Escreva"
          onChange={handleInputChange}
          value={message}
        />
      </form>
    </main>
  );
};
