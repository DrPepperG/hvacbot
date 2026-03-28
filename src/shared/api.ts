import { Form } from "@devvit/web/shared";

export type InitResponse = {
  type: 'init';
  isVerified: boolean;
};

export type QuizResponse = {
  type: 'quizResponse';

  subredditName: string;
  username: string;

  quizForm?: Form;
};

export type QuizSubmissionResponse = {
  type: 'quizSubmission';

  didUserFail: boolean;
}