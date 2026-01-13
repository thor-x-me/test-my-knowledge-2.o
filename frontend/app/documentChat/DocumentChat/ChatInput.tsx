// "use client";
// import React, { useState } from "react";
// import { ArrowUpRight } from "lucide-react";
// import { chatWithDocument } from "../services/documentChatApi";
// import { useDocumentChatStore } from "../store/documentChatStore";

// const ChatInput: React.FC = () => {
//   const [text, setText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const { addMessage } = useDocumentChatStore();

//   const handleSend = async () => {
//     const message = text.trim();
//     if (!message) return;

//     setText(""); // clear input immediately
//     addMessage({ sender: "user", text: message }); // store user message

//     const sessionId = localStorage.getItem("sessionId");
//     if (!sessionId) return;

//     try {
//       setLoading(true);
//       const response = await chatWithDocument(sessionId, message);
//       console.log("Bot response:", response.reply);

//       addMessage({ sender: "bot", text: response.reply }); // store bot message
//     } catch (err) {
//       console.error("Error fetching bot response:", err);
//       addMessage({
//         sender: "bot",
//         text: "⚠️ Sorry, something went wrong while fetching the response.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="relative flex justify-end w-full mx-auto lg:mx-0">
//       <input
//         type="text"
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
//         placeholder="What do you want to learn today..."
//         disabled={loading}
//         className="bg-white h-[46px] w-full rounded-full pl-3 pr-12 text-md border border-[#B9CDDD] text-[#62a2df] placeholder-[#B8CCDD] focus:outline-none disabled:opacity-70"
//       />
//       <ArrowUpRight
//         onClick={!loading ? handleSend : undefined}
//         className={`absolute right-1 top-1/2 -translate-y-1/2 text-[#5C84A0] rounded-full bg-[#B9CDDD] h-9 w-9 p-1 cursor-pointer transition-colors ${
//           loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#A8BECF]"
//         }`}
//         size={20}
//       />
//     </div>
//   );
// };

// export default ChatInput;



"use client";
import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => Promise<void> | void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const message = text.trim();
    if (!message) return;

    setText(""); // clear input immediately

    try {
      setLoading(true);
      await onSend(message); // delegate to parent handler
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex justify-end w-full mx-auto lg:mx-0">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
        placeholder="What do you want to learn today..."
        disabled={loading}
        className="bg-white h-[46px] w-full rounded-full pl-3 pr-12 text-md border border-[#B9CDDD] text-[#62a2df] placeholder-[#B8CCDD] focus:outline-none disabled:opacity-70"
      />
      <ArrowUpRight
        onClick={!loading ? handleSend : undefined}
        className={`absolute right-1 top-1/2 -translate-y-1/2 text-[#5C84A0] rounded-full bg-[#B9CDDD] h-9 w-9 p-1 cursor-pointer transition-colors ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#A8BECF]"
        }`}
        size={20}
      />
    </div>
  );
};

export default ChatInput;
