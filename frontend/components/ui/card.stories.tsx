import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Button } from "./button";
import { Badge } from "./badge";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Aylık özet</CardTitle>
        <CardDescription>Mayıs ayında 12 yeni proje oluşturuldu.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Geçen aya göre %23 artış. Detayları dashboard&apos;da inceleyebilirsin.
        </p>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="outline" size="sm">Detaylar</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Plan</CardTitle>
        <CardDescription>Pro tier — 24 ay aktif</CardDescription>
        <CardAction>
          <Badge variant="secondary">Aktif</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Sınırsız proje, öncelikli destek dahil.
      </CardContent>
    </Card>
  ),
};
