import { Hono } from 'hono';
import { context, reddit } from '@devvit/web/server';
import { isUserBanned, isUserVerifiedToPost } from '../helpers';
import type { InitResponse, QuizResponse, QuizSubmissionResponse } from '../../shared/api';
import type { Form } from '@devvit/web/shared';

type ErrorResponse = {
  status: 'error' | 'logged_out';
  message: string;
};

type QuizFormResponse = {
  action: 'SUBMITTED';
  values: { [K in keyof typeof quizAnswers]: string[]; };
}

type QuizKey = keyof typeof quizAnswers;

export const api = new Hono();

const quizAnswers = {
  deltaT: 'temperature_difference',
  normalSuction: 'it_depends',
  whatIsABC: 'airflow_before_charge',
}

const quizFields: Form['fields'] = [
  {
    type: 'select',
    name: 'deltaT',
    label: 'What does ΔT stand for?',
    options: [
      { label: 'Total system pressure', value: 'system_pressure' },
      { label: 'Temperature difference between two points', value: 'temperature_difference' }, // Answer
      { label: 'Refrigerant saturation temperature', value: 'saturation_temperature' },
      { label: 'Thermostat setpoint range', value: 'thermostat_setpoint' }
    ]
  },
  {
    type: 'select',
    name: 'normalSuction',
    label: 'What is "normal" suction pressure fro an A/C system?',
    options: [
      { label: '69 psi', value: '69_psi' },
      { label: '120 psi', value: '120_psi' },
      { label: '45 psi', value: '45_psi' },
      { label: 'It depends on the system and conditions', value: 'it_depends' } // Answer
    ]
  },
  {
    type: 'select',
    name: 'whatIsABC',
    label: 'What does ABC stand for in HVAC?',
    options: [
      { label: 'Airflow Before Charge', value: 'airflow_before_charge' }, // Answer
      { label: 'Air Balance Commissioning', value: 'air_balance_commissioning' },
      { label: 'Advanced Blower Calibration', value: 'advanced_blower_calibration' },
      { label: 'Ambient Bypass Correction', value: 'ambient_bypass_correction' }
    ]
  },
]

api.get('/init', async (c) => {
  const { subredditName } = context;

  if (!subredditName) {
    console.error('API Init Error: subredditName not found in devvit context');
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'subredditName is required but missing from context',
      },
      400
    );
  }

  const username = await reddit.getCurrentUsername();
  if (!username) {
    return c.json<InitResponse>({
      type: 'init',
      accountStatus: 'LOGGED_OUT'
    })
  }

  const isBanned = await isUserBanned(subredditName, username);
  if (isBanned) {
    return c.json<InitResponse>({
      type: 'init',
      accountStatus: 'BANNED'
    })
  }

  const isVerified = await isUserVerifiedToPost(subredditName, username);
  if (!isVerified) {
    return c.json<InitResponse>({
      type: 'init',
      accountStatus: 'LOGGED_IN'
    });
  }

  return c.json<InitResponse>({
    type: 'init',
    accountStatus: 'VERIFIED'
  });
})

api.get('/get-quiz', async (c) => {
  const { subredditName } = context;

  if (!subredditName) {
    console.error('API Init Error: subredditName not found in devvit context');
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'subredditName is required but missing from context',
      },
      400
    );
  }

  const username = await reddit.getCurrentUsername();
  if (!username) {
    return c.json<ErrorResponse>(
      {
        status: 'logged_out',
        message: 'Only logged in users may take part in this quiz',
      },
      400
    );
  }

  try {
    return c.json<QuizResponse>({
      type: 'quizResponse',
      subredditName: subredditName,
      username: username,
      quizForm: {
        title: 'Verification Quiz',
        description: 'Since this subreddit is for trade professionals only, you must verify your account by taking a short quiz!',
        fields: quizFields,
        acceptLabel: 'Submit',
        cancelLabel: 'Nevermind'
      }
    });
  } 
  catch (error) {
    console.error(`API Init Error for subreddit ${subredditName}:`, error);

    let errorMessage = 'Unknown error during initialization';
    if (error instanceof Error) {
      errorMessage = `Initialization failed: ${error.message}`;
    }

    return c.json<ErrorResponse>(
      { status: 'error', message: errorMessage },
      400
    );
  }
})

api.post('/submit-quiz', async (c) => {
  const quizUserAnswers: QuizFormResponse['values'] = (await c.req.json()).values;
  if (!quizUserAnswers) return;
  
  const { subredditName } = context;
  const username = await reddit.getCurrentUsername();
  if (!subredditName || !username) return;

  let failedQuiz = false;
  (Object.entries(quizUserAnswers) as [QuizKey, string[]][])
    .forEach(([key, userAnswer]) => {
      if (quizAnswers[key] !== userAnswer[0]) {
        failedQuiz = true;
      }
    });

  if (!failedQuiz) {
    await reddit.approveUser(username, subredditName)
  }

  return c.json<QuizSubmissionResponse>({
    type: 'quizSubmission',
    didUserFail: failedQuiz
  })
})