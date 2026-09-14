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

    const post = await prisma.showcasePost.findUnique({
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
        comments: {
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
          },
        },
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Showcase tank not found." },
        { status: 404 }
      );
    }

    const hasLiked = currentUserId && Array.isArray(post.likes) && post.likes.length > 0;

    const formattedComments = post.comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      author: {
        id: c.user.id,
        name: c.user.name || c.user.username,
        username: c.user.username,
        image: c.user.image,
      },
    }));

    return NextResponse.json({
      success: true,
      showcase: {
        id: post.id,
        title: post.title,
        style: post.style || "Nature Aquarium",
        description: post.description,
        imageUrl: post.imageUrl,
        sizeSpan: post.sizeSpan as "normal" | "tall" | "wide",
        dimensions: post.dimensions,
        lighting: post.lighting,
        co2System: post.co2System,
        hardscape: post.hardscape,
        plants: post.plants || [],
        fauna: post.fauna || [],
        likesCount: post.likesCount,
        commentsCount: post.comments.length,
        hasLiked: !!hasLiked,
        createdAt: post.createdAt,
        author: {
          id: post.user.id,
          name: post.user.name || post.user.username,
          username: post.user.username,
          image: post.user.image,
        },
        comments: formattedComments,
      },
    });
  } catch (error) {
    console.error("Error fetching showcase details:", error);
    return NextResponse.json(
      { error: "Failed to fetch showcase details." },
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
        { error: "You must be signed in to edit this post." },
        { status: 401 }
      );
    }

    const existingPost = await prisma.showcasePost.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "Showcase tank not found." },
        { status: 404 }
      );
    }

    if (existingPost.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to edit this showcase." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      style,
      description,
      imageUrl,
      sizeSpan,
      dimensions,
      lighting,
      co2System,
      hardscape,
      plants,
      fauna,
    } = body;

    const cleanPlants: string[] = Array.isArray(plants)
      ? plants.map((p) => String(p).trim()).filter((p) => p.length > 0)
      : [];

    const cleanFauna: string[] = Array.isArray(fauna)
      ? fauna.map((f) => String(f).trim()).filter((f) => f.length > 0)
      : [];

    const validSpan = ["normal", "tall", "wide"].includes(sizeSpan) ? sizeSpan : undefined;

    const updatedPost = await prisma.showcasePost.update({
      where: { id },
      data: {
        ...(title ? { title: title.trim() } : {}),
        ...(style ? { style: style.trim() } : {}),
        description: description !== undefined ? description?.trim() : undefined,
        ...(imageUrl ? { imageUrl: imageUrl.trim() } : {}),
        ...(validSpan ? { sizeSpan: validSpan } : {}),
        ...(dimensions ? { dimensions: dimensions.trim() } : {}),
        lighting: lighting !== undefined ? lighting?.trim() : undefined,
        co2System: co2System !== undefined ? co2System?.trim() : undefined,
        hardscape: hardscape !== undefined ? hardscape?.trim() : undefined,
        plants: cleanPlants,
        fauna: cleanFauna,
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
            comments: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Showcase updated successfully.",
      showcase: {
        id: updatedPost.id,
        title: updatedPost.title,
        style: updatedPost.style || "Nature Aquarium",
        description: updatedPost.description,
        imageUrl: updatedPost.imageUrl,
        sizeSpan: updatedPost.sizeSpan as "normal" | "tall" | "wide",
        dimensions: updatedPost.dimensions,
        lighting: updatedPost.lighting,
        co2System: updatedPost.co2System,
        hardscape: updatedPost.hardscape,
        plants: updatedPost.plants,
        fauna: updatedPost.fauna,
        likesCount: updatedPost.likesCount,
        commentsCount: updatedPost._count.comments,
        createdAt: updatedPost.createdAt,
        author: {
          id: updatedPost.user.id,
          name: updatedPost.user.name || updatedPost.user.username,
          username: updatedPost.user.username,
          image: updatedPost.user.image,
        },
      },
    });
  } catch (error) {
    console.error("Error updating showcase post:", error);
    return NextResponse.json(
      { error: "Failed to update showcase post." },
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
        { error: "You must be signed in to delete this post." },
        { status: 401 }
      );
    }

    const existingPost = await prisma.showcasePost.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "Showcase tank not found." },
        { status: 404 }
      );
    }

    if (existingPost.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to delete this showcase." },
        { status: 403 }
      );
    }

    await prisma.showcasePost.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Showcase tank deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting showcase post:", error);
    return NextResponse.json(
      { error: "Failed to delete showcase post." },
      { status: 500 }
    );
  }
}
