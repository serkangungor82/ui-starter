import type { Meta, StoryObj } from "@storybook/react";
import KvkkModal from "./KvkkModal";

const SAMPLE_AYDINLATMA = `Şirketinizin İsmi ("Veri Sorumlusu") olarak 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun (KVKK) 10. maddesi kapsamında kişisel verilerinizin işlenmesine ilişkin sizi bilgilendirmek isteriz.

İŞLENEN KİŞİSEL VERİLER
Ad-soyad, e-posta adresi, telefon numarası, IP adresi, kullanım ve işlem verileri.

İŞLENME AMAÇLARI
Hizmet sunumu ve kullanıcı hesabı yönetimi; kimlik doğrulama ve güvenlik; iletişim; faturalandırma ve ödeme işlemleri; yasal yükümlülüklerin yerine getirilmesi.

HUKUKİ DAYANAK
Sözleşmenin kurulması ve ifası (m.5/2-c), meşru menfaat (m.5/2-f), yasal yükümlülük (m.5/2-ç) ve açık rıza (m.5/1).

VERİ SAKLAMA SÜRESİ
Üyelik süresince ve sonrasında ilgili mevzuat kapsamında belirlenen süreler boyunca saklanır.

HAKLARINIZ
KVKK'nın 11. maddesi uyarınca; verilerinize erişim, düzeltilmesini ve silinmesini talep etme, işlemenin kısıtlanmasını isteme ve itiraz etme haklarına sahipsiniz.`;

const meta = {
  title: "Patterns/KvkkModal",
  component: KvkkModal,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof KvkkModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    phone: "+90 555 123 45 67",
    aydinlatmaMetni: SAMPLE_AYDINLATMA,
    onSendSms: async () => {
      await new Promise((r) => setTimeout(r, 600));
    },
    onVerify: async (code) => {
      await new Promise((r) => setTimeout(r, 600));
      if (code !== "123456") throw new Error("Kod hatalı");
    },
    onDecline: async () => {
      await new Promise((r) => setTimeout(r, 400));
    },
    onAccepted: () => alert("Onay alındı"),
    onDeclined: () => alert("Reddedildi"),
  },
};

export const NoPhone: Story = {
  args: {
    ...Default.args!,
    phone: null,
  },
};
