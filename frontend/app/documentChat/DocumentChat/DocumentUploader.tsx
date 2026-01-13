
// "use client";

// import React, { useState } from "react";
// import { useDocumentChatStore } from "@/app/documentChat/store/documentChatStore";

// const ACCEPTED_TYPES = [
//   "application/pdf",
//   "image/png",
//   "image/jpeg",
//   "image/jpg",
//   "image/gif",
//   "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
// ];

// const DocumentUploader: React.FC = ({}) => {
//   const [file, setFile] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const setDocument = useDocumentChatStore((s) => s.setDocument);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const selectedFile = e.target.files[0];
//       setFile(selectedFile);
//       const url = URL.createObjectURL(selectedFile);
//       setDocument(selectedFile.name, url, undefined, selectedFile.type);

//       // Generate preview for supported types
//       if (selectedFile.type.startsWith("image/")) {
//         setPreviewUrl(url);
//       } else if (selectedFile.type === "application/pdf") {
//         setPreviewUrl(url);
//       } else if (
//         selectedFile.type === "application/msword" ||
//         selectedFile.type ===
//           "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//       ) {
//         setPreviewUrl(null); // No browser preview for Word docs
//       } else {
//         setPreviewUrl(null);
//       }
//     }
//   };

//   return (
//     <div className="w-full h-64  border-gray-400 rounded-lg flex flex-col items-center justify-center relative">
//       <svg
//         width="100"
//         height="100"
//         viewBox="0 0 100 100"
//         fill="none"
//         xmlns="http://www.w3.org/2000/svg"
//       >
//         <path
//           d="M46.249 0.661133C62.0267 -0.655103 77.8249 6.16624 87.5645 17.7676C90.2373 20.9513 91.5585 22.9661 93.7979 26.8838C96.6313 31.8408 98.7926 39.3235 99.335 45.9648C100.21 56.6832 97.5668 67.191 92.2148 75.8535C91.5928 76.8603 91.0095 77.7555 90.3789 78.6475L89.7285 79.543C87.1746 82.9755 84.0063 86.2744 80.5957 88.9189C73.0372 94.7798 64.2786 98.4974 53.9756 99.3438C46.5136 99.9566 38.5376 98.726 32.373 96.2783C25.5146 93.5552 22.3795 91.2862 17.0488 86.8828C15.782 85.8363 15.0123 85.1136 13.916 83.8828C12.9459 82.7938 11.9869 81.7457 11.0576 80.5508C0.411189 66.8601 -2.47837 48.8157 3.74121 32.3682C4.57043 30.1754 6.05988 27.15 7.77246 24.2617C9.48907 21.3667 11.4031 18.6539 13.0713 17.0586C16.3733 13.9008 15.8992 13.9099 19.4697 11.0537C26.9243 5.09061 36.072 1.51025 46.249 0.661133ZM53.1895 21.5723C45.7035 20.663 39.3484 23.0132 34.6816 26.4961C32.2648 28.2998 30.6727 29.9519 28.8955 32.6113C27.6164 34.5252 25.9476 37.5892 25.3857 40.3936C11.6223 42.48 6.51625 61.4539 19.5488 69.9062C24.0105 72.7999 28.174 72.3818 33.8154 72.3818C36.2466 72.3818 38.1246 72.4356 39.5225 72.3975C40.9065 72.3597 41.9623 72.2334 42.7129 71.7939C43.5215 71.3205 43.8891 70.5448 44.0645 69.4854C44.2362 68.4477 44.2412 67.0279 44.2412 65.1455C44.2412 64.5868 44.2797 63.9275 44.3096 63.2061C44.339 62.4949 44.3597 61.7353 44.3203 61.0176C44.2812 60.3046 44.1817 59.5986 43.9521 59.0049C43.7204 58.4056 43.337 57.8755 42.7109 57.6055C42.1739 57.374 41.5018 57.295 40.8242 57.2734C40.1389 57.2517 39.3858 57.2874 38.6699 57.3174C37.9428 57.3478 37.2532 57.3731 36.6533 57.3359C36.0412 57.2981 35.5973 57.1988 35.3223 57.0342C34.989 56.8346 34.8701 56.531 34.9043 56.1318C34.9405 55.7097 35.1542 55.2259 35.4512 54.833L47.9951 38.8682C48.7725 38.1034 49.4559 37.8963 50.0684 37.9648C50.718 38.0376 51.3991 38.4316 52.123 39.0938C52.8415 39.751 53.5499 40.6227 54.2598 41.5605C54.9574 42.4822 55.6702 43.4869 56.3545 44.3369C58.7436 47.3047 61.1565 50.4099 63.498 53.4678C63.6349 53.6465 63.8016 53.8448 63.9639 54.04C64.1297 54.2396 64.2973 54.4443 64.4531 54.6543C64.7736 55.0861 65.0012 55.4864 65.0664 55.8379C65.1495 56.2866 65.0967 56.5551 65.0098 56.7197C64.9255 56.8792 64.7717 57.0126 64.502 57.1162C63.9218 57.3389 63.0184 57.3474 61.9141 57.3047C60.862 57.2639 59.656 57.179 58.6357 57.2949C57.6264 57.4097 56.6024 57.7409 56.1182 58.7021C56.0137 58.9095 55.9435 59.172 55.8926 59.4434C55.8403 59.722 55.802 60.0444 55.7734 60.3916C55.7164 61.0867 55.6966 61.9122 55.6953 62.7432C55.694 63.5758 55.7116 64.4243 55.7285 65.166C55.7455 65.9124 55.7616 66.5426 55.7607 66.9551C55.7577 68.3882 55.8055 69.7118 56.3105 70.6885C56.574 71.1978 56.9597 71.6129 57.5059 71.9043C58.0433 72.191 58.7106 72.3449 59.5215 72.3818H59.5459L76.0527 72.3301H76.0732L76.0928 72.3281C81.1779 71.9037 84.6931 68.8535 86.3809 65.6143C90.8586 57.0207 85.4977 47.0423 75.4863 46.3926C75.2098 41.1104 74.1632 37.3713 71.4648 33.0732H71.4639C71.1799 32.6209 70.8375 32.1364 70.5029 31.6963L70.1729 31.2734C69.2467 30.1156 68.7506 29.4996 68.1846 28.9277C67.6199 28.3572 66.9891 27.8338 65.8066 26.8506C62.6616 24.2355 58.0013 22.2477 53.6133 21.6279L53.1895 21.5723Z"
//           fill="url(#paint0_linear_386_262)"
//           stroke="#B9CDDD"
//         />
//         <defs>
//           <linearGradient
//             id="paint0_linear_386_262"
//             x1="0"
//             y1="100"
//             x2="115.782"
//             y2="75.9372"
//             gradientUnits="userSpaceOnUse"
//           >
//             <stop stop-color="white" />
//             <stop offset="1" stop-color="#B8CCDB" />
//           </linearGradient>
//         </defs>
//       </svg>

//       <input
//         type="file"
//         accept={ACCEPTED_TYPES.join(",")}
//         onChange={handleChange}
//         className="absolute inset-0 opacity-0 cursor-pointer"
//       />
//       {!file && (
//         <p className="text-gray-500">
//           Click or drag a PDF, image, or Word file to upload
//         </p>
//       )}

//       {previewUrl && (
//         <div className="w-full h-full overflow-hidden flex items-center justify-center">
//           {file?.type.startsWith("image/") ? (
//             <img
//               src={previewUrl}
//               alt="Preview"
//               className="object-contain w-full h-full"
//             />
//           ) : file?.type === "application/pdf" ? (
//             <iframe
//               src={previewUrl}
//               className="w-full h-full"
//               title="PDF Preview"
//             />
//           ) : null}
//         </div>
//       )}
//       {file &&
//         (file.type === "application/msword" ||
//           file.type ===
//             "application/vnd.openxmlformats-officedocument.wordprocessingml.document") && (
//           <div className="w-full h-full flex items-center justify-center">
//             <p className="text-gray-600">
//               Word document uploaded. Preview not available, but you can view it
//               in the Document Viewer.
//             </p>
//           </div>
//         )}
//     </div>
//   );
// };

// export default DocumentUploader;


"use client";

import React, { useState } from "react";
import Image from "next/image";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

interface DocumentUploaderProps {
  onUpload: (file: File) => Promise<void> | void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(
        selectedFile.type.startsWith("image/") || selectedFile.type === "application/pdf"
          ? url
          : null
      );

      // delegate actual upload to parent
      onUpload(selectedFile);
    }
  };

  return (
    <div className="w-full h-64 border-gray-400 rounded-lg flex flex-col items-center justify-center relative">
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M46.249 0.661133C62.0267 -0.655103 77.8249 6.16624 87.5645 17.7676C90.2373 20.9513 91.5585 22.9661 93.7979 26.8838C96.6313 31.8408 98.7926 39.3235 99.335 45.9648C100.21 56.6832 97.5668 67.191 92.2148 75.8535C91.5928 76.8603 91.0095 77.7555 90.3789 78.6475L89.7285 79.543C87.1746 82.9755 84.0063 86.2744 80.5957 88.9189C73.0372 94.7798 64.2786 98.4974 53.9756 99.3438C46.5136 99.9566 38.5376 98.726 32.373 96.2783C25.5146 93.5552 22.3795 91.2862 17.0488 86.8828C15.782 85.8363 15.0123 85.1136 13.916 83.8828C12.9459 82.7938 11.9869 81.7457 11.0576 80.5508C0.411189 66.8601 -2.47837 48.8157 3.74121 32.3682C4.57043 30.1754 6.05988 27.15 7.77246 24.2617C9.48907 21.3667 11.4031 18.6539 13.0713 17.0586C16.3733 13.9008 15.8992 13.9099 19.4697 11.0537C26.9243 5.09061 36.072 1.51025 46.249 0.661133ZM53.1895 21.5723C45.7035 20.663 39.3484 23.0132 34.6816 26.4961C32.2648 28.2998 30.6727 29.9519 28.8955 32.6113C27.6164 34.5252 25.9476 37.5892 25.3857 40.3936C11.6223 42.48 6.51625 61.4539 19.5488 69.9062C24.0105 72.7999 28.174 72.3818 33.8154 72.3818C36.2466 72.3818 38.1246 72.4356 39.5225 72.3975C40.9065 72.3597 41.9623 72.2334 42.7129 71.7939C43.5215 71.3205 43.8891 70.5448 44.0645 69.4854C44.2362 68.4477 44.2412 67.0279 44.2412 65.1455C44.2412 64.5868 44.2797 63.9275 44.3096 63.2061C44.339 62.4949 44.3597 61.7353 44.3203 61.0176C44.2812 60.3046 44.1817 59.5986 43.9521 59.0049C43.7204 58.4056 43.337 57.8755 42.7109 57.6055C42.1739 57.374 41.5018 57.295 40.8242 57.2734C40.1389 57.2517 39.3858 57.2874 38.6699 57.3174C37.9428 57.3478 37.2532 57.3731 36.6533 57.3359C36.0412 57.2981 35.5973 57.1988 35.3223 57.0342C34.989 56.8346 34.8701 56.531 34.9043 56.1318C34.9405 55.7097 35.1542 55.2259 35.4512 54.833L47.9951 38.8682C48.7725 38.1034 49.4559 37.8963 50.0684 37.9648C50.718 38.0376 51.3991 38.4316 52.123 39.0938C52.8415 39.751 53.5499 40.6227 54.2598 41.5605C54.9574 42.4822 55.6702 43.4869 56.3545 44.3369C58.7436 47.3047 61.1565 50.4099 63.498 53.4678C63.6349 53.6465 63.8016 53.8448 63.9639 54.04C64.1297 54.2396 64.2973 54.4443 64.4531 54.6543C64.7736 55.0861 65.0012 55.4864 65.0664 55.8379C65.1495 56.2866 65.0967 56.5551 65.0098 56.7197C64.9255 56.8792 64.7717 57.0126 64.502 57.1162C63.9218 57.3389 63.0184 57.3474 61.9141 57.3047C60.862 57.2639 59.656 57.179 58.6357 57.2949C57.6264 57.4097 56.6024 57.7409 56.1182 58.7021C56.0137 58.9095 55.9435 59.172 55.8926 59.4434C55.8403 59.722 55.802 60.0444 55.7734 60.3916C55.7164 61.0867 55.6966 61.9122 55.6953 62.7432C55.694 63.5758 55.7116 64.4243 55.7285 65.166C55.7455 65.9124 55.7616 66.5426 55.7607 66.9551C55.7577 68.3882 55.8055 69.7118 56.3105 70.6885C56.574 71.1978 56.9597 71.6129 57.5059 71.9043C58.0433 72.191 58.7106 72.3449 59.5215 72.3818H59.5459L76.0527 72.3301H76.0732L76.0928 72.3281C81.1779 71.9037 84.6931 68.8535 86.3809 65.6143C90.8586 57.0207 85.4977 47.0423 75.4863 46.3926C75.2098 41.1104 74.1632 37.3713 71.4648 33.0732H71.4639C71.1799 32.6209 70.8375 32.1364 70.5029 31.6963L70.1729 31.2734C69.2467 30.1156 68.7506 29.4996 68.1846 28.9277C67.6199 28.3572 66.9891 27.8338 65.8066 26.8506C62.6616 24.2355 58.0013 22.2477 53.6133 21.6279L53.1895 21.5723Z"
          fill="url(#paint0_linear_386_262)"
          stroke="#B9CDDD"
        />
        <defs>
          <linearGradient
            id="paint0_linear_386_262"
            x1="0"
            y1="100"
            x2="115.782"
            y2="75.9372"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="1" stopColor="#B8CCDB" />
          </linearGradient>
        </defs>
      </svg>

      <input
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      {!file && (
        <p className="text-gray-500">
          Click or drag a PDF, image, or Word file to upload
        </p>
      )}

      {previewUrl && (
        <div className="w-full h-full overflow-hidden flex items-center justify-center">
          {file?.type.startsWith("image/") ? (
            <Image
              src={previewUrl}
              alt="Preview"
              className="object-contain w-full h-full"
              width={500}
              height={500}
            />
          ) : file?.type === "application/pdf" ? (
            <iframe
              src={previewUrl}
              className="w-full h-full"
              title="PDF Preview"
            />
          ) : null}
        </div>
      )}
      {file &&
        (file.type === "application/msword" ||
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document") && (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-600">
              Word document uploaded. Preview not available, but you can view it
              in the Document Viewer.
            </p>
          </div>
        )}
    </div>
  );
};

export default DocumentUploader;
