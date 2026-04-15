import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useRedirectIfAuth(redirectTo = "/browse") {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.replace(redirectTo);
  }, [router, redirectTo]);
}