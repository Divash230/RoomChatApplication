import React, { useState, useRef, useEffect } from 'react';
import { MdAttachFile, MdSend } from 'react-icons/md';
import useChatContext from '../context/ChatContext';
import { useNavigate } from 'react-router';
import SockJS from 'sockjs-client';
import { baseURL } from '../config/AxiosHelper';
import toast from 'react-hot-toast';
import { Stomp } from '@stomp/stompjs';
import { getMessages } from '../services/RoomService';
import { timeAgo } from '../config/Helper';

const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();

  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  // ✅ Restore state from localStorage if needed
  useEffect(() => {
    const savedRoomId = localStorage.getItem('roomId');
    const savedUser = localStorage.getItem('currentUser');
    const savedConnected = localStorage.getItem('connected') === 'true';

    if (!connected && savedConnected && savedRoomId && savedUser) {
      setRoomId(savedRoomId);
      setCurrentUser(savedUser);
      setConnected(true);
      return;
    }

    if (!connected) {
      navigate('/');
    }
  }, [connected]);

  // ✅ Load messages when connected
  useEffect(() => {
    async function loadMessages() {
      try {
        const messages = await getMessages(roomId);
        setMessages(messages);
      } catch (error) {
        toast.error('Failed to load messages');
      }
    }

    if (connected) {
      loadMessages();
    }
  }, [roomId, connected]);

  // ✅ Scroll to bottom on new messages
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // ✅ Initialize STOMP WebSocket client
  useEffect(() => {
    const connectWebSocket = () => {
      const client = Stomp.over(() => new SockJS(`${baseURL}/chats`));
      client.connect({}, () => {
        setStompClient(client);
        toast.success('Connected to chat');

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const newMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, newMessage]);
        });
      });
    };

    if (connected) {
      connectWebSocket();
    }
  }, [roomId]);

  // ✅ Send message
  const sendMessage = () => {
    if (stompClient && connected && input.trim()) {
      const message = {
        sender: currentUser,
        content: input,
        roomId: roomId,
      };

      stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message));
      setInput('');
    }
  };

  // ✅ Logout and cleanup
  const handleLogout = () => {
    if (stompClient) {
      stompClient.disconnect();
    }

    setConnected(false);
    setRoomId('');
    setCurrentUser('');

    localStorage.removeItem('roomId');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('connected');

    navigate('/');
  };

  return (
    <div className="">
      {/* Header */}
      <header className="mt-1 dark:border-gray-700 h-20 fixed w-full border dark:bg-gray-900 py-5 flex justify-around items-center">
        <div>
          <h1 className="text-xl font-semibold">
            Room: <span>{roomId}</span>
          </h1>
        </div>
        <div>
          <h1 className="text-xl font-semibold">
            User: <span>{currentUser}</span>
          </h1>
        </div>
        <div>
          <button
            onClick={handleLogout}
            className="dark:bg-red-500 dark:hover:bg-red-700 px-3 py-2 rounded-full"
          >
            Leave Room
          </button>
        </div>
      </header>

      {/* Chat Messages */}
      <main
        ref={chatBoxRef}
        className="py-20 px-10 w-2/3 dark:bg-slate-600 mx-auto h-screen overflow-auto"
      >
        <div className="message-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === currentUser ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`my-2 ${
                  message.sender === currentUser ? 'bg-green-800' : 'bg-gray-800'
                } p-2 max-w-xs rounded`}
              >
                <div className="flex flex-row gap-2">
                  <img
                    className="h-10"
                    src="https://avatar.iran.liara.run/public/15"
                    alt=""
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold">{message.sender}</p>
                    <p>{message.content}</p>
                    <p className="text-xs text-gray-400">
                      {timeAgo(message.timeStamp)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-4 w-full h-16">
        <div className="h-full pr-10 gap-4 flex items-center justify-between rounded-full w-1/2 mx-auto dark:bg-gray-900">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            type="text"
            placeholder="Type your message here..."
            className="w-full dark:border-gray-600 dark:bg-gray-800 focus:outline-none px-5 py-2 rounded-full h-full"
          />

          <div className="flex gap-1">
            <button className="relative dark:bg-purple-600 h-10 w-10 flex items-center justify-center rounded-full">
              <MdAttachFile
                size={20}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
              />
            </button>
            <button
              onClick={sendMessage}
              className="relative dark:bg-green-600 h-10 w-10 flex items-center justify-center rounded-full"
            >
              <MdSend
                size={20}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
