import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, username, email, password, confirmPassword } = body;

    // 1. Validation: Name (Required)
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Full Name is required (minimum 2 characters)." },
        { status: 400 }
      );
    }
    const cleanName = name.trim();

    // 2. Validation: Username
    if (!username || typeof username !== "string" || username.trim().length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters long." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(cleanUsername)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, and underscores." },
        { status: 400 }
      );
    }

    // 2. Validation: Password
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    // 3. Validation: Optional Email
    let cleanEmail: string | null = null;
    if (email && typeof email === "string" && email.trim().length > 0) {
      cleanEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return NextResponse.json(
          { error: "Please enter a valid email address." },
          { status: 400 }
        );
      }
    }

    // 4. Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username is already taken. Please choose another." },
        { status: 409 }
      );
    }

    // 5. Check if email already exists (if provided)
    if (cleanEmail) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: "Email is already registered. Please sign in or use another email." },
          { status: 409 }
        );
      }
    }

    // 6. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7. Create User
    const newUser = await prisma.user.create({
      data: {
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: {
          id: newUser.id,
          username: newUser.username,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error: ", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
