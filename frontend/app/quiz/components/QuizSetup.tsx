"use client";
import React, { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import { Poppins, Michroma } from "next/font/google";
import { useQuizStore } from "../store/quizStore";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
// import { useQuizStore } from "@/store/quizStore";

const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
});

const michroma = Michroma({
  weight: "400",
  subsets: ["latin"],
});

const quotes = [
  "Patience is the key to success...",
  "Good things take time...",
  "Loading your quiz...",
  "Almost ready, hang tight!",
];

import { useRef } from "react";

const Quiz = () => {
  const { getToken } = useAuth();

  
  // const videoId = useQuizStore((s) => s.videoId);
  // const setVideoId = useQuizStore((s) => s.setVideoId);

  const {
    setOptions,
    fetchVideoDetails,
    startQuizFlow,
    difficulty,
    numQuestions,
    videoDetails, // ✅ keep     // ✅ keep
    loadingMessage,
    phase,
  } = useQuizStore();

  const { videoId } = useQuizStore();  // or however you fetch from store
  const [videoUrl, setVideoUrl] = useState(videoId || "");  
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [difficultyLevel, setDifficultyLevel] = useState("easy");
  // const [videoData, setVideoData] = useState<VideoDetails | null>(null);

  const options: number[] = [5, 10, 15, 20];
  const optionsForDifficulty: string[] = ["easy", "medium", "hard"];

  // Progress bar and quote state
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const quoteRef = useRef<NodeJS.Timeout | null>(null);

  // Progress/quotes only when loading
  useEffect(() => {
    if (phase === "loading") {
      setProgress(0);
      progressRef.current = setInterval(() => {
        setProgress((prev) => (prev < 98 ? prev + 2 : prev));
      }, 200);
      quoteRef.current = setInterval(() => {
        setQuoteIndex((prev) => (prev + 1) % quotes.length);
      }, 2500);
    } else {
      setProgress(0);
      if (progressRef.current) clearInterval(progressRef.current);
      if (quoteRef.current) clearInterval(quoteRef.current);
    }
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
      if (quoteRef.current) clearInterval(quoteRef.current);
    };
  }, [phase]);

  // Triggered on Generate Quiz
  const handleGenerateQuiz = async () => {
    setOptions(videoUrl, difficultyLevel as "easy" | "medium" | "hard", numberOfQuestions);
    await startQuizFlow(getToken, "Postman");
  };

  const handlePasteClick = async () => {
    const pastedUrl = await navigator.clipboard.readText();
    setVideoUrl(pastedUrl);
    await fetchVideoDetails(pastedUrl, getToken, "Postman"); // ✅ no manual setVideoDetails
  };

  return (
    <div className="w-full min-h-screen">
      <Header />

      {/* Heading + Description */}
      <div className="mx-6 lg:mx-24">
        <div className="flex flex-col lg:flex-row justify-between gap-6 mt-10">
          {/* Heading */}
          <h1
            className={`text-3xl sm:text-4xl lg:text-5xl ${michroma.className}`}
          >
            <span className="text-[#5D85A1]">Smart</span> Tools
          </h1>

          {/* Description */}
          <p
            className={`text-sm sm:text-base lg:text-lg text-[#646464] ${poppins.className} w-full lg:w-1/2 text-left lg:text-right`}
          >
            Yuki gives you everything you need to study efficiently from solving
            doubts on any lecture to creating quizzes, crafting personalized
            study plans, and chatting directly with your study materials.
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="mx-6 lg:mx-24 flex flex-col lg:flex-row justify-between mt-10 gap-8 mb-20">
        {/* Left Side - Searchbar + Video */}
        <div className="flex flex-col gap-6 w-full lg:w-[560px]">
          {/* Search bar */}
          <div className="flex w-full">
            <input
              type="text"
              className="flex-1 text-[#333] text-sm sm:text-base pl-4 h-[45px] sm:h-[50px] rounded-l-full border-2 border-[#B8CCDD] focus:outline-none"
              placeholder="Paste YouTube video link here..."
              value={videoUrl} // 👈 controlled
              onChange={(e) => {
                setVideoUrl(e.target.value);
                setOptions(
                  e.target.value,
                  (difficulty as "easy" | "medium" | "hard") ?? (difficultyLevel as "easy" | "medium" | "hard"),
                  numQuestions ?? numberOfQuestions
                );
              }}
            />
            <button
              className="w-[100px] sm:w-[120px] h-[45px] sm:h-[50px] bg-[#B9CDDD] text-white font-medium rounded-r-full hover:bg-[#a4bfcf] transition"
              onClick={handlePasteClick}
            >
              Paste
            </button>
          </div>

          {/* Video card */}
          <div className="w-full h-auto lg:h-[470px] flex flex-col gap-4 rounded-2xl bg-[#B9CDDD] p-4">
            {videoDetails ? (
              <div className="w-full h-auto flex flex-col gap-4 rounded-2xl bg-[#B9CDDD] p-4">
                <Image
                height={100}
                  width={100}
                  src={videoDetails.thumbnail_url}
                  alt={videoDetails.title}
                  className="w-full h-[200px] sm:h-[250px] lg:h-[300px]  rounded-2xl"
                />

                <div className="flex flex-col gap-2">
                  <p className="text-base sm:text-lg lg:text-xl text-[#646464]">
                    {videoDetails.title}
                  </p>
                  <div className="flex gap-5 text-[#646464] text-sm sm:text-base">
                    <p>{videoDetails.author}</p>
                    <p>
                      {new Date(videoDetails.length * 1000)
                        .toISOString()
                        .substr(11, 8)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-[#646464]">
                Paste a video link to preview details.
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Quiz Options */}
        <div className="flex flex-col gap-6 w-full lg:w-[560px]">
          {/* Heading */}
          <h2
            className={`text-2xl sm:text-3xl lg:text-5xl ${michroma.className}`}
          >
            Customize your quiz
          </h2>

          {/* Number of Questions */}
          <div className="flex flex-col gap-3">
            <p
              className={`text-[#646464] text-base sm:text-lg ${poppins.className}`}
            >
              Number of Questions
            </p>
            <div className="w-full h-[45px] sm:h-[50px] rounded-3xl border border-[#B9CDDD] flex items-center gap-2 p-1">
              {options.map((item, key) => (
                <button
                  key={key}
                  onClick={() => {
                    setNumberOfQuestions(item);
                    setOptions(
                      videoId ?? videoUrl,
                      (difficulty as "easy" | "medium" | "hard") ?? (difficultyLevel as "easy" | "medium" | "hard"),
                      item
                    );
                  }}
                  className={`flex-1 h-full rounded-3xl transition 
                    ${
                      (numQuestions ?? numberOfQuestions) === item
                        ? "bg-[#B8CCDB] text-white shadow-sm"
                        : "bg-white text-[#646464] hover:bg-[#f0f8ff]"
                    } ${poppins.className}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Level */}
          <div className="flex flex-col gap-3">
            <p
              className={`text-[#646464] text-base sm:text-lg ${poppins.className}`}
            >
              Difficulty Level
            </p>

            <div className="w-full h-[45px] sm:h-[50px] rounded-3xl border-2 border-[#B9CDDD]  flex items-center gap-2 p-1">
              {optionsForDifficulty.map((item, key) => (
                <button
                  key={key}
                  onClick={() => {
                    setDifficultyLevel(item);
                    setOptions(
                      videoId ?? videoUrl,
                      item as "easy" | "medium" | "hard",
                      numQuestions ?? numberOfQuestions
                    );
                  }}
                  className={`flex-1 h-full rounded-3xl transition 
                    ${
                      (difficulty ?? difficultyLevel) === item
                        ? "bg-[#B8CCDB] text-white shadow-sm"
                        : "bg-white text-[#646464] hover:bg-[#f0f8ff]"
                    } ${poppins.className}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Quiz Button */}
          <button
            onClick={handleGenerateQuiz}
            disabled={phase === "loading"}
            className={`w-full h-[45px] sm:h-[52px] flex items-center justify-center text-lg sm:text-xl rounded-2xl 
    bg-gradient-to-tr from-white via-[#d7e7f2] to-[#B8CCDB] 
    hover:via-[#EBF1F5] hover:to-[#a4c5db] text-black transition 
    disabled:opacity-50 ${poppins.className}`}
          >
            {phase === "loading" ? "Generating..." : "Generate Quiz"}
          </button>

          {/* Progress bar and rotating quotes below button when loading */}
          {phase === "loading" && (
            <div className="w-full flex flex-col items-center mt-4">
              {/* Progress Bar */}
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-[#5D85A1] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              {/* Rotating Quote or loadingMessage */}
              <div
                className={`text-[#646464] text-base sm:text-lg text-center min-h-[28px] ${poppins.className}`}
              >
                {quotes[quoteIndex] || loadingMessage}
              </div>
            </div>
          )}

          {/* Loading UI अब store/phase के हिसाब से <QuizLoading /> में दिखेगा */}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
