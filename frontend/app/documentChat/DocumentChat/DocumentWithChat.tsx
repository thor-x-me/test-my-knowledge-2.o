"use client";
import React, { useEffect, useState } from "react";
import { useDocumentChatStore } from "@/app/documentChat/store/documentChatStore";
import {
  createSession,
  uploadDocument,
} from "../services/documentChatApi";
import DocumentUploader from "./DocumentUploader";
// import DocumentToolbar from "./DocumentToolbar";
import ChatWindow from "./ChatWindow";
import dynamic from "next/dynamic";

const DocumentViewer = dynamic(
  () => import("@/app/documentChat/DocumentChat/DocumentViewer"),
  { ssr: false }
);

const DocumentWithChat: React.FC = () => {
  const {
    sessionId,
    setSessionId,
    filename,
    setDocument,
  } = useDocumentChatStore();

  const [error, setError] = useState<string | null>(null);


  console.log("Document Chat is Mounted. Current sessionId:", sessionId);

  // Initialize session once
  useEffect(() => {
    const initSession = async () => {
      try {
        const savedSessionId = localStorage.getItem("session_id");
        if (savedSessionId) {
          setSessionId(savedSessionId);
          console.log("Reusing saved session ID:", savedSessionId);
          return;
        }

        console.log("Creating new session...");
        const res = await createSession();
        if (res.success) {
          setSessionId(res.session_id);
          localStorage.setItem("session_id", res.session_id);
          console.log("Session ID set:", res.session_id);
        } else {
          console.error("Session creation failed:", res);
          setError("Failed to create session. Please reload.");
        }
      } catch (err) {
        console.error("Session init failed:", err);
        setError("Backend not reachable. Check if server is running on localhost:8000");
      }
    };

    initSession();
  }, [setSessionId]);

  // Handle document upload
  const handleUpload = async (file: File) => {
    if (!sessionId) {
      setError("No session ID available. Cannot upload document.");
      return;
    }

    try {
      setError(null);

      console.log(sessionId)
      console.log(file)

      const res = await uploadDocument(sessionId, file);

      if (res.success) {
        const localBlobUrl = URL.createObjectURL(file);
        const shownName = res.filename || file.name;
        setDocument(shownName, localBlobUrl, res.saved_path, file.type);
      } else {
        console.error("Upload failed:", res);
        setError("Document upload failed. Try again.");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed due to network or server error.");
    } finally {
      // Loading state removed
    }
  };

  return (
    <div className="flex w-full h-[100vh] p-4 gap-4 bg-gray-50">
      {/* Left side: Document section */}
      <div className="flex flex-col w-1/2 border rounded-2xl shadow-md bg-white overflow-auto">
        {/* <DocumentToolbar /> */}
        <div className="flex-1 flex items-center justify-center overflow-auto">
          {filename ? (
            <DocumentViewer />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <DocumentUploader onUpload={handleUpload} />
              {error && (
                <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Chat section */}
      <div className="flex flex-col w-1/2 border-3 rounded-2xl shadow-md bg-white border-black max-h-screen">
        {/* <div className="px-4 py-3 "> */}
          {/* <h3 className="text-lg font-semibold text-gray-700">Chat with Document</h3> */}
        {/* </div> */}
        {/* ChatWindow now handles both display and input with API integration */}
        <ChatWindow />
      </div>
    </div>
  );
};

export default DocumentWithChat;