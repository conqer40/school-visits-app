"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { generatePassword } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) return { error: "يرجى إدخال اسم المستخدم وكلمة المرور" };

  try {
    const user = await (prisma as any).user.findUnique({ where: { username } });
    
    if (!user || user.password !== password) {
      return { error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
    }

    const cookieStore = await cookies();
    cookieStore.set("session", JSON.stringify({ userId: user.id, role: user.role }), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    if (user.role === "ADMIN") {
      redirect("/dashboard");
    } else {
      redirect("/my-schedule");
    }
  } catch (error: any) {
    if (error.message?.includes("NEXT_REDIRECT")) throw error;
    return { error: "حدث خطأ أثناء تسجيل الدخول" };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  revalidatePath("/");
  redirect("/login");
}

export async function createAdminIfNotExists() {
  const newAdminUser = "01224800784";
  const newAdminPass = "01224800784Mm#";

  const admin = await (prisma as any).user.findUnique({ where: { username: newAdminUser } });
  if (!admin) {
    // Delete old generic admin if exists
    await (prisma as any).user.deleteMany({ where: { username: "admin" } });
    
    await (prisma as any).user.create({
      data: {
        username: newAdminUser,
        password: newAdminPass,
        role: "ADMIN",
      },
    });
  }
}

export async function sendAllCredentialsAction() {
  const supervisors = await (prisma as any).supervisor.findMany({
    where: { isActive: true, phone: { not: null } },
    include: { user: true },
  });

  const results: any[] = [];

  for (const sup of supervisors) {
    let user = sup.user;
    if (!user) {
      const password = generatePassword();
      const username = `sup_${sup.id}`;
      user = await (prisma as any).user.create({
        data: {
          username,
          password,
          role: "SUPERVISOR",
          supervisorId: sup.id,
        },
      });
    }

    if (sup.phone) {
      const phone = sup.phone.replace(/^0/, "20");
      const msg = `السلام عليكم أ/${sup.name}
بيانات دخولك لنظام الزيارات:
👤 اسم المستخدم: ${user.username}
🔑 كلمة المرور: ${user.password}
🔗 رابط الدخول: https://visits.example.com/login`;

      results.push({
        name: sup.name,
        phone: sup.phone,
        username: user.username,
        password: user.password,
        waLink: `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
      });
    }
  }

  await (prisma as any).log.create({
    data: { action: "SEND_CREDENTIALS", details: `تم توليد بيانات دخول لـ ${results.length} موجه` },
  });

  revalidatePath("/supervisors");
  return results;
}
