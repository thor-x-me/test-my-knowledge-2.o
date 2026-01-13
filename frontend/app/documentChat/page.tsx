"use client";
// import ChatWindow from "./DocumentChat/ChatWindow";
import Header from "../components/Header";
import DocumentToolbar from "./DocumentChat/DocumentToolbar";
import DocumentWithChat from "./DocumentChat/DocumentWithChat";

export default function ChatDocument() {
  return (
    <div className="lg:mx-20 flex flex-col min-h-full mb-10">
      {/* Top Header */}
      <Header />

      {/* Main Chat Layout */}
      <div className="flex flex-col lg:w-[1160px] mx-auto mt-8 rounded-2xl shadow-lg overflow-hidden min-h-0 pb-7 bg-gradient-to-tr from-white to-[#B8CCDB]">
        {/* Toolbar */}
        <div className="lg:w-[1160px] p-4 max-h-full overflow-y-auto border-r border-gray-200">
          <DocumentToolbar />
        </div>

        <div className="flex min-h-screen flex-1 overflow-hidden gap-4 px-4">

          {/* Chat Window */}
          <div className="flex-1 bg-gray-50 min-h-0 flex flex-col border-[#B9CDDD] border rounded-2xl">
            <DocumentWithChat/>
          </div>
        </div>
      </div>
    </div>
  );
}
