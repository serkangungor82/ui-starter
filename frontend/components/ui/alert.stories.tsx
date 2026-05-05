import type { Meta, StoryObj } from "@storybook/nextjs";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

const meta: Meta<typeof Alert> = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: () => (
    <Alert>
      <Info className="size-4" />
      <AlertTitle>Bilgi</AlertTitle>
      <AlertDescription>İşlem başarıyla tamamlandı, ekstra bir aksiyon gerekmiyor.</AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <XCircle className="size-4" />
      <AlertTitle>Hata</AlertTitle>
      <AlertDescription>İstek alınamadı. Lütfen tekrar deneyin.</AlertDescription>
    </Alert>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert>
        <CheckCircle2 className="size-4" />
        <AlertTitle>Başarılı</AlertTitle>
        <AlertDescription>Değişiklikler kaydedildi.</AlertDescription>
      </Alert>
      <Alert>
        <AlertTriangle className="size-4" />
        <AlertTitle>Uyarı</AlertTitle>
        <AlertDescription>Disk alanın %85 dolu — yakında temizlik gerekebilir.</AlertDescription>
      </Alert>
    </div>
  ),
};
