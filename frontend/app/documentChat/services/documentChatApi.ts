import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api/document_chat";

export async function createSession() {
  try {
    console.log("API: Creating session at", `${API_BASE}/session/new`);
    const res = await axios.post(`${API_BASE}/session/new`);
    console.log("API: Session creation response", res.data);
    localStorage.setItem("session_id", res.data.session_id);
    return res.data;
  } catch (error) {
    console.error("API: Session creation failed", error);
    throw error;
  }
}

export async function uploadDocument(sessionId: string, file: File) {
  try {
    console.log("API: Uploading document", file.name, "for session", sessionId);
    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("file", file);

    const res = await axios.post(`${API_BASE}/document/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("API: Upload response", res.data);
    return res.data;
  } catch (error) {
    console.error("API: Upload failed", error);
    throw error;
  }
}

export async function chatWithDocument(sessionId: string, prompt: string) {
  if (!sessionId) throw new Error("No session ID provided");

  try {
    console.log("[Chat API] Sending POST to /chat:", { sessionId, prompt });
    const res = await axios.post(`${API_BASE}/chat`, { session_id: sessionId, prompt });
    console.log("[Chat API] Response:", res.data);
    return res.data;
  } catch (err: unknown) {
    // Type guard for AxiosError
    if (axios.isAxiosError(err)) {
      console.error("[Chat API] Axios error:", err.response?.data || err.message);
    } else if (err instanceof Error) {
      console.error("[Chat API] Error:", err.message);
    } else {
      console.error("[Chat API] Unknown error:", err);
    }
    throw err;
  }
}