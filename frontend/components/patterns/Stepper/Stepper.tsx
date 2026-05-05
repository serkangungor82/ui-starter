"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepperStep = {
  id: string;
  label: string;
  description?: string;
};

export type StepperProps = {
  steps: StepperStep[];
  /** Şu anki aktif step (0-based) */
  activeStep: number;
  /** Step click edilebilir mi (geçmiş step'lere geri dönüş için) */
  onStepClick?: (index: number) => void;
  /** Yön (default: horizontal) */
  orientation?: "horizontal" | "vertical";
  className?: string;
};

/**
 * Multi-step form / wizard için step indicator.
 * Caller activeStep'i kontrol eder.
 *
 * Örnek:
 * ```tsx
 * const steps = [
 *   { id: "info", label: "Bilgi" },
 *   { id: "verify", label: "Doğrulama" },
 *   { id: "done", label: "Tamamlandı" },
 * ];
 * <Stepper steps={steps} activeStep={current} />
 * ```
 */
export default function Stepper({
  steps,
  activeStep,
  onStepClick,
  orientation = "horizontal",
  className,
}: StepperProps) {
  const isVertical = orientation === "vertical";
  return (
    <ol
      className={cn(
        "flex",
        isVertical ? "flex-col gap-4" : "items-start justify-between gap-2",
        className
      )}
    >
      {steps.map((step, index) => {
        const isActive = index === activeStep;
        const isComplete = index < activeStep;
        const isClickable = !!onStepClick && index <= activeStep;

        return (
          <li
            key={step.id}
            className={cn(
              "flex gap-3",
              isVertical ? "items-start" : "flex-1 items-center",
              !isVertical && index < steps.length - 1 && "after:mx-3 after:h-px after:flex-1 after:bg-border"
            )}
          >
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(index)}
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  isActive && "border-primary bg-primary text-primary-foreground",
                  isComplete &&
                    "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
                  !isActive &&
                    !isComplete &&
                    "border-border bg-background text-muted-foreground",
                  isClickable && "cursor-pointer",
                  !isClickable && "cursor-default"
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {isComplete ? <Check className="size-4" /> : index + 1}
              </button>
              {isVertical && index < steps.length - 1 && (
                <span
                  className={cn(
                    "h-full w-px",
                    isComplete ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
            <div className={cn("flex-1", isVertical ? "pb-4" : "min-w-0")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  isActive || isComplete ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {step.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
