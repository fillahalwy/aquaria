import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const style = searchParams.get("style");
    const sizeSpan = searchParams.get("span"); // "normal" | "tall" | "wide"
    const sizeCategory = searchParams.get("sizeCategory"); // "nano" | "medium" | "large"
    const sort = searchParams.get("sort") || "popular"; // "popular" | "latest" | "comments"

    // Construct Prisma where filter
    const where: Record<string, unknown> = {};

    if (style && style.toLowerCase() !== "all") {
      where.style = {
        equals: style,
        mode: "insensitive",
      };
    }

    if (sizeSpan && sizeSpan.toLowerCase() !== "all") {
      where.sizeSpan = {
        equals: sizeSpan,
      };
    }

    if (search && search.trim().length > 0) {
      const query = search.trim();
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { style: { contains: query, mode: "insensitive" } },
        { hardscape: { contains: query, mode: "insensitive" } },
        { lighting: { contains: query, mode: "insensitive" } },
        { plants: { hasSome: [query] } },
        { fauna: { hasSome: [query] } },
        {
          user: {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { username: { contains: query, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Determine sorting
    let orderBy: Record<string, "asc" | "desc"> = { likesCount: "desc" };
    if (sort === "latest") {
      orderBy = { createdAt: "desc" };
    } else if (sort === "popular") {
      orderBy = { likesCount: "desc" };
    }

    const showcases = await prisma.showcasePost.findMany({
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
            comments: true,
            likes: true,
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

    let formattedShowcases = showcases.map((post) => {
      const hasLiked = currentUserId && Array.isArray(post.likes) && post.likes.length > 0;
      return {
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
        commentsCount: post._count.comments,
        hasLiked: !!hasLiked,
        createdAt: post.createdAt,
        author: {
          id: post.user.id,
          name: post.user.name || post.user.username,
          username: post.user.username,
          image: post.user.image,
        },
      };
    });

    // Filter by sizeCategory in memory if requested (extracts length number from dimensions like "60x30x36 cm")
    if (sizeCategory && sizeCategory !== "all") {
      formattedShowcases = formattedShowcases.filter((item) => {
        const dimMatch = item.dimensions.match(/^(\d+)/);
        if (!dimMatch) return true;
        const length = parseInt(dimMatch[1], 10);
        if (sizeCategory === "nano") return length < 45;
        if (sizeCategory === "medium") return length >= 45 && length <= 75;
        if (sizeCategory === "large") return length > 75;
        return true;
      });
    }

    // Secondary sort for most comments if selected
    if (sort === "comments") {
      formattedShowcases.sort((a, b) => b.commentsCount - a.commentsCount);
    }

    return NextResponse.json({
      success: true,
      showcases: formattedShowcases,
    });
  } catch (error) {
    console.error("Error fetching showcases:", error);
    return NextResponse.json(
      { error: "Failed to fetch showcase gallery." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to submit a showcase." },
        { status: 401 }
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

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json(
        { error: "Title must be at least 3 characters long." },
        { status: 400 }
      );
    }

    if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim().length < 5) {
      return NextResponse.json(
        { error: "A valid photo of your aquascape is required." },
        { status: 400 }
      );
    }

    if (!dimensions || typeof dimensions !== "string" || dimensions.trim().length < 2) {
      return NextResponse.json(
        { error: "Tank dimensions are required (e.g. 60x30x36 cm)." },
        { status: 400 }
      );
    }

    // Clean up arrays
    const cleanPlants: string[] = Array.isArray(plants)
      ? plants.map((p) => String(p).trim()).filter((p) => p.length > 0)
      : [];

    const cleanFauna: string[] = Array.isArray(fauna)
      ? fauna.map((f) => String(f).trim()).filter((f) => f.length > 0)
      : [];

    const validSpan = ["normal", "tall", "wide"].includes(sizeSpan) ? sizeSpan : "normal";

    const newShowcase = await prisma.showcasePost.create({
      data: {
        title: title.trim(),
        style: style && typeof style === "string" ? style.trim() : "Nature Aquarium",
        description: description && typeof description === "string" ? description.trim() : null,
        imageUrl: imageUrl.trim(),
        sizeSpan: validSpan,
        dimensions: dimensions.trim(),
        lighting: lighting && typeof lighting === "string" ? lighting.trim() : null,
        co2System: co2System && typeof co2System === "string" ? co2System.trim() : null,
        hardscape: hardscape && typeof hardscape === "string" ? hardscape.trim() : null,
        plants: cleanPlants,
        fauna: cleanFauna,
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
        message: "Showcase tank published successfully.",
        showcase: {
          id: newShowcase.id,
          title: newShowcase.title,
          style: newShowcase.style || "Nature Aquarium",
          description: newShowcase.description,
          imageUrl: newShowcase.imageUrl,
          sizeSpan: newShowcase.sizeSpan as "normal" | "tall" | "wide",
          dimensions: newShowcase.dimensions,
          lighting: newShowcase.lighting,
          co2System: newShowcase.co2System,
          hardscape: newShowcase.hardscape,
          plants: newShowcase.plants,
          fauna: newShowcase.fauna,
          likesCount: 0,
          commentsCount: 0,
          hasLiked: false,
          createdAt: newShowcase.createdAt,
          author: {
            id: newShowcase.user.id,
            name: newShowcase.user.name || newShowcase.user.username,
            username: newShowcase.user.username,
            image: newShowcase.user.image,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating showcase:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create showcase post.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
