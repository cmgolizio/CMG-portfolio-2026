import React from "react";
import { getSession, onAuthStateChange } from "../services/auth";

export function useAuth() {
  const [user, setUser] = React.useState(null);
  const [session, setSession] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const sess = await getSession();
        if (!mounted) return;
        setSession(sess);
        setUser(sess?.user ?? null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    const { data } = onAuthStateChange((u, s) => {
      setUser(u);
      setSession(s);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      data?.subscription?.unsubscribe?.();
    };
  }, []);

  return { user, session, isLoading };
}
