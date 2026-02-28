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
    adapter: PrismaAdapter(prisma),
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
                    if (passwordsMatch) return user
                }

                console.log("Invalid credentials")
                return null
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role as any
                token.id = user.id as string
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.role = token.role as any
                session.user.id = token.id as string
                // session.user.image = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
            }
            return session
        },
    },
})
