// lib/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { findOrCreateOAuthUser } from "@/lib/server-db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // ✅ Guard: account must exist
      if (!account) return false;

      const provider = account.provider;
      if (provider !== "google" && provider !== "github") return false;
      if (!user.email) return false;

      const result = await findOrCreateOAuthUser({
        provider,
        providerAccountId: account.providerAccountId,
        email: user.email,
        name: user.name ?? profile?.name ?? user.email.split("@")[0],
      });

      if ("error" in result) {
        console.error(`${provider} signIn failed:`, result.error);
        return false;
      }

      user.id = result.user.id;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
});