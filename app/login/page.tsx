import { prisma } from "@/lib/prisma";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const settings = await (prisma as any).systemSetting.findUnique({ where: { id: 1 } });

  return <LoginForm settings={settings} />;
}
