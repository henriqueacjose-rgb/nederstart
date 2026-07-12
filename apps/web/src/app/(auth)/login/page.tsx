import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, TextInput } from "@/components/ui/input";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <Card className="w-full max-w-md p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold text-brand-accent">NederStart</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-text">Log in</h1>
        <p className="mt-2 text-sm text-brand-muted">Continue learning Dutch for real life.</p>
      </div>

      {searchParams.error ? (
        <p className="mb-4 rounded-component bg-red-50 p-3 text-sm text-brand-error">
          {searchParams.error}
        </p>
      ) : null}

      <form action={loginAction} className="grid gap-4">
        <Field label="Email">
          <TextInput name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Password">
          <TextInput name="password" type="password" autoComplete="current-password" required />
        </Field>
        <Button type="submit">Log in</Button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm">
        <Link className="font-semibold text-brand-primary" href="/register">
          Create account
        </Link>
        <Link className="font-semibold text-brand-muted" href="/forgot-password">
          Forgot password?
        </Link>
      </div>
    </Card>
  );
}
