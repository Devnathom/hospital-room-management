"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  userId: number;
  email: string;
  role: "super_admin" | "school_admin" | "staff" | "nurse";
  schoolId: number | null;
  fullName: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/auth/signin");
    router.refresh();
  };

  return { user, loading, logout, refetch: fetchUser };
}
