import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useLogin } from "@/hooks/api/use-auth";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    setError("");
    login.mutate(data, {
      onSuccess: () => navigate("/"),
      onError: (e: unknown) => setError((e as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Invalid email or password"),
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="login-form">
            {error && <p className="text-sm text-destructive" data-testid="login-error">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} data-testid="login-email-input" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} data-testid="login-password-input" />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={login.isPending} data-testid="login-submit-button">
              {login.isPending ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
