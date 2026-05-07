import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function useRedirectIfAuth(redirectTo = "/browse") {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.replace(redirectTo);
    }
  }, [isLoggedIn, isLoading, router, redirectTo]);
}
