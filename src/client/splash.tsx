import './index.css';

import { navigateTo, showForm, showToast } from '@devvit/web/client';
import { context } from '@devvit/web/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { InitResponse, QuizSubmissionResponse } from '../shared/api';

const quizData: InitResponse = await initQuiz();

async function initQuiz() {
  const res = await fetch('/api/init');

  return await res.json();
}

async function showQuizForm() {
  if (!quizData.quizForm) return;

  const result = await showForm(quizData.quizForm)
    .then(async (result) => {
      console.log(result, 'yooo');

      return await fetch('/api/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      })
    })

  const didUserFail = await result.json()
    .then((result: QuizSubmissionResponse) => {
      return result.didUserFail
    })

  if (didUserFail) {
    showToast({
      text: 'You have failed the quiz, check your answers!'
    })
  } else {
    await initQuiz();

    showToast({
      text: 'You have passed the quiz, your account has been verified!',
      appearance: 'success'
    })
  }

  console.log(quizData);
}

export const Splash = () => {
  return (
    <div className="flex relative flex-col justify-center items-center min-h-screen gap-4 bg-white dark:bg-stone-900">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Hey {context.username ?? 'user'} 👋
        </h1>
        <p className="text-base text-center text-gray-600 dark:text-gray-300">
          Take a quick quiz to get your account verified for posting!
        </p>
      </div>
      <div className="flex items-center justify-center mt-5">
        <button
          className="flex items-center justify-center bg-[#d93900] dark:bg-orange-600 text-white w-auto h-10 rounded-full cursor-pointer transition-colors px-4 hover:bg-[#c23300] dark:hover:bg-orange-700"
          onClick={async () => showQuizForm()}
        >
          Tap to Start
        </button>
      </div>
      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 flex-col text-center text-[0.8em] text-gray-600 dark:text-gray-400">
        <p className="text-orange-500 font-bold">
          r/HVAC is for professionals onlyd
        </p>
        <button 
          className="cursor-pointer hover:text-red-400 transition-colors text-red-500 font-bold"
          onClick={() => navigateTo('https://reddit.com/r/hvacadvice')}
        >
          Homeowner questions must be directed to r/HVACAdvice
        </button>
      </footer>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
