import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import Stepper from "./Stepper";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Stepper> = {
  title: "Patterns/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Stepper>;

const STEPS = [
  { id: "info", label: "Bilgiler", description: "Kişisel bilgilerini gir" },
  { id: "verify", label: "Doğrulama", description: "Telefon doğrulaması" },
  { id: "plan", label: "Plan seç", description: "Hesabına uygun planı seç" },
  { id: "done", label: "Tamamlandı" },
];

export const Horizontal: Story = {
  render: () => {
    const [step, setStep] = useState(1);
    return (
      <div className="space-y-6 w-[720px]">
        <Stepper steps={STEPS} activeStep={step} onStepClick={setStep} />
        <div className="flex justify-between">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
            Geri
          </Button>
          <Button disabled={step === STEPS.length - 1} onClick={() => setStep(step + 1)}>
            İleri
          </Button>
        </div>
      </div>
    );
  },
};

export const Vertical: Story = {
  render: () => {
    const [step, setStep] = useState(1);
    return (
      <div className="w-80 space-y-4">
        <Stepper steps={STEPS} activeStep={step} onStepClick={setStep} orientation="vertical" />
      </div>
    );
  },
};
