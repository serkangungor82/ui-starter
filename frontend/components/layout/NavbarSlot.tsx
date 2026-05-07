"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

export default function NavbarSlot() {
  const pathname = usePathname();
  if (!pathname) return null;
  if (/\/(dashboard|admin|auth|signup)(\/|$)/.test(pathname)) return null;
  return <Navbar />;
}
