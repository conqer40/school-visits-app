"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Send a message to a specialization chat
 */
export async function sendChatMessageAction(formData: FormData) {
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");

  const content = formData.get("content")?.toString();
  const specializationId = parseInt(formData.get("specializationId")?.toString() || "0");

  if (!content || !specializationId) return;

  // Verify the supervisor is not banned (Skip for Admins)
  if (user.role === "SUPERVISOR") {
    const supervisor = await (prisma as any).supervisor.findUnique({
      where: { id: user.supervisorId }
    });

    if (!supervisor || supervisor.isBannedFromChat) {
      throw new Error("You are banned from participating in the chat.");
    }

    // Verify they belong to this specialization
    if (supervisor.specializationId !== specializationId) {
      throw new Error("You can only chat in your own specialization.");
    }
  }

  await (prisma as any).chatMessage.create({
    data: {
      content,
      specializationId,
      authorId: user.role === "ADMIN" ? null : user.supervisorId,
    }
  });

  revalidatePath("/chat");
}

/**
 * Delete a chat message (Admin or Author)
 */
export async function deleteChatMessageAction(messageId: number) {
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");

  const message = await (prisma as any).chatMessage.findUnique({ where: { id: messageId } });
  if (!message) return;

  if (user.role === "ADMIN" || message.authorId === user.supervisorId) {
    await (prisma as any).chatMessage.delete({ where: { id: messageId } });
    revalidatePath("/chat");
  }
}

/**
 * Toggle Ban Status (Admin Only)
 */
export async function toggleChatBanAction(supervisorId: number) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  const supervisor = await (prisma as any).supervisor.findUnique({ where: { id: supervisorId } });
  if (supervisor) {
    await (prisma as any).supervisor.update({
      where: { id: supervisorId },
      data: { isBannedFromChat: !supervisor.isBannedFromChat }
    });
    revalidatePath("/supervisors");
    revalidatePath("/chat");
  }
}

/**
 * Fetch Chat Messages (for client polling)
 */
export async function getChatMessagesAction(specializationId: number) {
  const user = await getSession();
  if (!user) return [];

  const rawMessages = await (prisma as any).chatMessage.findMany({
    where: { specializationId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      author: {
        select: { id: true, name: true, region: true, isBannedFromChat: true }
      }
    }
  });

  const messages = rawMessages.map((m: any) => ({
    ...m,
    author: m.author || { name: "مدير النظام", region: "الإدارة" }
  }));

  return JSON.parse(JSON.stringify(messages.reverse()));
}
