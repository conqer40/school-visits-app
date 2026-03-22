import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createAdminIfNotExists } from "./login/actions";

const cairo = Cairo({ subsets: ["arabic", "latin"] });

export const metadata: Metadata = {
  title: "نظام الزيارات المدرسية — إدارة غرب الزقازيق التعليمية",
  description: "نظام توزيع الموجهين على الزيارات المدرسية",
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await createAdminIfNotExists();
  const user = await getSession();
  const pathname = typeof window === "undefined" ? "" : "";

  return (
    <html lang="ar" dir="rtl" className={cairo.className}>
      <body>
        {!user ? (
          <>{children}</>
        ) : (
          <div className="app-layout">
            <Sidebar />
            <main className="main-content">{children}</main>
          </div>
        )}
      </body>
    </html>
  );
}
