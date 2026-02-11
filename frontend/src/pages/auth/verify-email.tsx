import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useVerifyEmail } from "@/hooks/api/use-auth";
import { useState } from "react";

const schema = z.object({ code: z.string().min(1, "Required") });
type FormData = z.infer<typeof schema>;

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email ?? "";
  const verify = useVerifyEmail();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    setError("");
    verify.mutate({ email, code: data.code }, {
      onSuccess: () => navigate("/login"),
      onError: (e: unknown) => setError((e as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Verification failed"),
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Email</CardTitle>
          <CardDescription>Enter the verification code sent to {email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="verify-form">
            {error && <p className="text-sm text-destructive" data-testid="verify-error">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input id="code" {...register("code")} data-testid="verify-code-input" />
              {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={verify.isPending} data-testid="verify-submit-button">
              {verify.isPending ? "Verifying..." : "Verify"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
