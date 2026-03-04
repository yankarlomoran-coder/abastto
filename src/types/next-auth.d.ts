import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            role: 'BUYER' | 'SUPPLIER'
            companyId: string | null
            companyRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' | null
        } & DefaultSession['user']
    }

    interface User {
        role: 'BUYER' | 'SUPPLIER'
        companyId: string | null
        companyRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' | null
    }
}
