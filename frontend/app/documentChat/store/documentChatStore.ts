import { create } from "zustand";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

interface DocumentChatState {
  sessionId: string | null;
  filename: string | null;
  filePath: string | null;   // server-side path returned by backend
  blobUrl: string | null;    // local preview URL
  fileType: string | null;   // MIME type of uploaded file

  currentPage: number;
  totalPages: number;
  zoom: number;
  rotation: number;
  chatHistory: ChatMessage[];

  // Actions
  setSessionId: (id: string) => void;
  setDocument: (filename: string, blobUrl: string, filePath?: string, fileType?: string) => void;
  setFileType: (fileType: string) => void;
  setPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setZoom: (zoom: number) => void;
  setRotation: (rotation: number) => void;
  addMessage: (msg: ChatMessage) => void;
  resetChat: () => void;
}

export const useDocumentChatStore = create<DocumentChatState>((set) => ({
  sessionId: null,
  filename: null,
  filePath: null,
  blobUrl: null,
  fileType: null,

  currentPage: 1,
  totalPages: 1,
  zoom: 1,
  rotation: 0,
  chatHistory: [],

  setSessionId: (id) => set({ sessionId: id }),

  // Allow setting both local blobUrl (for preview) and backend filePath (for RAG)
  setDocument: (filename, blobUrl, filePath, fileType) => {
    console.log("setDocument called with:", { filename, blobUrl, filePath, fileType });
    set({ 
      filename, 
      blobUrl, 
      filePath: filePath || null,
      fileType: fileType || null 
    });
    console.log("Document state updated successfully");
  },

  setFileType: (fileType) => set({ fileType }),
  setPage: (page) => set({ currentPage: page }),
  setTotalPages: (pages) => {
    console.log("setTotalPages called with:", pages);
    set({ totalPages: pages });
  },
  setZoom: (zoom) => set({ zoom }),
  setRotation: (rotation) => set({ rotation }),  

  addMessage: (msg) =>
    set((state) => ({ chatHistory: [...state.chatHistory, msg] })),

  resetChat: () =>
    set({
      sessionId: null,
      filename: null,
      filePath: null,
      blobUrl: null,
      fileType: null,
      chatHistory: [],
      currentPage: 1,
      totalPages: 1,
      zoom: 1,
      rotation: 0,
    }),
}));
