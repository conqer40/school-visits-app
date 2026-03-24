"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createPostAction(formData: FormData) {
  const user = await getSession();
  if (!user) return;
  if (user.role !== "ADMIN" && (user.role !== "SUPERVISOR" || !user.supervisorId)) return;

  const content = formData.get("content") as string;
  const level = formData.get("level") as string;
  const specializationIdRaw = formData.get("specializationId") as string;

  if (!content || !level || !specializationIdRaw) return;

  try {
    await (prisma as any).post.create({
      data: {
        content,
        level,
        specializationId: parseInt(specializationIdRaw),
        authorId: user.role === "ADMIN" ? null : user.supervisorId,
      }
    });
  } catch (error) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post. Check server logs.");
  }

  revalidatePath("/community");
}

export async function deletePostAction(postId: number) {
  const user = await getSession();
  if (!user) return;

  const post = await (prisma as any).post.findUnique({ where: { id: postId } });
  if (!post) return;

  // Only author or admin can delete
  if (user.role === "ADMIN" || (user.role === "SUPERVISOR" && post.authorId === user.supervisorId)) {
    await (prisma as any).post.delete({ where: { id: postId } });
    revalidatePath("/community");
  }
}

export async function createCommentAction(formData: FormData) {
  const user = await getSession();
  if (!user) return;
  if (user.role !== "ADMIN" && (user.role !== "SUPERVISOR" || !user.supervisorId)) return;

  const content = formData.get("content") as string;
  const postIdRaw = formData.get("postId") as string;

  if (!content || !postIdRaw) return;

  await (prisma as any).comment.create({
    data: {
      content,
      postId: parseInt(postIdRaw),
      authorId: user.role === "ADMIN" ? null : user.supervisorId,
    }
  });

  revalidatePath("/community");
}

export async function deleteCommentAction(commentId: number) {
  const user = await getSession();
  if (!user) return;

  const comment = await (prisma as any).comment.findUnique({ 
    where: { id: commentId },
    include: { post: true } 
  });
  if (!comment) return;

  // Only author, post author, or admin can delete
  if (user.role === "ADMIN" || 
     (user.role === "SUPERVISOR" && (comment.authorId === user.supervisorId || comment.post.authorId === user.supervisorId))) {
    await (prisma as any).comment.delete({ where: { id: commentId } });
    revalidatePath("/community");
  }
}

export async function toggleLikePostAction(postId: number) {
  const user = await getSession();
  if (!user || user.role !== "SUPERVISOR" || !user.supervisorId) return;

  const existingLike = await (prisma as any).like.findUnique({
    where: {
      postId_authorId: {
        postId,
        authorId: user.supervisorId
      }
    }
  });

  if (existingLike) {
    await (prisma as any).like.delete({ where: { id: existingLike.id } });
  } else {
    await (prisma as any).like.create({
      data: {
        postId,
        authorId: user.supervisorId
      }
    });
  }

  revalidatePath("/community");
}
