import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const publicPaths = [
    "/auth/login",
    "/auth/signup",
    "/auth/imam",
    "/",
    "/_next",
    "/favicon.ico",
    "/images",
    "/api",
  ];

  const isPublicPath = publicPaths.some(
    (publicPath) =>
      pathname === publicPath ||
      (publicPath !== "/" && pathname.startsWith(publicPath))
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/imam/:path*",
    "/mosqueSearch/:path*",
    "/profile/:path*",
    "/superAdmin/:path*",
  ],
};
