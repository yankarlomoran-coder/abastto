import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { pathname } = req.nextUrl

    // All routes that require authentication
    const protectedRoutes = ["/dashboard", "/rfq", "/settings", "/analytics", "/network", "/notifications", "/company"]
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    // Redirect unauthenticated users away from protected routes
    if (isProtectedRoute && !isLoggedIn) {
        const loginUrl = new URL("/login", req.nextUrl)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return Response.redirect(loginUrl)
    }

    // Redirect logged-in users away from auth pages
    const authRoutes = ["/login", "/register"]
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", req.nextUrl))
    }
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
