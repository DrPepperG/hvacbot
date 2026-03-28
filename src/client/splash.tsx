import './index.css';

import { navigateTo, showForm, showToast } from '@devvit/web/client';
import { context } from '@devvit/web/client';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { InitResponse, QuizResponse, QuizSubmissionResponse } from '../shared/api';

async function getQuiz() {
  const res = await fetch('/api/get-quiz');

  return await res.json();
}

let quizData: QuizResponse | null = null

async function showQuizForm() {
  if (!quizData) return false;
  if (!quizData.quizForm) return false;

  const result = await showForm(quizData.quizForm)
    .then(async (result) => {
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
    return false;
  } else {
    showToast({
      text: 'You have passed the quiz, your account has been verified!',
      appearance: 'success'
    })
    return true;
  }
}

export const Splash = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    void (async () => {
      await fetch('/api/init')
        .then(async (res) => {
          const json = await res.json();
          if (!res.ok) {
            if (json.status === 'logged_out') {
              setIsLoggedOut(true);
              throw Error('User not logged in');
            }
          }
          return json
        })
        .then(async (json: InitResponse) => {
          setIsVerified(json.isVerified);
          quizData = await getQuiz();

          if (!json.isVerified) quizData = await getQuiz();

          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        })
    })();
  }, [])

  if (isLoggedOut) {
    return (
      <div className="flex relative flex-col justify-center items-center min-h-screen gap-4 bg-white dark:bg-stone-900">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          You must be logged in to verify an account...
        </h1>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen gap-4 bg-white dark:bg-stone-900">
      {isLoading 
        ? <>
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              Loading your experience...
            </h1>
          </>
        : (
          <>
            {isVerified
            ? <>
                <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                  You're verified, happy posting!
                </h1>
              </>
            :
              <>
                <div className="mt-10 flex flex-col items-center gap-2">
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
                    onClick={async () => { 
                      const isVerified = await showQuizForm();
                      setIsVerified(isVerified);
                    }}
                  >
                    Tap to Start
                  </button>
                </div>
                <footer className="flex gap-3 flex-col text-center text-[0.8em] text-gray-600 dark:text-gray-400">
                  <p className="text-orange-500 font-bold">
                    r/HVAC is for professionals only
                  </p>
                  <button 
                    className="cursor-pointer hover:text-red-400 transition-colors text-red-500 font-bold"
                    onClick={() => navigateTo('https://reddit.com/r/hvacadvice')}
                  >
                    Homeowner questions must be directed to r/HVACAdvice
                  </button>
                </footer>
            </>}
          </>
        )}
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
