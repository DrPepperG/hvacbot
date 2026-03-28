import { Form } from "@devvit/web/shared";

export type InitResponse = {
  type: 'init';

  subredditName: string;
  username: string;

  isVerified: boolean;

  quizForm?: Form
};

export type QuizSubmissionResponse = {
  type: 'quizSubmission';

  didUserFail: boolean;
}