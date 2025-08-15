import { useState, useEffect, useRef } from "react";
import { Bot, BotIcon, User } from "lucide-react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid"; // For generating unique sessionId
import useAuthStore from "../../stores/authStore";
import { N8N_BASE_URL } from "../../config/constants";
import "./chatBot.css";

const ChatBot = ({ showChatbot, setShowChatbot }) => {
  const { user } = useAuthStore();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hello! I'm your AI assistant. How can I help you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    // Generate a session ID only once per chatbot session
    setSessionId(uuidv4());
  }, []);
  const token = useAuthStore.getState().token;
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${N8N_BASE_URL}?user_id=${user?.id}`,
        {
          action: "sendMessage",
          chatInput: input,
          sessionId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const botMessage = { from: "bot", text: response.data.output };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // scrolls on new message
  return showChatbot ? (
    <div className="absolute bottom-20 right-0 w-80 h-96 bg-dark/90 backdrop-blur-lg border border-primary/20 rounded-lg shadow-2xl p-4 animate-slideInUp flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary dark:text-white" />
          <span className="font-medium dark:text-white">AI Assistant</span>
        </div>
        <button
          onClick={() => setShowChatbot(false)}
          className="text-gray-400 hover:text-gray-900 dark:text-white dark:hover:text-primary-300"
        >
          &times;
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col space-y-2 pr-1 ">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2 ${
              msg.from !== "bot" ? "justify-end" : ""
            }`}
          >
            {msg.from === "bot" && (
              <span className="bg-red-200 rounded-full p-2">
                <BotIcon />
              </span>
            )}
            <div
              className={`rounded-lg p-3 max-w-[80%] ${
                msg.from === "bot"
                  ? "bg-gray-700 text-white self-start"
                  : "bg-gray-200 text-black self-end"
              }`}
              style={{ fontSize: "clamp(0.65rem, 2vw, 0.7rem)" }}
            >
              {msg.text}
            </div>
            {msg.from !== "bot" && (
              <span className="bg-primary-200 rounded-full p-2">
                <User size={20} />
              </span>
            )}
          </div>
        ))}
        {loading && (
          <div
            className="bg-primary/10 rounded-lg p-3 max-w-[100%]  self-start"
            style={{ fontSize: " clamp(0.65rem, 2vw, 0.7rem)" }}
          >
            Typing...
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="mt-2">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-dark/50 border border-gray-700 rounded-full px-4 py-2  focus:outline-none focus:border-primary"
            style={{
              color: "black",
              fontSize: " clamp(0.65rem, 2vw, 0.7rem)",
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-gray-300 rounded-full w-10 h-10 flex items-center justify-center text-black disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default ChatBot;
