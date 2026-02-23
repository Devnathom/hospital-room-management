import { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      userId?: number;
      role?: string;
      schoolId?: number | null;
      fullName?: string;
      isRegistered?: boolean;
      oauthEmail?: string;
      oauthName?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userId?: number;
    role?: string;
    schoolId?: number | null;
    fullName?: string;
    isRegistered?: boolean;
    oauthEmail?: string;
    oauthName?: string;
  }
}
