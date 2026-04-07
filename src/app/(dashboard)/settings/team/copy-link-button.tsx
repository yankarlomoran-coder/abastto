'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyLinkButton({ token }: { token: string }) {
    const [copied, setCopied] = useState(false)
    const url = typeof window !== 'undefined'
        ? `${window.location.origin}/register?token=${token}`
        : `/register?token=${token}`

    const handleCopy = async () => {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <button
            onClick={handleCopy}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado' : 'Copiar Enlace'}
        </button>
    )
}
