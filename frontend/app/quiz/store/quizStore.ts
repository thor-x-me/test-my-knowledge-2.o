// quizStore.ts
import { create } from "zustand";
import axios from "axios";

type Phase = "setup" | "loading" | "playing" | "result";
type Difficulty = "easy" | "medium" | "hard";

export type UIQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer?: string;
  explanation?: string;
  userAnswer?: string;
};

type VideoDetails = {
  title: string;
  author: string;
  length: number;
  views: number;
  description: string;
  thumbnail_url: string;
  video_id: string;
  duration: number;
};

type FetchVideoDetailsResponse = {
  success: boolean;
  message: string;
  video_info: VideoDetails;
};

type QuizData = {
  quizId: number;
  videoId: string;
  difficulty: Difficulty;
  questions: UIQuestion[];
};

type Results = {
  total: number;
  correct: number;
  incorrect: number;
  notAttempted: number;
  scorePercent: number;
};

interface QuizStore {
  phase: Phase;
  videoId?: string;
  quizId?: number;
  difficulty: Difficulty;
  numQuestions: number;
  quizData: QuizData | null;
  answers: Record<number, string>;
  videoDetails: VideoDetails | null;
  results: Results | null;
  currentQuestionIndex: number;
  loadingMessage?: string;
  error?: string | null;
  showSubmitConfirm: boolean;

  setOptions: (
    videoIdOrUrl: string,
    difficulty: Difficulty,
    numQuestions: number
  ) => void;
  fetchVideoDetails: (
    videoUrl: string,
    getToken: (opts?: { template?: string }) => Promise<string | null>,
    template?: string
  ) => Promise<FetchVideoDetailsResponse>;
  startQuizFlow: (
    getToken: (opts?: { template?: string }) => Promise<string | null>,
    template?: string
  ) => Promise<void>;
  answerQuestion: (questionIndex: number, option: string) => void;
  submitQuiz: (
    getToken: (opts?: { template?: string }) => Promise<string | null>,
    template?: string
  ) => Promise<void>;
  getResults: (
    getToken: (opts?: { template?: string }) => Promise<string | null>
  ) => Promise<void>;
  next: () => void;
  prev: () => void;
  openSubmitConfirm: () => void;
  closeSubmitConfirm: () => void;
  reset: () => void;
  reattempt: () => void;
  recreateQuiz: () => void;
}

// === Helper axios client with JWT ===
async function getApiClient(
  getToken: (opts?: { template?: string }) => Promise<string | null>,
  template?: string
) {
  const token = await getToken({ template });
  return axios.create({
    baseURL: "http://localhost:8000/api/video_to_quiz",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

// === Extract YouTube videoId from URL ===
function extractVideoId(videoIdOrUrl: string): string {
  if (!videoIdOrUrl) return "";
  if (/^https?:\/\//i.test(videoIdOrUrl)) {
    const url = new URL(videoIdOrUrl);
    if (url.hostname.includes("youtube.com"))
      return url.searchParams.get("v") || "";
    if (url.hostname.includes("youtu.be")) return url.pathname.replace("/", "");
  }
  return videoIdOrUrl;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const useQuizStore = create<QuizStore>()(
  (set, get) => ({
    phase: "setup",
    videoId: undefined,
    quizId: undefined,
    difficulty: "easy",
    numQuestions: 5,
    quizData: null,
    videoDetails: null,
    answers: {},
    results: null,
    currentQuestionIndex: 0,
    loadingMessage: undefined,
    error: null,
    showSubmitConfirm: false,

    setOptions: (videoIdOrUrl, difficulty, numQuestions) => {
      const videoId = extractVideoId(videoIdOrUrl);
      set({ videoId, difficulty, numQuestions });
    },

    fetchVideoDetails: async (videoUrl, getToken, template) => {
      const api = await getApiClient(getToken, template);
      const res = await api.post("/video/details", { url: videoUrl });
      const data: FetchVideoDetailsResponse = res.data;
      set({ videoDetails: data.video_info });
      return data;
    },

    startQuizFlow: async (getToken, template) => {
      const { videoId, difficulty, numQuestions } = get();
      if (!videoId) {
        set({ error: "Video ID missing" });
        return;
      }
      const api = await getApiClient(getToken, template);

      set({ phase: "loading", loadingMessage: "Getting video details..." });

      // 1. ensure details are fetched
      await api.post("/video/details", {
        url: `https://www.youtube.com/watch?v=${videoId}`,
      });

      // 2. download audio
      set({ loadingMessage: "Downloading audio..." });
      await api.post("/audio/download", { video_id: videoId });

      // 3. generate quiz
      set({ loadingMessage: "Generating quiz..." });
      const gen = await api.post("/generate", {
        video_id: videoId,
        difficulty,
        num_questions: numQuestions,
      });
      const quizId = gen.data.quiz_ref.id;
      set({ quizId });

      // 4. poll status until ready
      let ready = false;
      for (let i = 0; i < 60; i++) {
        const st = await api.get(`/status/${quizId}`);
        if (st.data.ready) {
          ready = true;
          break;
        }
        set({ loadingMessage: `Preparing quiz... ~${(i + 1) * 3}s` });
        await sleep(3000);
      }
      if (!ready) {
        set({ error: "Quiz generation failed", phase: "setup" });
        return;
      }

      // 5. start quiz
      set({ loadingMessage: "Starting quiz..." });
      const startRes = await api.post(`/start/${quizId}`);
      const rawQuestions = startRes.data.quiz_questions;

      const questions: UIQuestion[] = rawQuestions.map(
        (q: Record<string, unknown>, idx: number) => ({
          id: idx + 1,
          question: q.question as string,
          options: Object.values(q.options as Record<string, string>),
          correctAnswer: (q.options as Record<string, string>)[
            q.correct_answer as string
          ],
          explanation: q.explanation as string,
        })
      );

      set({
        quizData: { quizId, videoId, difficulty, questions },
        answers: {},
        currentQuestionIndex: 0,
        loadingMessage: undefined,
        phase: "playing",
      });
    },

    answerQuestion: (questionIndex, option) => {
      const { quizData } = get();
      if (!quizData) return;
      set({
        answers: { ...get().answers, [questionIndex]: option },
        quizData: {
          ...quizData,
          questions: quizData.questions.map((q, idx) =>
            idx === questionIndex ? { ...q, userAnswer: option } : q
          ),
        },
      });
    },

    submitQuiz: async (getToken, template) => {
      const { quizId, quizData, answers } = get();
      if (!quizId || !quizData) return;

      const total = quizData.questions.length;
      let correct = 0,
        incorrect = 0,
        notAttempted = 0;

      quizData.questions.forEach((q, idx) => {
        const ans = answers[idx];
        if (!ans) notAttempted++;
        else if (ans === q.correctAnswer) correct++;
        else incorrect++;
      });

      const api = await getApiClient(getToken, template);
      await api.post(`/add_results/${quizId}`, {
        total_correct_attempt: correct,
        total_wrong_attempt: incorrect,
        not_attempted: notAttempted,
      });

      set({
        results: {
          total,
          correct,
          incorrect,
          notAttempted,
          scorePercent: total ? Math.round((correct / total) * 100) : 0,
        },
        phase: "result",
        showSubmitConfirm: false,
      });
    },

    next: () => {
      const { currentQuestionIndex, quizData } = get();
      if (!quizData) return;
      set({
        currentQuestionIndex: Math.min(
          currentQuestionIndex + 1,
          quizData.questions.length - 1
        ),
      });
    },

    prev: () => {
      const { currentQuestionIndex } = get();
      set({ currentQuestionIndex: Math.max(currentQuestionIndex - 1, 0) });
    },

    openSubmitConfirm: () => set({ showSubmitConfirm: true }),
    closeSubmitConfirm: () => set({ showSubmitConfirm: false }),

    getResults: async (getToken) => {
      const { quizId } = get();
      if (!quizId) {
        set({ error: "Quiz ID missing" });
        return;
      }

      try {
        const api = await getApiClient(getToken);
        const res = await api.get(`/get_results/${quizId}`);
        const resultData = res.data;

        // Map the result to your Results type if needed
        set({
          results: {
            total: resultData.total,
            correct: resultData.correct,
            incorrect: resultData.incorrect,
            notAttempted: resultData.not_attempted,
            scorePercent: resultData.total
              ? Math.round((resultData.correct / resultData.total) * 100)
              : 0,
          },
          phase: "result",
        });
      } catch (err: unknown) {
        let errorMsg = "Unknown error";
        if (err instanceof Error) {
          errorMsg = err.message;
        } else if (typeof err === "object" && err !== null) {
          // @ts-expect-error: err may have response.data.message from Axios error
          errorMsg = err?.["response"]?.["data"]?.["message"] || errorMsg;
        }
        set({ error: errorMsg });
      }
    },

    reattempt: () => {
      const { quizData } = get();
      if (!quizData) return; // no quiz to reattempt

      set({
        answers: {},
        results: null,
        currentQuestionIndex: 0,
        phase: "playing",
        showSubmitConfirm: false,
        quizData: {
          ...quizData,
          questions: quizData.questions.map((q) => ({
            ...q,
            userAnswer: undefined,
          })),
        },
      });
    },

    // getToken को सही प्रकार के साथ उपयोग करें, और टाइपिंग को ठीक करें
    // newQuiz: async (
    //   getToken: (opts?: { template?: string }) => Promise<string | null>,
    //   template?: string
    // ) => {
    //   const { videoId, difficulty, numQuestions } = get();
    //   if (!videoId) return;

    //   set({ phase: "loading", results: null, currentQuestionIndex: 0 });

    //   try {
    //     // ✅ get API client with JWT template
    //     const api = await getApiClient(getToken, "Postman");

    //     // 1. generate new quiz
    //     set({ loadingMessage: "Generating new quiz..." });
    //     const gen = await api.post("/generate", {
    //       video_id: videoId,
    //       difficulty,
    //       num_questions: numQuestions,
    //     });

    //     const quizId = gen.data.quiz_ref.id;
    //     set({ quizId });

    //     // 2. poll until quiz is ready
    //     let ready = false;
    //     for (let i = 0; i < 60; i++) {
    //       const st = await api.get(`/status/${quizId}`);
    //       if (st.data.ready) {
    //         ready = true;
    //         break;
    //       }
    //       set({ loadingMessage: `Preparing new quiz... ~${(i + 1) * 3}s` });
    //       await sleep(3000);
    //     }

    //     if (!ready) {
    //       set({ error: "New quiz generation failed", phase: "setup" });
    //       return;
    //     }

    //     // 3. start quiz
    //     set({ loadingMessage: "Starting new quiz..." });
    //     const startRes = await api.post(`/start/${quizId}`);

    //     const rawQuestions = startRes.data.quiz_questions;

    //     const questions: UIQuestion[] = rawQuestions.map((q: any, idx: number) => ({
    //       id: idx + 1,
    //       question: q.question,
    //       options: Object.values(q.options),
    //       correctAnswer: q.options[q.correct_answer],
    //       explanation: q.explanation,
    //     }));

    //     set({
    //       quizData: { quizId, videoId, difficulty, questions },
    //       answers: {},
    //       currentQuestionIndex: 0,
    //       loadingMessage: undefined,
    //       phase: "playing",
    //     });
    //   } catch (err) {
    //     console.error("Failed to create new quiz", err);
    //     set({ phase: "setup" });
    //   }
    // },

    recreateQuiz: () => {
      const { videoId } = get();
      if (!videoId) return;

      set({
        quizId: undefined, // null की जगह undefined करें, क्योंकि type 'number | undefined' है
        quizData: null,
        answers: {},
        currentQuestionIndex: 0,
        results: null,
        phase: "setup", // go back to setup page
        videoId, // keep videoId so the input is prefilled
      });
    },

    reset: () =>
      set({
        phase: "setup",
        videoId: undefined,
        quizId: undefined,
        difficulty: "easy",
        numQuestions: 5,
        quizData: null,
        answers: {},
        results: null,
        currentQuestionIndex: 0,
        loadingMessage: undefined,
        error: null,
        showSubmitConfirm: false,
      }),
  })
  // केवल एक आर्गुमेंट पास करें, क्योंकि zustand persist अब एक ही आर्गुमेंट लेता है
  // { name: "quiz-storage" } को persist के config में डालें
);
