import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { z } from "zod"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

async function getUser(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })
        return user
    } catch (error) {
        console.error("Failed to fetch user:", error)
        throw new Error("Failed to fetch user.")
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma) as any,
    session: { strategy: "jwt" }, // Credentials provider requires JWT strategy
    pages: {
        signIn: "/login",
    },
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials)

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data
                    const user = await getUser(email)
                    if (!user) return null

                    // Google users won't have a password
                    if (!user.password) return null

                    const passwordsMatch = await bcrypt.compare(password, user.password)
                    if (passwordsMatch) return user as any
                }

                console.log("Invalid credentials")
                return null
            },
        }),
    ],
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
})
