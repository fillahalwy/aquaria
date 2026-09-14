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

    if (!content || typeof content !== "string" || content.trim().length < 2) {
      return NextResponse.json(
        { error: "Comment cannot be empty." },
        { status: 400 }
      );
    }

    // Verify showcase exists
    const showcase = await prisma.showcasePost.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!showcase) {
      return NextResponse.json(
        { error: "Showcase tank not found." },
        { status: 404 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        showcaseId: id,
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
        comment: {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          author: {
            id: comment.user.id,
            name: comment.user.name || comment.user.username,
            username: comment.user.username,
            image: comment.user.image,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating showcase comment:", error);
    return NextResponse.json(
      { error: "Failed to post comment." },
      { status: 500 }
    );
  }
}
