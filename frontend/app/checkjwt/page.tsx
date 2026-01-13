"use client"
import { useAuth } from "@clerk/clerk-react";

function MyComponent() {
  const { getToken } = useAuth();

  async function callBackend() {
    const token = await getToken({template : "Postman"});
    console.log("JWT:", token);

    const res = await fetch("http://127.0.0.1:8000/api/video_to_quiz/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ topic: "math", difficulty: "easy" }),
    });

    const data = await res.json();
    console.log("Backend response:", data);
  }

  return <button onClick={callBackend}>Call Backend</button>;
}


export default MyComponent