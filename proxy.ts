import { auth } from "@/lib/auth-edge";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;

    const isAuthPage = pathname.startsWith("/auth");
    const isApiAuth = pathname.startsWith("/api/auth");
    const isStatic = pathname.startsWith("/_next") || pathname === "/favicon.ico";

    if (isStatic || isAuthPage || isApiAuth) return NextResponse.next();

    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/auth/signin", req.nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
