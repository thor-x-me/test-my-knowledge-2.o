"use client";
import React from "react";

interface Props {
  sender: "user" | "bot";
  text: string;
}

const ChatMessage: React.FC<Props> = ({ sender, text }) => {
  const isUser = sender === "user";

  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm">
          🤖
        </div>
      )}
      <div
        className={`px-4 py-2 rounded-2xl max-w-[70%] break-words ${
          isUser
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-200 text-gray-800 rounded-bl-none"
        }`}
      >
        {text}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
          👤
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
