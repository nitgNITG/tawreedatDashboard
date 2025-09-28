import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// ...existing code...

interface DecodedToken {
  id: string;
  role: string;
  iat: number;
}

const verifyToken = async (token: string): Promise<DecodedToken | null> => {
  try {
    const secret = process.env.SECRET_KEY ?? "default_secret_key";
    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as DecodedToken;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

const authMiddleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // Skip auth check for public assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/imgs") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png"
  ) {
    return null;
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    // No token - redirect to login or deny access
    return Response.redirect(new URL("/", request.url));
  }

  const decodedToken = await verifyToken(token);

  if (!decodedToken) {
    // Invalid token - redirect to login
    return Response.redirect(new URL("/", request.url));
  }

  if (decodedToken.role !== "ADMIN") {
    // Not authorized - redirect to unauthorized page
    return Response.redirect(new URL("/", request.url));
  }

  // Allow access to root (/) so the app can render the Login component or a public landing page
  if (
    pathname === "/" ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    pathname === "/api"
  ) {
    return null;
  }

  return null; // Allow access
};

export default async function middleware(request: NextRequest) {
  // First check authentication and authorization
  // const authResponse = await authMiddleware(request);
  // if (authResponse) {
  //   return authResponse;
  // }

  // Then handle internationalization
  return createMiddleware(routing)(request);
}

export const config = {
  // Match only internationalized pathnames and exclude static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|firebase-messaging-sw.js|imgs|images|fonts|icon.png|api).*)",
    "/",
    "/(ar|en)/:path*",
  ],
};
