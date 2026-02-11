import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfile, useUpdateProfile } from "@/hooks/api/use-auth";
import { useState } from "react";

const schema = z.object({
  experience_level: z.string().optional(),
  learning_goals: z.string().optional(),
  technical_role: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { data } = useProfile();
  const update = useUpdateProfile();
  const [saved, setSaved] = useState(false);
  const profile = data?.data;

  const { register, handleSubmit, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      experience_level: profile?.experience_level ?? "",
      learning_goals: (profile?.learning_goals as string[] | undefined)?.join(", ") ?? "",
      technical_role: profile?.technical_role ? "true" : "false",
    },
  });

  const onSubmit = (d: FormData) => {
    setSaved(false);
    update.mutate({
      experience_level: d.experience_level || undefined,
      learning_goals: d.learning_goals ? d.learning_goals.split(",").map((s) => s.trim()) : undefined,
      technical_role: d.technical_role === "true",
    }, { onSuccess: () => setSaved(true) });
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="profile-form">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile?.email ?? ""} disabled data-testid="profile-email-input" />
            </div>
            <div className="space-y-2">
              <Label>Role Type</Label>
              <Select defaultValue={profile?.technical_role ? "true" : "false"} onValueChange={(v) => setValue("technical_role", v)}>
                <SelectTrigger data-testid="profile-role-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Technical</SelectItem>
                  <SelectItem value="false">Non-Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience_level">Experience Level</Label>
              <Select defaultValue={profile?.experience_level ?? ""} onValueChange={(v) => setValue("experience_level", v)}>
                <SelectTrigger data-testid="profile-experience-select"><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="learning_goals">Learning Goals (comma-separated)</Label>
              <Input id="learning_goals" {...register("learning_goals")} data-testid="profile-goals-input" />
            </div>
            {saved && <p className="text-sm text-green-600">Profile saved!</p>}
            <Button type="submit" disabled={update.isPending} data-testid="profile-submit-button">
              {update.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
