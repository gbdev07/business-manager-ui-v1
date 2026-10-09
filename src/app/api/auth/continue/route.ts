import { redirect } from "next/navigation";
import { clearAuth, refreshSession } from "@/lib/api/server";
import { safeNextPath } from "@/lib/safe-next";

export async function GET(request: Request) {
  const nextPath = safeNextPath(new URL(request.url).searchParams.get("next"));
  const refreshed = await refreshSession();
  if (!refreshed) {
    await clearAuth();
    redirect("/login");
  }
  redirect(nextPath);
}
