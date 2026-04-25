# Storybook

Component'leri izole görüntülemek + dokümante etmek için Storybook config.

## Çalıştırma

```bash
cd frontend
npm install   # Storybook ilk kurulumda devDependencies'ı çeker
npm run storybook
```

`http://localhost:6006` üzerinde açılır.

## Statik build

```bash
npm run build-storybook
```

`storybook-static/` klasörüne deploy edilebilir bir build çıkarır (Vercel, GitHub Pages vs.).

## Story yazımı

Component'in yanına `*.stories.tsx` koy:

```tsx
// components/Button/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";

const meta = { component: Button, tags: ["autodocs"] } satisfies Meta<typeof Button>;
export default meta;

export const Default: StoryObj<typeof meta> = {
  args: { children: "Click me" },
};
```

## Compat notu

Bu starter Next.js 16'yı kullanıyor. Storybook 8.x Next.js 14/15 ile test edilmiş. Next.js 16'da uyumluluk sorunu çıkarsa Storybook 9 RC'ye yükseltmek gerekebilir; o zamana kadar `@storybook/nextjs` 8.x ile sorun yaşıyorsan webpack uyarılarını yorumla geçici çözümler dene.
