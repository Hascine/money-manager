"use client";

import { useState, useTransition } from "react";
import { Sparkles, Users, CirclePlus, ArrowLeftRight, PartyPopper } from "lucide-react";
import { useTranslations } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function OnboardingCarousel({ action }: { action: () => Promise<void> }) {
  const t = useTranslations();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();

  const slides = [
    { icon: Sparkles, title: t.onboarding1Title, desc: t.onboarding1Desc },
    { icon: Users, title: t.onboarding2Title, desc: t.onboarding2Desc },
    { icon: CirclePlus, title: t.onboarding3Title, desc: t.onboarding3Desc },
    { icon: ArrowLeftRight, title: t.onboarding4Title, desc: t.onboarding4Desc },
    { icon: PartyPopper, title: t.onboarding5Title, desc: t.onboarding5Desc },
  ];

  const isLast = step === slides.length - 1;
  const current = slides[step];
  const Icon = current.icon;

  function finish() {
    startTransition(() => {
      action();
    });
  }

  return (
    <div className="flex flex-1 flex-col justify-between px-6 py-10">
      {!isLast && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={finish}
            className="text-base font-medium text-foreground-muted"
          >
            {t.onboardingSkip}
          </button>
        </div>
      )}

      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl brand-gradient text-white shadow-lg shadow-teal-900/15">
          <Icon size={44} strokeWidth={1.75} />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground">{current.title}</h1>
          <p className="max-w-sm text-lg text-foreground-muted">{current.desc}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-2 rounded-full transition-all",
                i === step ? "w-6 bg-brand-from" : "w-2 bg-surface-muted"
              )}
            />
          ))}
        </div>
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="secondary" size="lg" className="flex-1" onClick={() => setStep((s) => s - 1)}>
              {t.onboardingBack}
            </Button>
          )}
          {isLast ? (
            <Button size="lg" className="flex-1" onClick={finish} disabled={pending}>
              {t.onboardingStart}
            </Button>
          ) : (
            <Button size="lg" className="flex-1" onClick={() => setStep((s) => s + 1)}>
              {t.onboardingNext}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
