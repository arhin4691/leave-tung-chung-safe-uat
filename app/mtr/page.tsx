import MTRRoutes from "@/shared/components/mtr/MTRRoutes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "東涌出行 - 地鐵路線",
  description: "Welcome to Leave Tung Chung Safe App - Railway",
};

export default function MTRPage() {
  return <MTRRoutes />;
}