import { useParams } from "react-router-dom";
import { useQuiz, useSubmitAnswers } from "@/hooks/api/use-assessment";
import { QuestionRenderer } from "@/components/assessment/question-renderer";
import { QuizResults } from "@/components/assessment/quiz-results";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function QuizPage() {
  const { curriculumId = "", quizId = "" } = useParams();
  const { data, isLoading } = useQuiz(curriculumId, quizId);
  const submit = useSubmitAnswers();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);

  const quiz = data?.data;
  const questions = (quiz?.questions ?? []) as Array<Record<string, unknown>>;
  const current = questions[currentIdx];

  if (isLoading) return <div className="p-6">Loading quiz...</div>;
  if (!quiz) return <div className="p-6">Quiz not found</div>;
  if (submit.isSuccess) return <QuizResults results={submit.data.data} curriculumId={curriculumId} />;

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    const payload = Object.entries(answers).map(([question_id, answer]) => ({ question_id, answer }));
    submit.mutate({ curriculumId, quizId, answers: payload });
  };

  return (
    <div className="mx-auto max-w-2xl p-6" data-testid="quiz-page">
      <h1 className="mb-1 text-2xl font-bold">{quiz.title as string}</h1>
      <p className="mb-6 text-sm text-muted-foreground">Question {currentIdx + 1} of {questions.length}</p>
      {quiz.difficulty_level && (
        <p className="mb-4 text-xs rounded bg-muted px-2 py-1 w-fit" data-testid="quiz-difficulty">Difficulty: <span className="font-medium capitalize">{quiz.difficulty_level as string}</span></p>
      )}

      {current && (
        <QuestionRenderer
          question={current}
          answer={answers[current.question_id as string] ?? ""}
          onAnswer={(a) => handleAnswer(current.question_id as string, a)}
        />
      )}

      <div className="mt-6 flex justify-between">
        <Button variant="outline" disabled={currentIdx === 0} onClick={() => setCurrentIdx((i) => i - 1)} data-testid="quiz-prev-button">Previous</Button>
        {currentIdx < questions.length - 1 ? (
          <Button onClick={() => setCurrentIdx((i) => i + 1)} data-testid="quiz-next-button">Next</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submit.isPending || Object.keys(answers).length < questions.length} data-testid="quiz-submit-button">
            {submit.isPending ? "Submitting..." : "Submit Quiz"}
          </Button>
        )}
      </div>
    </div>
  );
}
