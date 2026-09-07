import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const currentUserId = session?.user?.id;

    const thread = await prisma.forumThread.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        answers: {
          orderBy: { createdAt: "asc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
            votes: currentUserId
              ? {
                  where: { userId: currentUserId },
                  select: { id: true, type: true },
                }
              : false,
          },
        },
        votes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true, type: true },
            }
          : false,
      },
    });

    if (!thread) {
      return NextResponse.json(
        { error: "Post not found." },
        { status: 404 }
      );
    }

    const hasUpvoted = currentUserId && Array.isArray(thread.votes) && thread.votes.length > 0;

    const formattedAnswers = thread.answers.map((ans) => ({
      id: ans.id,
      content: ans.content,
      isAccepted: ans.isAccepted,
      upvotesCount: ans.upvotesCount,
      createdAt: ans.createdAt,
      updatedAt: ans.updatedAt,
      author: {
        id: ans.user.id,
        name: ans.user.name || ans.user.username,
        username: ans.user.username,
        image: ans.user.image,
      },
      hasUpvoted: currentUserId && Array.isArray(ans.votes) && ans.votes.length > 0,
    }));

    return NextResponse.json({
      success: true,
      thread: {
        id: thread.id,
        title: thread.title,
        content: thread.content,
        tag: thread.tag,
        mediaUrl: thread.mediaUrl,
        mediaType: thread.mediaType,
        upvotesCount: thread.upvotesCount,
        isSolved: thread.isSolved,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        author: {
          id: thread.user.id,
          name: thread.user.name || thread.user.username,
          username: thread.user.username,
          image: thread.user.image,
        },
        commentsCount: thread.answers.length,
        hasUpvoted: !!hasUpvoted,
        comments: formattedAnswers,
      },
    });
  } catch (error) {
    console.error("Error fetching single forum thread:", error);
    return NextResponse.json(
      { error: "Failed to load post details." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to edit a post." },
        { status: 401 }
      );
    }

    const existingThread = await prisma.forumThread.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingThread) {
      return NextResponse.json(
        { error: "Post not found." },
        { status: 404 }
      );
    }

    if (existingThread.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to edit this post." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, content, tag, mediaUrl, mediaType } = body;

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json(
        { error: "Title must be at least 3 characters long." },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim().length < 5) {
      return NextResponse.json(
        { error: "Content must be at least 5 characters long." },
        { status: 400 }
      );
    }

    let detectedMediaType: string | null = null;
    let cleanMediaUrl: string | null = null;

    if (mediaUrl && typeof mediaUrl === "string" && mediaUrl.trim().length > 0) {
      cleanMediaUrl = mediaUrl.trim();
      if (mediaType && (mediaType === "image" || mediaType === "video")) {
        detectedMediaType = mediaType;
      } else {
        const isVideo = /\.(mp4|webm|ogg|mov|m4v)$/i.test(cleanMediaUrl) || cleanMediaUrl.includes("youtube.com") || cleanMediaUrl.includes("youtu.be");
        detectedMediaType = isVideo ? "video" : "image";
      }
    }

    const updatedThread = await prisma.forumThread.update({
      where: { id },
      data: {
        title: title.trim(),
        content: content.trim(),
        tag: tag && typeof tag === "string" && tag.trim().length > 0 ? tag.trim() : "General",
        mediaUrl: cleanMediaUrl,
        mediaType: detectedMediaType,
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
        _count: {
          select: {
            answers: true,
            votes: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Post updated successfully.",
      thread: {
        id: updatedThread.id,
        title: updatedThread.title,
        content: updatedThread.content,
        tag: updatedThread.tag,
        mediaUrl: updatedThread.mediaUrl,
        mediaType: updatedThread.mediaType,
        upvotesCount: updatedThread.upvotesCount,
        isSolved: updatedThread.isSolved,
        createdAt: updatedThread.createdAt,
        updatedAt: updatedThread.updatedAt,
        author: {
          id: updatedThread.user.id,
          name: updatedThread.user.name || updatedThread.user.username,
          username: updatedThread.user.username,
          image: updatedThread.user.image,
        },
        commentsCount: updatedThread._count.answers,
        hasUpvoted: false,
      },
    });
  } catch (error: unknown) {
    console.error("Error updating forum thread:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update post.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to delete a post." },
        { status: 401 }
      );
    }

    const existingThread = await prisma.forumThread.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingThread) {
      return NextResponse.json(
        { error: "Post not found." },
        { status: 404 }
      );
    }

    if (existingThread.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to delete this post." },
        { status: 403 }
      );
    }

    await prisma.forumThread.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully.",
    });
  } catch (error: unknown) {
    console.error("Error deleting forum thread:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete post.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
