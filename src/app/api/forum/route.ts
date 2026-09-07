import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "latest"; // "latest" | "top"

    // Construct filter
    const where: Record<string, unknown> = {};

    if (tag && tag.toLowerCase() !== "all") {
      where.tag = {
        equals: tag,
        mode: "insensitive",
      };
    }

    if (search && search.trim().length > 0) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { content: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    // Determine order
    const orderBy = sort === "top" ? { upvotesCount: "desc" as const } : { createdAt: "desc" as const };

    const threads = await prisma.forumThread.findMany({
      where,
      orderBy,
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
        votes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true, type: true },
            }
          : false,
      },
    });

    const formattedThreads = threads.map((thread) => {
      const hasUpvoted = currentUserId && Array.isArray(thread.votes) && thread.votes.length > 0;
      return {
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
        commentsCount: thread._count.answers,
        hasUpvoted: !!hasUpvoted,
      };
    });

    return NextResponse.json({ success: true, threads: formattedThreads });
  } catch (error) {
    console.error("Error fetching forum threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch community posts." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to create a post." },
        { status: 401 }
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

    const newThread = await prisma.forumThread.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        tag: tag && typeof tag === "string" && tag.trim().length > 0 ? tag.trim() : "General",
        mediaUrl: cleanMediaUrl,
        mediaType: detectedMediaType,
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
        _count: {
          select: {
            answers: true,
            votes: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Post created successfully.",
        thread: {
          id: newThread.id,
          title: newThread.title,
          content: newThread.content,
          tag: newThread.tag,
          mediaUrl: newThread.mediaUrl,
          mediaType: newThread.mediaType,
          upvotesCount: newThread.upvotesCount,
          isSolved: newThread.isSolved,
          createdAt: newThread.createdAt,
          updatedAt: newThread.updatedAt,
          author: {
            id: newThread.user.id,
            name: newThread.user.name || newThread.user.username,
            username: newThread.user.username,
            image: newThread.user.image,
          },
          commentsCount: 0,
          hasUpvoted: false,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating forum thread:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred while creating your post.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
