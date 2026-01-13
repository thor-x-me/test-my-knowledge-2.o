// // "use client";
// // import React, { useEffect, useState } from "react";
// // import { useDocumentChatStore } from "@/app/documentChat/store/documentChatStore";
// // import {
// //   createSession,
// //   uploadDocument,
// //   chatWithDocument,
// // } from "../services/documentChatApi";
// // import DocumentUploader from "./DocumentUploader";
// // import DocumentToolbar from "./DocumentToolbar";
// // // import DocumentViewer from "./DocumentViewer";
// // import ChatWindow from "./ChatWindow";
// // import ChatInput from "./ChatInput";
// // import dynamic from "next/dynamic";


// // const DocumentViewer = dynamic(
// //   () => import("@/app/documentChat/DocumentChat/DocumentViewer"),
// //   { ssr: false }
// // );



// // const DocumentChat: React.FC = () => {
// //   const {
// //     sessionId,
// //     // setSessionId,
// //     filename,
// //     setDocument,
// //     addMessage,
// //   } = useDocumentChatStore();

// //   const messages = useDocumentChatStore((s) => s.chatHistory);

// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState<string | null>(null);

// //   // 🔹 Initialize session
// //   // useEffect(() => {
// //   //   const initSession = async () => {
// //   //     try {
// //   //       let savedSessionId = localStorage.getItem("session_id");
// //   //       if (savedSessionId) {
// //   //         setSessionId(savedSessionId);
// //   //         console.log("Reusing saved session ID:", savedSessionId);
// //   //         return;
// //   //       }

// //   //       console.log("Creating new session...");
// //   //       const res = await createSession();
// //   //       if (res.success) {
// //   //         setSessionId(res.session_id);
// //   //         localStorage.setItem("session_id", res.session_id);
// //   //         console.log("Session ID set:", res.session_id);
// //   //       } else {
// //   //         console.error("Session creation failed:", res);
// //   //         setError("Failed to create session. Please reload.");
// //   //       }
// //   //     } catch (err) {
// //   //       console.error("Session init failed:", err);
// //   //       setError("Backend not reachable. Check if server is running on localhost:8000");
// //   //     }
// //   //   };

// //   //   initSession();
// //   // }, [setSessionId]);

// //   // 🔹 Handle document upload
// //   const handleUpload = async (file: File) => {
// //     if (!sessionId) {
// //       setError("No session ID available. Cannot upload document.");
// //       return;
// //     }

// //     try {
// //       setLoading(true);
// //       setError(null);
// //       const res = await uploadDocument(sessionId, file);

// //       if (res.success) {
// //         const localBlobUrl = URL.createObjectURL(file);
// //         const shownName = res.filename || file.name;
// //         setDocument(shownName, localBlobUrl, res.saved_path, file.type);
// //       } else {
// //         console.error("Upload failed:", res);
// //         setError("Document upload failed. Try again.");
// //       }
// //     } catch (err) {
// //       console.error("Upload failed:", err);
// //       setError("Upload failed due to network or server error.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // 🔹 Handle chat
// //   const handleSendMessage = async (text: string) => {
// //     if (!sessionId || !text.trim()) return;

// //     addMessage({ sender: "user", text });

// //     try {
// //       const res = await chatWithDocument(sessionId, text);
// //       if (res.success) {
// //         addMessage({ sender: "bot", text: res.reply });
// //       } else {
// //         addMessage({ sender: "bot", text: "⚠️ Bot failed to respond." });
// //       }
// //     } catch (err) {
// //       console.error("Chat failed:", err);
// //       addMessage({ sender: "bot", text: "⚠️ Error chatting with document." });
// //     }
// //   };

// //   return (
// //     <div className="flex w-full h-[90vh] p-4 gap-4 bg-gray-50">
// //       {/* Left side: Document section */}
// //       <div className="flex flex-col w-1/2 border rounded-2xl shadow-md bg-white">
// //         <DocumentToolbar />
// //         <div className="flex-1 flex items-center justify-center">
// //           {filename ? (
// //             <DocumentViewer />
// //           ) : (
// //             <div className="flex flex-col items-center gap-4">
// //               <DocumentUploader  />

// //               {error && (
// //                 <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
// //                   ⚠️ {error}
// //                 </div>
// //               )}
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       {/* Right side: Chat section */}
// //       <div className="flex flex-col w-1/2 border rounded-2xl shadow-md bg-white">
// //         <div className="px-4 py-3 border-b">
// //           <h3 className="text-lg font-semibold text-gray-700">Chat with Document</h3>
// //         </div>
// //         <ChatWindow  />
// //         <ChatInput  />
// //       </div>
// //     </div>
// //   );
// // };

// // export default DocumentChat;


// // "use client";

// // import React from "react";
// // import { useDocumentChatStore } from "@/app/documentChat/store/documentChatStore";
// // import ChatMessage from "./ChatMessage";
// // import ChatInput from "./ChatInput";

// // const ChatWindow: React.FC = () => {
// //   const messages = useDocumentChatStore((s) => s.chatHistory);
// //   const addMessage = useDocumentChatStore((s) => s.addMessage);

// //   // Simple handler: just add user message to store (no bot reply logic here)
// //   const handleSend = (text: string) => {
// //     if (text.trim()) {
// //       addMessage({ sender: "user", text });
// //     }
// //   };

// //   return (
// //     <div className="flex flex-col h-full">
// //       <div className="flex-1 overflow-y-auto p-4 space-y-3">
// //         {messages.map((msg, i) => (
// //           <ChatMessage key={i} sender={msg.sender} text={msg.text} />
// //         ))}
// //       </div>
// //       <div className="p-2">
// //         <ChatInput onSend={handleSend} />
// //       </div>
// //     </div>
// //   );
// // };

// // export default ChatWindow;
// "use client";


// import React from "react";
// import { useDocumentChatStore } from "@/app/documentChat/store/documentChatStore";
// import { chatWithDocument } from "../services/documentChatApi";
// import ChatMessage from "./ChatMessage";
// import ChatInput from "./ChatInput";

// const ChatWindow: React.FC = () => {
//   const messages = useDocumentChatStore((s) => s.chatHistory);
//   const addMessage = useDocumentChatStore((s) => s.addMessage);
//   const sessionId = useDocumentChatStore((s) => s.sessionId);

//   // Only allow sending if sessionId is present
//   const handleSend = async (text: string) => {
//     if (!text.trim()) return;
//     if (!sessionId) {
//       addMessage({ sender: "bot", text: "⚠️ No session available. Please wait for session to be created or refresh the page." });
//       return;
//     }
//     addMessage({ sender: "user", text });
//     try {
//       const response = await chatWithDocument(sessionId, text);
//       const botReply = response.reply || response.answer || response.response || response.message || "No response received";
//       addMessage({ sender: "bot", text: botReply });
//     } catch (error: any) {
//       addMessage({ sender: "bot", text: `⚠️ Error: ${error.message}` });
//     }
//   };

//   return (
//     <div className="flex flex-col h-full">
//       <div className="flex-1 overflow-y-auto p-4 space-y-3">
//         {messages.length === 0 ? (
//           <div className="flex items-center justify-center h-full text-gray-500">
//             <p>Start a conversation about your document...</p>
//           </div>
//         ) : (
//           messages.map((msg, i) => (
//             <ChatMessage key={i} sender={msg.sender} text={msg.text} />
//           ))
//         )}
//       </div>
//       <div className="p-2">
//         <ChatInput onSend={handleSend} />
//       </div>
//     </div>
//   );
// };

// export default ChatWindow;









"use client";

import React, { useState } from "react";
import { useDocumentChatStore } from "@/app/documentChat/store/documentChatStore";
import { chatWithDocument } from "../services/documentChatApi";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

const ChatWindow: React.FC = () => {
  const messages = useDocumentChatStore((s) => s.chatHistory);
  const addMessage = useDocumentChatStore((s) => s.addMessage);
  const sessionId = useDocumentChatStore((s) => s.sessionId);

  const [botTyping, setBotTyping] = useState(false);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    if (!sessionId) {
      addMessage({
        sender: "bot",
        text: "⚠️ No session available. Please wait for session to be created or refresh the page.",
      });
      return;
    }

    addMessage({ sender: "user", text });

    try {
      setBotTyping(true);

      const response = await chatWithDocument(sessionId, text);
      const botReply =
        response.reply ||
        response.answer ||
        response.response ||
        response.message ||
        "No response received";

      setBotTyping(false);
      addMessage({ sender: "bot", text: botReply });
    } catch (error: unknown) {
      setBotTyping(false);
      addMessage({ sender: "bot", text: `⚠️ Error: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !botTyping ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Start a conversation about your document...</p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <ChatMessage key={i} sender={msg.sender} text={msg.text} />
            ))}

            {/* Bot typing bubble */}
            {botTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-2xl rounded-bl-sm inline-flex items-center space-x-1 shadow-sm">
                  <span className="dot bg-gray-500"></span>
                  <span className="dot bg-gray-500 animation-delay-200"></span>
                  <span className="dot bg-gray-500 animation-delay-400"></span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input field */}
      <div className="p-2 border-t">
        <ChatInput onSend={handleSend} />
      </div>

      {/* Dot styles */}
      <style jsx>{`
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          display: inline-block;
          animation: bounce 1.2s infinite;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;
