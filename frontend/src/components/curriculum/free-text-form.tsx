import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGenerateCurriculum } from "@/hooks/api/use-curriculum";
import { useState } from "react";

const schema = z.object({
  topic: z.string().min(1, "Topic is required"),
  test_type: z.string().min(1, "Select a test type"),
  program_level: z.string().min(1, "Select a level"),
});

type FormData = z.infer<typeof schema>;

export function FreeTextForm() {
  const navigate = useNavigate();
  const generate = useGenerateCurriculum();
  const [error, setError] = useState("");
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    setError("");
    generate.mutate(data, {
      onSuccess: (res) => navigate(`/curricula/${res.data.curriculum_id}`, { state: { generating: true } }),
      onError: (e: unknown) => setError((e as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Generation failed"),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4" data-testid="freetext-form">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        <Input id="topic" placeholder='e.g. "Kubernetes security"' {...register("topic")} data-testid="freetext-topic-input" />
        {errors.topic && <p className="text-sm text-destructive">{errors.topic.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Test Type</Label>
        <Select onValueChange={(v) => setValue("test_type", v)}>
          <SelectTrigger data-testid="freetext-testtype-select"><SelectValue placeholder="Select type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="quiz">Quiz</SelectItem>
            <SelectItem value="practical">Practical</SelectItem>
            <SelectItem value="mixed">Mixed</SelectItem>
          </SelectContent>
        </Select>
        {errors.test_type && <p className="text-sm text-destructive">{errors.test_type.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Program Level</Label>
        <Select onValueChange={(v) => setValue("program_level", v)}>
          <SelectTrigger data-testid="freetext-level-select"><SelectValue placeholder="Select level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        {errors.program_level && <p className="text-sm text-destructive">{errors.program_level.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={generate.isPending} data-testid="freetext-submit-button">
        {generate.isPending ? "Generating..." : "Generate Curriculum"}
      </Button>
    </form>
  );
}
