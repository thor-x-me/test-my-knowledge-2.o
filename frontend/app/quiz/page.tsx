"use client"; // important in Next.js App Router for using hooks

import React from "react";
import QuizSetup from "./components/QuizSetup";
// import QuizLoading from "./components/QuizLoading";
import QuizPlayer from "./components/Quizplayer";
import QuizResult from "./components/QuizResult";
import { useQuizStore } from "./store/quizStore"; // path depends on your structure

const Quiz = () => {
  const { phase } = useQuizStore();

  // const phase = "result" ;


  if (phase === "setup") {
    return <QuizSetup />;
  }

  if (phase === "loading") {
    return <QuizSetup/>;
  }

  if (phase === "playing") {
    return <QuizPlayer />;
  }

  if (phase === "result") {
    return <QuizResult />;
  }

  return null;
};

export default Quiz;
