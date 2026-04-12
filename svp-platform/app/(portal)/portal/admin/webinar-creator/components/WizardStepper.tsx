"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface WizardStep {
  id: number;
  title: string;
  description?: string;
}

interface WizardStepperProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  completedSteps?: number[];
}

export function WizardStepper({
  steps,
  currentStep,
  onStepClick,
  completedSteps = [],
}: WizardStepperProps) {
  return (
    <nav aria-label="Progress" className="w-full px-4">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isClickable = onStepClick && (isCompleted || step.id <= Math.max(...completedSteps, currentStep));
          const isLastStep = index === steps.length - 1;

          return (
            <li key={step.id} className={cn("flex items-center", !isLastStep && "flex-1")}>
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center",
                  isClickable ? "cursor-pointer" : "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors z-10",
                    isCompleted
                      ? "bg-primary text-white"
                      : isCurrent
                      ? "bg-primary text-white ring-4 ring-primary/20"
                      : "bg-gray-200 text-gray-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </span>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center whitespace-nowrap",
                    isCurrent ? "text-primary" : "text-gray-500"
                  )}
                >
                  {step.title}
                </span>
              </button>
              {!isLastStep && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2",
                    isCompleted ? "bg-primary" : "bg-gray-200"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: "Basic Info", description: "Title, URL, and event details" },
  { id: 2, title: "Landing Page", description: "Hero, benefits, and content" },
  { id: 3, title: "Confirmation", description: "Deliverables and pricing" },
  { id: 4, title: "Integration", description: "GoHighLevel setup" },
  { id: 5, title: "Preview", description: "Review and publish" },
];
