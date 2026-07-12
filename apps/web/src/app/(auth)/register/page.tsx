import Link from "next/link";
import { registerAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, SelectInput, TextInput } from "@/components/ui/input";

export default function RegisterPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <Card className="w-full max-w-md p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold text-brand-accent">NederStart</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-text">Create account</h1>
        <p className="mt-2 text-sm text-brand-muted">Start with Portuguese or English support.</p>
      </div>

      {searchParams.error ? (
        <p className="mb-4 rounded-component bg-red-50 p-3 text-sm text-brand-error">
          {searchParams.error}
        </p>
      ) : null}

      <form action={registerAction} className="grid gap-4">
        <Field label="Name">
          <TextInput name="name" autoComplete="name" required />
        </Field>
        <Field label="Email">
          <TextInput name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Base language">
          <SelectInput name="baseLanguage" defaultValue="pt">
            <option value="pt">Portuguese</option>
            <option value="en">English</option>
          </SelectInput>
        </Field>
        <Field label="Password">
          <TextInput name="password" type="password" autoComplete="new-password" required minLength={8} />
        </Field>
        <Button type="submit">Create account</Button>
      </form>

      <p className="mt-5 text-sm text-brand-muted">
        Already have an account?{" "}
        <Link className="font-semibold text-brand-primary" href="/login">
          Log in
        </Link>
      </p>
    </Card>
  );
}
