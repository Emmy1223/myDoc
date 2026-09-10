// lib/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { findOrCreateOAuthUser } from "@/lib/server-db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("[Auth] signIn callback fired");
      console.log("[Auth] provider:", account?.provider);
      console.log("[Auth] email:", user?.email);
      console.log("[Auth] providerAccountId:", account?.providerAccountId);

      if (account?.provider !== "google") {
        console.log("[Auth] rejecting: provider is not google");
        return false;
      }
      if (!user.email) {
        console.log("[Auth] rejecting: no email");
        return false;
      }

      try {
        const result = await findOrCreateOAuthUser({
          provider: "google",
          providerAccountId: account.providerAccountId,
          email: user.email,
          name: user.name ?? profile?.name ?? user.email.split("@")[0],
        });

        console.log("[Auth] findOrCreateOAuthUser result:", JSON.stringify(result, null, 2));

        if ("error" in result) {
          console.error("[Auth] OAuth signIn failed:", result.error);
          return false;
        }

        user.id = result.user.id;
        console.log("[Auth] success, user.id:", user.id);
        return true;
      } catch (error) {
        console.error("[Auth] Exception in signIn callback:", error);
        return false;
      }
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