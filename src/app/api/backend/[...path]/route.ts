import { proxyBackend } from "@/lib/api/server";

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(request: Request, context: RouteContext) {
  const { path } = await context.params;
  if (path.some((segment) => segment === ".." || segment.includes("\\"))) {
    return Response.json({ message: "Caminho inválido." }, { status: 400 });
  }
  return proxyBackend(path.join("/"), request);
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
