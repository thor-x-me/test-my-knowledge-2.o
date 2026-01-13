"use client";

import React from "react";
import { useDocumentChatStore } from "@/app/documentChat/store/documentChatStore";
import {  Poppins } from "next/font/google";

const poppins = Poppins({ weight: "400", subsets: ["latin"] });
const DocumentToolbar: React.FC = () => {
  // ✅ Select slices instead of the whole store
  const filename = useDocumentChatStore((s) => s.filename);
  const currentPage = useDocumentChatStore((s) => s.currentPage);
  const totalPages = useDocumentChatStore((s) => s.totalPages);
  const zoom = useDocumentChatStore((s) => s.zoom);
  const rotation = useDocumentChatStore((s) => s.rotation);

  const setPage = useDocumentChatStore((s) => s.setPage);
  const setZoom = useDocumentChatStore((s) => s.setZoom);
  const setRotation = useDocumentChatStore((s) => s.setRotation);

  // Debug logs to confirm re-renders
  console.log("Toolbar render:", { filename, currentPage, totalPages, zoom, rotation });

  const handlePrev = () => {
    if (currentPage > 1) setPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setPage(currentPage + 1);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(3, zoom + 0.1);
    setZoom(Math.round(newZoom * 10) / 10); // Round to 1 decimal place
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.5, zoom - 0.1);
    setZoom(Math.round(newZoom * 10) / 10); // Round to 1 decimal place
  };

  const handleRotateLeft = () => {
    setRotation((rotation - 90 + 360) % 360);
  };

  const handleRotateRight = () => {
    setRotation((rotation + 90) % 360);
  };

  return (
    <div
      className="flex items-center justify-end px-8 py-3 mt-2 mb-3 text-sm relative 
      bg-white border-[#B9CDDD] rounded-[14px] box-border border-2"
    >
      {/* File name */}
      <div className="w-1/3 mx-0 absolute left-4 flex items-center gap-6">
        <svg
          width="30"
          height="19"
          viewBox="0 0 30 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="1.5"
            y1="1.5"
            x2="28.5"
            y2="1.5"
            stroke="#B8CCDB"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="1.5"
            y1="9.5"
            x2="28.5"
            y2="9.5"
            stroke="#B8CCDB"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="1.5"
            y1="17.5"
            x2="28.5"
            y2="17.5"
            stroke="#B8CCDB"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        <span
          className={`truncate w-full font-medium mx-0 ${poppins.className} text-sm text-[#646464]`}
        >
          {filename || "No file"}
        </span>
      </div>

      {/* Pagination and Navigation */}
      <div className="flex items-center gap-6 justify-center">
        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentPage <= 1}
            className={`px-3 py-1 text-[#646464] text-lg rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Previous Page"
          >
            ←
          </button>
          
          <span
            className={`${poppins.className} text-lg text-[#646464] pr-2 border-[#7B9EB9] min-w-[60px] text-center`}
          >
            <span className="border px-[0.7px] text-center bg-[#B9CDDD]">
              {currentPage}
            </span>{" "}
            / {totalPages}
          </span>
          
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className={`px-3 py-1 text-[#646464] text-lg rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Next Page"
          >
            →
          </button>
        </div>

        <div className="w-px h-6 bg-[#7B9EB9] mx-1"></div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 pr-2">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className={`px-2 py-1 text-[#646464] text-lg rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Zoom Out"
          >
            -
          </button>

          <span
            className={`w-12 text-center ${poppins.className} text-[#646464] border px-[6px] text-center bg-[#B9CDDD]`}
          >
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className={`px-2 py-1 text-[#646464] text-lg rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Zoom In"
          >
            +
          </button>

          <div className="w-px h-6 bg-[#7B9EB9] mx-1"></div>
        </div>

        {/* Rotation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRotateLeft}
            className="px-2 py-1 flex items-center rounded hover:bg-gray-100"
            title="Rotate Left"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                stroke="#B8CCDB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 3v5h5"
                stroke="#B8CCDB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          
          <button
            onClick={handleRotateRight}
            className="px-2 py-1 flex items-center rounded hover:bg-gray-100"
            title="Rotate Right"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"
                stroke="#B8CCDB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 3v5h-5"
                stroke="#B8CCDB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentToolbar;
