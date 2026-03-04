import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }: { token: any, user?: any }) {
            if (user) {
                token.role = user.role
                token.id = user.id
                token.companyId = user.companyId
                token.companyRole = user.companyRole
            }
            return token
        },
        async session({ session, token }: { session: any, token: any }) {
            if (session.user && token) {
                session.user.role = token.role
                session.user.id = token.id
                session.user.companyId = token.companyId
                session.user.companyRole = token.companyRole
            }
            return session
        },
    },
    providers: [], // we leave this empty in the config to avoid edge issues
} satisfies NextAuthConfig
