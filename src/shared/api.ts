import { Form } from "@devvit/web/shared";

export type InitResponse = {
  type: 'init';
  accountStatus: 'VERIFIED' | 'LOGGED_IN' | 'LOGGED_OUT' | 'BANNED'
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