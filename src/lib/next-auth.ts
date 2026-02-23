import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import LineProvider from "next-auth/providers/line";
import { queryOne } from "@/lib/db";

const providers: any[] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }));
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(FacebookProvider({
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  }));
}

if (process.env.LINE_CLIENT_ID && process.env.LINE_CLIENT_SECRET) {
  providers.push(LineProvider({
    clientId: process.env.LINE_CLIENT_ID,
    clientSecret: process.env.LINE_CLIENT_SECRET,
  }));
}

export const authOptions: AuthOptions = {
  providers,

  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const dbUser = await queryOne<any>(
        "SELECT id, is_active, role, school_id FROM users WHERE email = ?",
        [user.email]
      );

      if (!dbUser) {
        // Redirect to registration with pre-filled email/name
        const params = new URLSearchParams({
          email: user.email,
          name: user.name || "",
          from: "oauth",
        });
        return `/auth/register-school?${params.toString()}`;
      }

      if (!dbUser.is_active) {
        return `/auth/signin?error=AccountSuspended`;
      }

      if (dbUser.role !== "super_admin" && dbUser.school_id) {
        const school = await queryOne<any>(
          "SELECT status FROM schools WHERE id = ?",
          [dbUser.school_id]
        );
        if (school?.status !== "approved") {
          return `/auth/signin?error=SchoolPending`;
        }
      }

      return true;
    },

    async jwt({ token, account, user }) {
      if (account && user?.email) {
        const dbUser = await queryOne<any>(
          "SELECT id, role, school_id, full_name, is_active FROM users WHERE email = ?",
          [user.email]
        );
        if (dbUser) {
          token.userId = dbUser.id;
          token.role = dbUser.role;
          token.schoolId = dbUser.school_id;
          token.fullName = dbUser.full_name;
          token.isRegistered = true;
        } else {
          token.isRegistered = false;
          token.oauthEmail = user.email;
          token.oauthName = user.name ?? "";
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.user.userId = token.userId;
      session.user.role = token.role;
      session.user.schoolId = token.schoolId;
      session.user.fullName = token.fullName;
      session.user.isRegistered = token.isRegistered;
      session.user.oauthEmail = token.oauthEmail;
      session.user.oauthName = token.oauthName;
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
};
