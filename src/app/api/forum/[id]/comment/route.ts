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
        { error: "You must be signed in to post a comment." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment cannot be empty." },
        { status: 400 }
      );
    }

    const thread = await prisma.forumThread.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!thread) {
      return NextResponse.json(
        { error: "Post not found." },
        { status: 404 }
      );
    }

    const newAnswer = await prisma.forumAnswer.create({
      data: {
        content: content.trim(),
        threadId: id,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Comment posted.",
        comment: {
          id: newAnswer.id,
          content: newAnswer.content,
          isAccepted: newAnswer.isAccepted,
          upvotesCount: newAnswer.upvotesCount,
          createdAt: newAnswer.createdAt,
          updatedAt: newAnswer.updatedAt,
          author: {
            id: newAnswer.user.id,
            name: newAnswer.user.name || newAnswer.user.username,
            username: newAnswer.user.username,
            image: newAnswer.user.image,
          },
          hasUpvoted: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to post comment." },
      { status: 500 }
    );
  }
}
