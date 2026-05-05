import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Badge } from "./badge";

const meta: Meta<typeof Table> = {
  title: "UI/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  render: () => (
    <div className="w-[600px] rounded-lg border border-border">
      <Table>
        <TableCaption>Son siparişlerin durumu.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Sipariş</TableHead>
            <TableHead>Tarih</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className="text-right">Tutar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">#A-1029</TableCell>
            <TableCell>2026-05-04</TableCell>
            <TableCell><Badge>Tamamlandı</Badge></TableCell>
            <TableCell className="text-right">₺1.420,00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">#A-1030</TableCell>
            <TableCell>2026-05-04</TableCell>
            <TableCell><Badge variant="secondary">Hazırlanıyor</Badge></TableCell>
            <TableCell className="text-right">₺780,50</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">#A-1031</TableCell>
            <TableCell>2026-05-05</TableCell>
            <TableCell><Badge variant="destructive">İptal</Badge></TableCell>
            <TableCell className="text-right">₺0,00</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};
