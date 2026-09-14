import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to delete a comment." },
        { status: 401 }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true, showcaseId: true },
    });

    if (!comment || comment.showcaseId !== id) {
      return NextResponse.json(
        { error: "Comment not found." },
        { status: 404 }
      );
    }

    if (comment.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own comments." },
        { status: 403 }
      );
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting showcase comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment." },
      { status: 500 }
    );
  }
}
