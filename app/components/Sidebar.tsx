import { getSession } from "@/lib/auth";
import SidebarClient from "./SidebarClient";

export default async function Sidebar() {
  const user = await getSession();
  if (!user) return null;

  const isAdmin = user.role === "ADMIN";

  return <SidebarClient user={user} isAdmin={isAdmin} />;
}

