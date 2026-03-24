import { getSession } from "@/lib/auth";
import SidebarClient from "./SidebarClient";
import { prisma } from "@/lib/prisma";

export default async function Sidebar() {
  const user = await getSession();
  if (!user) return null;

  const isAdmin = user.role === "ADMIN";
  const settings = await (prisma as any).systemSetting.findUnique({ where: { id: 1 } });

  return <SidebarClient user={user} isAdmin={isAdmin} settings={settings} />;
}

