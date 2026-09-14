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
        { error: "You must be signed in to like a showcase." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if showcase exists
    const showcase = await prisma.showcasePost.findUnique({
      where: { id },
      select: { id: true, likesCount: true },
    });

    if (!showcase) {
      return NextResponse.json(
        { error: "Showcase tank not found." },
        { status: 404 }
      );
    }

    // Check existing like
    const existingLike = await prisma.showcaseLike.findUnique({
      where: {
        userId_showcaseId: {
          userId,
          showcaseId: id,
        },
      },
    });

    let newLikesCount = showcase.likesCount;
    let hasLiked = false;

    if (existingLike) {
      // Toggle off / remove like
      await prisma.$transaction([
        prisma.showcaseLike.delete({
          where: { id: existingLike.id },
        }),
        prisma.showcasePost.update({
          where: { id },
          data: {
            likesCount: {
              decrement: 1,
            },
          },
        }),
      ]);
      newLikesCount = Math.max(0, showcase.likesCount - 1);
      hasLiked = false;
    } else {
      // Add like
      await prisma.$transaction([
        prisma.showcaseLike.create({
          data: {
            userId,
            showcaseId: id,
          },
        }),
        prisma.showcasePost.update({
          where: { id },
          data: {
            likesCount: {
              increment: 1,
            },
          },
        }),
      ]);
      newLikesCount = showcase.likesCount + 1;
      hasLiked = true;
    }

    return NextResponse.json({
      success: true,
      likesCount: newLikesCount,
      hasLiked,
    });
  } catch (error) {
    console.error("Error processing showcase like:", error);
    return NextResponse.json(
      { error: "Failed to process like." },
      { status: 500 }
    );
  }
}
