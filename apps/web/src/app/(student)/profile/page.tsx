import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, SelectInput, TextInput } from "@/components/ui/input";

export default function ProfilePage() {
  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm font-semibold text-brand-accent">Profile</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-text">Your learning settings</h1>
        <p className="mt-2 text-brand-muted">Base language and account details live here.</p>
      </section>

      <Card className="max-w-2xl">
        <form className="grid gap-4">
          <Field label="Name">
            <TextInput name="name" defaultValue="Henrique" />
          </Field>
          <Field label="Email">
            <TextInput name="email" type="email" defaultValue="henrique@example.com" />
          </Field>
          <Field label="Base language">
            <SelectInput name="baseLanguage" defaultValue="pt">
              <option value="pt">Portuguese</option>
              <option value="en">English</option>
            </SelectInput>
          </Field>
          <Field label="Current level">
            <TextInput name="currentLevel" defaultValue="A0" disabled />
          </Field>
          <Button type="button" className="w-full sm:w-fit">
            Save changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
