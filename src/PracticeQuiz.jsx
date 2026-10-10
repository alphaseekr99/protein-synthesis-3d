import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, X, XCircle } from "lucide-react";
import { quizQuestions } from "./quizQuestions.js";

const QUESTIONS_PER_ROUND = 10;

function shuffle(items) {
  const shuffledItems = [...items];
  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledItems[index], shuffledItems[randomIndex]] = [
      shuffledItems[randomIndex],
      shuffledItems[index],
    ];
  }
  return shuffledItems;
}

function chooseQuestions(previousQuestionIds) {
  const availableQuestions = quizQuestions.filter(
    (question) => !previousQuestionIds.includes(question.id),
  );
  const pool = availableQuestions.length >= QUESTIONS_PER_ROUND
    ? availableQuestions
    : quizQuestions.filter((question) => !previousQuestionIds.includes(question.id));

  return shuffle(pool)
    .slice(0, QUESTIONS_PER_ROUND)
    .map((question) => {
      const correctOption = question.options[question.answer];
      const incorrectOptions = shuffle(
        question.options.filter((_, index) => index !== question.answer),
      );
      const answer = 1 + Math.floor(Math.random() * (question.options.length - 1));
      const options = [...incorrectOptions];
      options.splice(answer, 0, correctOption);

      return { ...question, options, answer };
    });
}

export default function PracticeQuiz({ onClose, previousQuestionIds, onRoundStart }) {
  const [questions, setQuestions] = useState(() => {
    return chooseQuestions(previousQuestionIds);
  });
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);

  const hasFinished = questionIndex >= questions.length;
  const question = hasFinished ? null : questions[questionIndex];
  const isAnswered = selectedAnswer !== null;
  const isLastQuestion = questionIndex === questions.length - 1;
  const isCorrect = question !== null && selectedAnswer === question.answer;

  useEffect(() => {
    onRoundStart(questions.map((roundQuestion) => roundQuestion.id));
  }, [onRoundStart, questions]);

  function answerQuestion(optionIndex) {
    if (isAnswered) return;
    setSelectedAnswer(optionIndex);
    if (optionIndex === question.answer) {
      setScore((currentScore) => currentScore + 1);
    }
  }

  function continueQuiz() {
    if (isLastQuestion) {
      setQuestionIndex(questions.length);
      return;
    }
    setQuestionIndex((currentIndex) => currentIndex + 1);
    setSelectedAnswer(null);
  }

  function tryAgain() {
    const nextRound = chooseQuestions(previousQuestionIds);
    setQuestions(nextRound);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
  }

  return (
      <section
        aria-labelledby="quiz-title"
        className="quiz-panel"
        role="region"
      >
        <header className="quiz-header">
          <div>
            <p className="quiz-eyebrow">Year 10 Biology</p>
            <h2 id="quiz-title">Practice Quiz</h2>
          </div>
          {!hasFinished && (
            <div className="quiz-header-status">
              <span className="quiz-header-question">Question {questionIndex + 1} of {questions.length}</span>
              <span className="quiz-header-score">Score: <strong>{score}{questionIndex > 0 || isAnswered ? `/${questionIndex + (isAnswered ? 1 : 0)}` : ""}</strong></span>
              <button className="quiz-close" onClick={onClose} type="button">
                <X size={17} /> Close Quiz
              </button>
            </div>
          )}
          {hasFinished && (
            <button className="quiz-close" onClick={onClose} type="button">
              <X size={17} /> Close Quiz
            </button>
          )}
        </header>

        {hasFinished ? (
          <div aria-live="polite" className="quiz-result">
            <div className="quiz-result-mark"><CheckCircle2 size={32} /></div>
            <p className="quiz-eyebrow">Round complete</p>
            <h3>{score}/{questions.length}</h3>
            <p className="quiz-result-message">
              {score === questions.length
                ? "Excellent work — you have a strong understanding of protein synthesis."
                : score >= questions.length / 2
                  ? "Good effort — review any tricky ideas and give it another go."
                  : "Keep practising — each round is a chance to strengthen your understanding."}
            </p>
            <button className="quiz-primary" onClick={tryAgain} type="button">
              <RotateCcw size={17} /> Try Again
            </button>
          </div>
        ) : (
          <div className="quiz-content">
            <p className="quiz-topic">{question.topic}</p>
            <div
              aria-label={`Question ${questionIndex + 1} of ${questions.length}`}
              className="quiz-progress-track"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={questions.length}
              aria-valuenow={questionIndex + 1}
            >
              <span style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} />
            </div>
            <h3 className="quiz-question">{question.question}</h3>
            <div aria-label="Answer options" className="quiz-options">
              {question.options.map((option, optionIndex) => {
                const isCorrectOption = optionIndex === question.answer;
                const isSelectedOption = optionIndex === selectedAnswer;
                const answerClass = isAnswered && isCorrectOption
                  ? " is-correct"
                  : isAnswered && isSelectedOption
                    ? " is-incorrect"
                    : "";

                return (
                  <button
                    aria-pressed={isSelectedOption}
                    className={`quiz-option${answerClass}`}
                    disabled={isAnswered}
                    key={option}
                    onClick={() => answerQuestion(optionIndex)}
                    type="button"
                  >
                    <span className="quiz-option-letter">{String.fromCharCode(65 + optionIndex)}</span>
                    <span>{option}</span>
                    {isAnswered && isCorrectOption && <CheckCircle2 aria-hidden="true" className="quiz-option-icon" size={19} />}
                    {isSelectedOption && !isCorrectOption && <XCircle aria-hidden="true" className="quiz-option-icon" size={19} />}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div
                aria-live="polite"
                className={`quiz-feedback${isCorrect ? " is-correct" : " is-incorrect"}`}
              >
                <strong>{isCorrect ? "That's correct!" : "Not quite."}</strong>
                <p>{question.explanation}</p>
              </div>
            )}

            <footer className="quiz-footer">
              {isAnswered && (
                <button className="quiz-primary" onClick={continueQuiz} type="button">
                  Next Question <ArrowRight size={17} />
                </button>
              )}
            </footer>
          </div>
        )}
      </section>
  );
}
