import Link from "next/link";
import { recoverPasswordAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, TextInput } from "@/components/ui/input";

export default function ForgotPasswordPage({
  searchParams
}: {
  searchParams: { error?: string; sent?: string };
}) {
  return (
    <Card className="w-full max-w-md p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold text-brand-accent">NederStart</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-text">Recover password</h1>
        <p className="mt-2 text-sm text-brand-muted">Receive a secure reset link by email.</p>
      </div>

      {searchParams.error ? (
        <p className="mb-4 rounded-component bg-red-50 p-3 text-sm text-brand-error">
          {searchParams.error}
        </p>
      ) : null}
      {searchParams.sent ? (
        <p className="mb-4 rounded-component bg-green-50 p-3 text-sm text-brand-success">
          Reset email sent. Check your inbox.
        </p>
      ) : null}

      <form action={recoverPasswordAction} className="grid gap-4">
        <Field label="Email">
          <TextInput name="email" type="email" autoComplete="email" required />
        </Field>
        <Button type="submit">Send reset link</Button>
      </form>

      <Link className="mt-5 inline-block text-sm font-semibold text-brand-primary" href="/login">
        Back to login
      </Link>
    </Card>
  );
}
