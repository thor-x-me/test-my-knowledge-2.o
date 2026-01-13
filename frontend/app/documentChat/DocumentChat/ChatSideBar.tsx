"use client";
import React from "react";
import { useDocumentChatStore } from "@/app/documentChat/store/documentChatStore";
import DocumentUploader from "./DocumentUploader";
import dynamic from "next/dynamic";

// Dynamically import DocumentViewer with no SSR
const DocumentViewer = dynamic(
  () => import("@/app/documentChat/DocumentChat/DocumentViewer"),
  { ssr: false }
);


const ChatSidebar: React.FC = () => {
  // Use selector for only filename to avoid unnecessary rerenders
  const filename = useDocumentChatStore((s) => s.filename);
  const setDocument = useDocumentChatStore((s) => s.setDocument);

  // Pass setDocument to DocumentUploader so it updates the store
  const handleUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setDocument(file.name, url, undefined, file.type);
  };

  return (
    <div className="flex flex-col h-full border-r border-gray-200 bg-white">
      {!filename ? (
        <div className="flex-1 flex items-center justify-center">
          <DocumentUploader onUpload={handleUpload} />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <DocumentViewer />
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;
