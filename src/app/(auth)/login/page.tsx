import Link from "next/link";
import { login } from "../actions";
import { getDictionary } from "@/lib/i18n/get-language";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/logo";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const { error, redirect: redirectTo } = await searchParams;
  const t = await getDictionary();
  const signupHref = redirectTo ? `/signup?redirect=${encodeURIComponent(redirectTo)}` : "/signup";

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <LogoMark className="h-10 w-10" />
          <h1 className="text-xl font-bold text-foreground">{t.loginTitle}</h1>
        </div>
        <form action={login} className="flex flex-col gap-4">
          <input type="hidden" name="redirectTo" value={redirectTo ?? "/app"} />
          {error && (
            <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
              {error}
            </p>
          )}
          <Field label={t.fieldEmail}>
            <Input name="email" type="email" required placeholder="nama@email.com" />
          </Field>
          <Field label={t.fieldPassword}>
            <Input name="password" type="password" required placeholder="••••••••" />
          </Field>
          <Button type="submit" size="lg" className="mt-2 w-full">
            {t.loginSubmit}
          </Button>
          <p className="text-center text-base text-foreground-muted">
            {t.loginNoAccount}{" "}
            <Link href={signupHref} className="font-semibold text-foreground underline underline-offset-4">
              {t.loginSignupLink}
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
