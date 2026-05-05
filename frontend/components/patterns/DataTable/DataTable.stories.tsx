import type { Meta, StoryObj } from "@storybook/nextjs";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "./DataTable";
import { Badge } from "@/components/ui/badge";

type User = {
  id: number;
  name: string;
  email: string;
  status: "active" | "invited" | "suspended";
  joinedAt: string;
};

const SAMPLE: User[] = [
  { id: 1, name: "Serkan Güngör", email: "serkan@example.com", status: "active", joinedAt: "2025-01-12" },
  { id: 2, name: "Ayşe Yılmaz", email: "ayse@example.com", status: "invited", joinedAt: "2025-03-04" },
  { id: 3, name: "Mehmet Demir", email: "mehmet@example.com", status: "active", joinedAt: "2024-11-20" },
  { id: 4, name: "Zeynep Kaya", email: "zeynep@example.com", status: "suspended", joinedAt: "2024-08-15" },
  { id: 5, name: "Can Öztürk", email: "can@example.com", status: "active", joinedAt: "2025-02-28" },
  { id: 6, name: "Elif Çelik", email: "elif@example.com", status: "active", joinedAt: "2025-04-11" },
  { id: 7, name: "Burak Arslan", email: "burak@example.com", status: "invited", joinedAt: "2025-05-01" },
  { id: 8, name: "Selin Doğan", email: "selin@example.com", status: "active", joinedAt: "2024-12-19" },
  { id: 9, name: "Ali Şahin", email: "ali@example.com", status: "suspended", joinedAt: "2024-07-08" },
  { id: 10, name: "Deniz Akın", email: "deniz@example.com", status: "active", joinedAt: "2025-01-30" },
  { id: 11, name: "Eda Tan", email: "eda@example.com", status: "active", joinedAt: "2025-02-15" },
  { id: 12, name: "Kerem Yıldız", email: "kerem@example.com", status: "invited", joinedAt: "2025-04-22" },
];

const columns: ColumnDef<User>[] = [
  { accessorKey: "name", header: "Ad" },
  { accessorKey: "email", header: "E-posta" },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => {
      const status = row.getValue<User["status"]>("status");
      const variant = status === "active" ? "default" : status === "invited" ? "secondary" : "destructive";
      const label = { active: "Aktif", invited: "Davet edildi", suspended: "Askıda" }[status];
      return <Badge variant={variant}>{label}</Badge>;
    },
  },
  { accessorKey: "joinedAt", header: "Katılım" },
];

const meta = {
  title: "Patterns/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof DataTable<User, unknown>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    columns: columns as never,
    data: SAMPLE,
    filterColumnId: "name",
    filterPlaceholder: "İsme göre filtrele...",
    pageSize: 5,
    className: "w-[640px]",
  },
};

export const Empty: Story = {
  args: {
    columns: columns as never,
    data: [] as User[],
    className: "w-[640px]",
  },
};
