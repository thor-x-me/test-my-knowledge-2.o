"use client"
import React from "react";
import Image from "next/image";
import Header from "@/app/components/Header";
import { Poppins, Michroma } from "next/font/google";
import { useQuizStore } from "../store/quizStore";
import QuizResultChart from "./Chart";
import { useState } from "react";
import {useRouter} from "next/navigation";


const poppins = Poppins({ weight: "400", subsets: ["latin"] });
const michroma = Michroma({ weight: "400", subsets: ["latin"] });

const QuizResult = () => {
  // const { results, quizData, reset } = useQuizStore();
  const router = useRouter();//

  const { results, quizData, videoDetails , reattempt, recreateQuiz } = useQuizStore();
  console.log(results)
  const [showAnswers, setShowAnswers] = useState(false);


  const handleRecreate = () => {
    recreateQuiz();
    router.push("/quiz"); // navigate back to setup page
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

      {/* results and chart and question */}
      <div
        className="lg:mx-24 mx-6  flex flex-col gap-4 bg-[linear-gradient(78.26deg,#FFFFFF_0%,#B8CCDB_100%)] 
  border border-[#B9CDDD] rounded-[20px] box-border mt-10 p-8"
      >
        <div className="grid grid-cols-3 gap-4 border-b-1 border-black">
          {/* video  */}
          <div className="h-[220px] rounded-2xl ">
          {videoDetails && <Image
                  src={videoDetails?.thumbnail_url}
                  alt={videoDetails?.title}
                  className="w-full object-cover rounded-2xl"
                  width={300}
                  height={220}
                />}
          </div>

          {/* chart and buttons*/}
          <div className="col-span-2 h-[400px]  ">
            {/* chart */}
            {results ? (
              <QuizResultChart />
            ) : (
              <p className="text-gray-600">
                No results yet. Complete a quiz first!
              </p>
            )}

            {/* buttons */}
            <div className="flex gap-7 mt-6 justify-end mr-2">
              {/* reveal answer button */}
              <button
                className={`w-[214px] h-[45px] rounded-2xl border border-[#7B9EB9] text-[#558BB3] ${poppins.className} hover:bg-[#558BB3] hover:text-white transform transition duration-175`}
                onClick={()=>{setShowAnswers(true)}}
              >
                Reveal Answer
              </button>

              <button
                className={`w-[214px] h-[45px] rounded-2xl border border-[#7B9EB9] text-[#558BB3] ${poppins.className} hover:bg-[#558BB3] hover:text-white transform transition duration-175`}
                onClick={reattempt}
              >
                Reattempt Answer
              </button>

              <button
                className={`w-[214px] h-[45px] rounded-2xl border border-[#7B9EB9] text-[#558BB3] ${poppins.className} hover:bg-[#558BB3] hover:text-white transform transition duration-175`}
                onClick={handleRecreate}
              >
                Recreate Answer
              </button>
            </div>
          </div>
        </div>

        {showAnswers && quizData && (
          <div className="bg-white mt-6 p-10 rounded-2xl">
            {quizData.questions.map((q, idx) => {
              const isUnattempted = !q.userAnswer;

              return (
                <div key={q.id} className="mb-6">
                  {/* Question text */}
                  <p className={`font-semibold mb-7 border-b-1 pb-3 border-[#7B9EB9] text-[#646464] ${poppins.className} text-xl`}>
                    {idx + 1}. {q.question}
                    {isUnattempted && (
                      <span className="ml-3 text-xs font-semibold px-2 py-1 rounded border border-purple-400 text-purple-500">
                        Not Attempted
                      </span>
                    )}
                  </p>

                  {/* Options */}
                  <div className={`flex flex-col gap-6 text-xl ${poppins.className} text-[#646464]`} >
                    {q.options.map((opt, i) => {
                      const isUserChoice = q.userAnswer === opt;
                      const isCorrect = q.correctAnswer === opt;

                      let optionClass =
                        "flex items-center gap-2 px-3 py-2 rounded-xl  cursor-pointer";

                      if (isUserChoice && isCorrect) {
                        optionClass +=
                          " bg-green-100 border-green-500 border text-green-700";
                      } else if (isUserChoice && !isCorrect) {
                        optionClass +=
                          " bg-red-100 border-red-500 border text-red-700";
                      } else if (!isUserChoice && isCorrect) {
                        optionClass += " border-green-400 border bg-green-100";
                      } else {
                        optionClass += "";
                      }

                      return (
                        <label key={i} className={optionClass}>
                          <input
                            type="radio"
                            checked={isUserChoice}
                            readOnly
                            className={(isUserChoice && isCorrect) ? `accent-[#99e5bf] w-5 h-5 bg-transparent ` : `accent-red-500 w-5 h-5`}
                            
                          />
                          <span>{opt}</span>

                          {/* Icons */}
                          {isUserChoice && isCorrect && <span>✅</span>}
                          {isUserChoice && !isCorrect && <span>❌</span>}
                        </label>
                      );
                    })}
                  </div>

                  {/* Explanation (if available) */}
                  {q.explanation && (
                    <p className="ml-1 mt-5 text-lg text-gray-900 italic mb-3">
                      Explanation: {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResult;
