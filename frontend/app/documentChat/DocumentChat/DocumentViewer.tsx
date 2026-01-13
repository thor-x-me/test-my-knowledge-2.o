// "use client";

// import React, { useEffect, useState, useRef } from "react";
// import { Document, Page, pdfjs } from "react-pdf";
// import { useDocumentChatStore } from "@/app/documentChat/store/documentChatStore";
// import "react-pdf/dist/Page/TextLayer.css";
// import "react-pdf/dist/Page/AnnotationLayer.css";

// const DocumentViewer: React.FC = () => {
//   const filePath = useDocumentChatStore((s) => s.filePath);
//   const blobUrl = useDocumentChatStore((s) => s.blobUrl);
//   const setTotalPages = useDocumentChatStore((s) => s.setTotalPages);
//   const zoom = useDocumentChatStore((s) => s.zoom);
//   const rotation = useDocumentChatStore((s) => s.rotation);
//   const fileType = useDocumentChatStore((s) => s.fileType);
//   const currentPage = useDocumentChatStore((s) => s.currentPage);

//   const [numPages, setNumPages] = useState<number>(0);

//   const documentSrc = blobUrl || filePath;

//   // Ensure PDF.js worker is configured (browser only)
//   useEffect(() => {
//     if (
//       typeof window !== "undefined" &&
//       pdfjs &&
//       pdfjs.GlobalWorkerOptions &&
//       !pdfjs.GlobalWorkerOptions.workerSrc
//     ) {
//       pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
//     }
//   }, []);

//   if (!documentSrc) {
//     return (
//       <div className="flex-1 flex items-center justify-center text-gray-400">
//         <p>No document loaded</p>
//       </div>
//     );
//   }

//   // File type checks
//   const isPDF =
//     fileType === "application/pdf" ||
//     (documentSrc && documentSrc.toLowerCase().includes(".pdf"));
//   const isImage = fileType && fileType.startsWith("image/");
//   const isWord =
//     fileType === "application/msword" ||
//     fileType ===
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

//   if (isPDF) {
//     // Only render PDF viewer on client
//     if (typeof window === "undefined") {
//       return null;
//     }
//     // Fully interactive PDF viewer: scroll, zoom, rotate, text selection, toolbar sync
//     const containerRef = useRef<HTMLDivElement>(null);
//     const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
//     const setPage = useDocumentChatStore((s) => s.setPage);

//     // Scroll to current page when it changes (toolbar navigation)
//     useEffect(() => {
//       if (pageRefs.current[currentPage - 1]) {
//         pageRefs.current[currentPage - 1]?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       }
//     }, [currentPage, zoom, rotation]);

//     // On scroll, update current page in store so toolbar reflects visible page
//     useEffect(() => {
//       if (!containerRef.current) return;
//       const onScroll = () => {
//         if (!containerRef.current) return;
//         const containerTop = containerRef.current.getBoundingClientRect().top;
//         let closest = 1,
//           minDist = Infinity;
//         pageRefs.current.forEach((el, idx) => {
//           if (el) {
//             const dist = Math.abs(
//               el.getBoundingClientRect().top - containerTop
//             );
//             if (dist < minDist) {
//               minDist = dist;
//               closest = idx + 1;
//             }
//           }
//         });
//         // console.log("[PDF Scroll] Closest page:", closest);
//         setPage(closest);
//       };
//       const container = containerRef.current;
//       container.addEventListener("scroll", onScroll);
//       return () => {
//         container.removeEventListener("scroll", onScroll);
//       };
//     }, [setPage]);

//     return (
//       <div className="flex-1 flex flex-col bg-gray-100">
//         <div
//           ref={containerRef}
//           className="flex-1 overflow-y-auto"
//           style={{
//             scrollSnapType: "y mandatory",
//             width: "100%",
//             height: "100%",
//             maxHeight: "90vh",
//             WebkitOverflowScrolling: "touch",
//             scrollBehavior: "smooth",
//             gap: 32,
//             padding: 0,
//           }}
//         >
//           <Document
//             file={documentSrc}
//             onLoadSuccess={({ numPages }) => {
//               setNumPages(numPages);
//               setTotalPages(numPages);
//               // console.log("[PDF Load] numPages:", numPages);
//             }}
//             onLoadError={(err) => console.error("PDF load error:", err)}
//             loading={
//               <p className="text-center text-gray-600">Loading PDF...</p>
//             }
//           >
//             {numPages > 0 &&
//               Array.from({ length: numPages }, (_, index) => (
//                 <div
//                   key={`page_${index + 1}`}
//                   ref={(el) => {
//                     pageRefs.current[index] = el;
//                   }}
//                   className={`flex justify-center items-center bg-white rounded-lg shadow-md transition-shadow duration-300 overflow-x-auto ${
//                     currentPage === index + 1 ? "ring-2 ring-blue-400" : ""
//                   }`}
//                   style={{
//                     scrollSnapAlign: "start",
//                     width: "100%",
//                     minWidth: 0,
//                     margin: "0 auto",
//                     boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
//                     overflowX: "auto",
//                   }}
//                 >
//                   <div style={{ minWidth: 0, maxWidth: "100%", overflow: "auto" }}>
//                     <Page
//                       pageNumber={index + 1}
//                       scale={zoom}
//                       rotate={rotation}
//                       renderTextLayer={true}
//                       renderAnnotationLayer={true}
//                       loading={<p>Loading page {index + 1}...</p>}
//                     />
//                   </div>
//                 </div>
//               ))}
//           </Document>
//         </div>
//       </div>
//     );
//   }

//   if (isImage) {
//     return (
//       <div className="flex-1 flex items-center justify-center bg-gray-100">
//         <img
//           src={documentSrc}
//           alt="Uploaded"
//           className="max-w-full max-h-full object-contain rounded shadow"
//         />
//       </div>
//     );
//   }

//   if (isWord) {
//     return (
//       <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-100">
//         <p>Word document uploaded. Preview not available in browser.</p>
//         <a
//           href={documentSrc}
//           download
//           className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           Download & Open in Word
//         </a>
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex items-center justify-center text-gray-400">
//       <p>Unsupported file type: {fileType || "Unknown"}</p>
//     </div>
//   );
// };

// export default DocumentViewer;


"use client";

import React, { useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useDocumentChatStore } from "@/app/documentChat/store/documentChatStore";
import Image from "next/image";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

const DocumentViewer: React.FC = () => {
  const filePath = useDocumentChatStore((s) => s.filePath);
  const blobUrl = useDocumentChatStore((s) => s.blobUrl);
  const setTotalPages = useDocumentChatStore((s) => s.setTotalPages);
  const zoom = useDocumentChatStore((s) => s.zoom);
  const rotation = useDocumentChatStore((s) => s.rotation);
  const fileType = useDocumentChatStore((s) => s.fileType);
  const currentPage = useDocumentChatStore((s) => s.currentPage);
  const setPage = useDocumentChatStore((s) => s.setPage);

  const [numPages, setNumPages] = useState<number>(0);

  const documentSrc = blobUrl || filePath;

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Always run this hook (top level)
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      pdfjs &&
      pdfjs.GlobalWorkerOptions &&
      !pdfjs.GlobalWorkerOptions.workerSrc
    ) {
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    }
  }, []);

  // Scroll to current page
  useEffect(() => {
    if (pageRefs.current[currentPage - 1]) {
      pageRefs.current[currentPage - 1]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentPage, zoom, rotation]);

  // Update page on scroll
  useEffect(() => {
    if (!containerRef.current) return;
    const onScroll = () => {
      const containerTop = containerRef.current!.getBoundingClientRect().top;
      let closest = 1,
        minDist = Infinity;
      pageRefs.current.forEach((el, idx) => {
        if (el) {
          const dist = Math.abs(el.getBoundingClientRect().top - containerTop);
          if (dist < minDist) {
            minDist = dist;
            closest = idx + 1;
          }
        }
      });
      setPage(closest);
    };
    const container = containerRef.current;
    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, [setPage]);

  // File type checks
  const isPDF =
    fileType === "application/pdf" ||
    (documentSrc && documentSrc.toLowerCase().includes(".pdf"));
  const isImage = fileType && fileType.startsWith("image/");
  const isWord =
    fileType === "application/msword" ||
    fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  // --- CONDITIONAL RENDERING ONLY AFTER HOOKS ---
  if (!documentSrc) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <p>No document loaded</p>
      </div>
    );
  }

  if (isPDF) {
    if (typeof window === "undefined") return null;
    return (
      <div className="flex-1 flex flex-col bg-gray-100">
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto"
          style={{ scrollSnapType: "y mandatory", maxHeight: "90vh", gap: 32 }}
        >
          <Document
            file={documentSrc}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages);
              setTotalPages(numPages);
            }}
          >
            {Array.from({ length: numPages }, (_, index) => (
              <div
                key={index}
                ref={(el) => {
                  pageRefs.current[index] = el;
                }}
              >
                <Page pageNumber={index + 1} scale={zoom} rotate={rotation} />
              </div>
            ))}
          </Document>
        </div>
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <Image src={documentSrc} alt="Uploaded" width={800} height={600} />
      </div>
    );
  }

  if (isWord) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p>Word document uploaded. Preview not available in browser.</p>
        <a href={documentSrc} download>
          Download & Open in Word
        </a>
      </div>
    );
  }

  return <p>Unsupported file type</p>;
};


export default DocumentViewer;
