import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return NextResponse.json({ error: "يرجى إدخال اسم المستخدم وكلمة المرور" }, { status: 400 });
    }

    const user = await (prisma as any).user.findUnique({ where: { username } });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set("session", JSON.stringify({ userId: user.id, role: user.role }), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    const redirectTo = user.role === "ADMIN" ? "/dashboard" : "/my-schedule";

    return NextResponse.json({ success: true, redirect: redirectTo });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء تسجيل الدخول" }, { status: 500 });
  }
}
