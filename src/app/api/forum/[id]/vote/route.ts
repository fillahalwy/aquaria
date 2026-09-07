import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to upvote." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if thread exists
    const thread = await prisma.forumThread.findUnique({
      where: { id },
      select: { id: true, upvotesCount: true },
    });

    if (!thread) {
      return NextResponse.json(
        { error: "Post not found." },
        { status: 404 }
      );
    }

    // Check existing vote
    const existingVote = await prisma.threadVote.findUnique({
      where: {
        userId_threadId: {
          userId,
          threadId: id,
        },
      },
    });

    let newUpvotesCount = thread.upvotesCount;
    let hasUpvoted = false;

    if (existingVote) {
      // Toggle off / remove vote
      await prisma.$transaction([
        prisma.threadVote.delete({
          where: { id: existingVote.id },
        }),
        prisma.forumThread.update({
          where: { id },
          data: {
            upvotesCount: {
              decrement: 1,
            },
          },
        }),
      ]);
      newUpvotesCount = Math.max(0, thread.upvotesCount - 1);
      hasUpvoted = false;
    } else {
      // Create new upvote
      await prisma.$transaction([
        prisma.threadVote.create({
          data: {
            userId,
            threadId: id,
            type: 1,
          },
        }),
        prisma.forumThread.update({
          where: { id },
          data: {
            upvotesCount: {
              increment: 1,
            },
          },
        }),
      ]);
      newUpvotesCount = thread.upvotesCount + 1;
      hasUpvoted = true;
    }

    return NextResponse.json({
      success: true,
      upvotesCount: newUpvotesCount,
      hasUpvoted,
    });
  } catch (error) {
    console.error("Error processing thread upvote:", error);
    return NextResponse.json(
      { error: "Failed to process upvote." },
      { status: 500 }
    );
  }
}
