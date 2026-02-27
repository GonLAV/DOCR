import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { getPermissions } from "./permissions";

/**
 * Shared hook — fetches the current user once and returns { user, permissions, loading }.
 */
export function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, permissions: getPermissions(user), loading };
}