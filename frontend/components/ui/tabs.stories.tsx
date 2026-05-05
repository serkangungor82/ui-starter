import type { Meta, StoryObj } from "@storybook/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-96">
      <TabsList>
        <TabsTrigger value="overview">Özet</TabsTrigger>
        <TabsTrigger value="activity">Aktivite</TabsTrigger>
        <TabsTrigger value="settings">Ayarlar</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="text-sm text-muted-foreground p-3">
        Hesabının genel görünümü ve son etkinlikler.
      </TabsContent>
      <TabsContent value="activity" className="text-sm text-muted-foreground p-3">
        Son 30 günün etkinlik listesi.
      </TabsContent>
      <TabsContent value="settings" className="text-sm text-muted-foreground p-3">
        Tercihler, gizlilik ve hesap silme.
      </TabsContent>
    </Tabs>
  ),
};
