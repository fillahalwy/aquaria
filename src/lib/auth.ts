import NextAuth, { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Extend session types to include username and id
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string | null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const usernameInput = (credentials.username as string).trim().toLowerCase();
        const passwordInput = credentials.password as string;

        // Find user by username (or email if user inputs their email)
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: usernameInput },
              { email: usernameInput },
            ],
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(passwordInput, user.password);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.username = token.username as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
});
