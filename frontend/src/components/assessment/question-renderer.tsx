import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface Props { question: Record<string, unknown>; answer: string; onAnswer: (a: string) => void }

export function QuestionRenderer({ question, answer, onAnswer }: Props) {
  const type = question.type as string;
  const text = question.text as string;
  const options = (question.options ?? []) as string[];

  return (
    <Card data-testid={`question-${question.question_id}`}>
      <CardContent className="space-y-4 p-6">
        <p className="font-medium">{text}</p>
        {type === "mcq" && (
          <div className="space-y-2">
            {options.map((opt, i) => (
              <label key={i} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors ${answer === opt ? "border-primary bg-primary/5" : "hover:bg-muted"}`}>
                <input type="radio" name="answer" value={opt} checked={answer === opt} onChange={() => onAnswer(opt)} className="h-4 w-4" data-testid={`question-option-${i}`} />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        )}
        {type === "short_answer" && (
          <Input value={answer} onChange={(e) => onAnswer(e.target.value)} placeholder="Type your answer..." data-testid="question-short-answer-input" />
        )}
        {type === "practical" && (
          <Textarea value={answer} onChange={(e) => onAnswer(e.target.value)} placeholder="Write your solution..." rows={6} data-testid="question-practical-input" />
        )}
      </CardContent>
    </Card>
  );
}
