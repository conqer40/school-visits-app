import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) return null;

  try {
    const data = JSON.parse(sessionCookie.value);
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: { supervisor: true },
    });
    return user;
  } catch {
    return null;
  }
}

export function generatePassword(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function egyptDate(date?: Date): string {
  const d = date || new Date();
  return d.toLocaleDateString("ar-EG", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

export function egyptTime(date?: Date): string {
  const d = date || new Date();
  return d.toLocaleTimeString("ar-EG", {
    timeZone: "Africa/Cairo",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function egyptDateTime(date?: Date): string {
  return `${egyptDate(date)} — ${egyptTime(date)}`;
}
