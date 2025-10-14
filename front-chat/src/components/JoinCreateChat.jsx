import React, { useState } from 'react';
import chatIcon from "../assets/chat.png";
import toast from 'react-hot-toast';
import { createRoomApi, joinChatApi } from '../services/RoomService';
import useChatContext from '../context/ChatContext';
import { useNavigate } from 'react-router';

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  });

  const {
    setRoomId,
    setCurrentUser,
    setConnected,
  } = useChatContext();

  const navigate = useNavigate();

  // ✅ Handle form input changes
  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  // ✅ Form validation
  function validateForm() {
    if (detail.roomId.trim() === "" || detail.userName.trim() === "") {
      toast.error("Both fields are required!");
      return false;
    }
    return true;
  }

  // ✅ Join an existing chat room
  async function joinChat() {
    if (validateForm()) {
      try {
        const room = await joinChatApi(detail.roomId);

        toast.success("Joined room successfully!");

        // Update context
        setCurrentUser(detail.userName);
        setRoomId(room.roomId);
        setConnected(true);

        // ✅ Save to localStorage for persistence
        localStorage.setItem("currentUser", detail.userName);
        localStorage.setItem("roomId", room.roomId);
        localStorage.setItem("connected", "true");

        navigate("/chat");

      } catch (error) {
        if (error.status === 400) {
          toast.error(error.response.data);
        } else {
          toast.error("Error joining room");
        }
        console.error(error);
      }
    }
  }

  // ✅ Create a new chat room
  async function createRoom() {
    if (validateForm()) {
      try {
        const response = await createRoomApi(detail.roomId);

        toast.success("Room created successfully!");

        // Update context
        setCurrentUser(detail.userName);
        setRoomId(response.roomId);
        setConnected(true);

        // ✅ Save to localStorage for persistence
        localStorage.setItem("currentUser", detail.userName);
        localStorage.setItem("roomId", response.roomId);
        localStorage.setItem("connected", "true");

        navigate("/chat");

      } catch (error) {
        console.error(error);
        if (error.status === 400) {
          toast.error("Room ID already exists!");
        } else {
          toast.error("Error creating room");
        }
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-10 dark:border-gray-700 w-full flex flex-col gap-5 max-w-md rounded dark:bg-gray-900 shadow">
        <div>
          <img src={chatIcon} className="w-24 mx-auto" alt="Chat icon" />
        </div>
        <h1 className="text-2xl font-semibold text-center mb-6">
          Join Room / Create Room
        </h1>

        {/* Username input */}
        <div>
          <label htmlFor="name" className="block font-medium mb-2">
            Your name
          </label>
          <input
            onChange={handleFormInputChange}
            value={detail.userName}
            type="text"
            id="name"
            name="userName"
            placeholder="Enter your name"
            className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Room ID input */}
        <div>
          <label htmlFor="roomId" className="block font-medium mb-2">
            Room ID / New Room ID
          </label>
          <input
            name="roomId"
            onChange={handleFormInputChange}
            value={detail.roomId}
            type="text"
            id="roomId"
            placeholder="Enter room ID"
            className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={joinChat}
            className="px-3 py-2 dark:bg-blue-500 hover:dark:bg-blue-800 rounded-lg text-white"
          >
            Join Room
          </button>
          <button
            onClick={createRoom}
            className="px-3 py-2 dark:bg-orange-500 hover:dark:bg-orange-800 rounded-lg text-white"
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;
