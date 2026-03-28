import './index.css';

import { navigateTo } from '@devvit/web/client';
import { context, requestExpandedMode } from '@devvit/web/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

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
          onClick={(e) => requestExpandedMode(e.nativeEvent, 'quiz')}
        >
          Tap to Start
        </button>
      </div>
      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 flex-col text-center text-[0.8em] text-gray-600 dark:text-gray-400">
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
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
