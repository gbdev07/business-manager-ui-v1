import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies";

export default function Home() {
  return (
    <Suspense>
      <HomeRedirect />
    </Suspense>
  );
}

async function HomeRedirect() {
  const jar = await cookies();
  redirect(jar.get(ACCESS_COOKIE) || jar.get(REFRESH_COOKIE) ? "/dashboard" : "/login");
  return null;
}
