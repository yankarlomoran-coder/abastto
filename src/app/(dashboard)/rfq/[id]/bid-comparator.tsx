'use client'

import { useState } from 'react'
import { ArrowUpDown, TrendingDown, TrendingUp, Clock, Star, Award, ChevronDown, ChevronUp, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'

type BidData = {
    id: string
    amount: number
    deliveryLeadTime: string | null
    validityDays: number | null
    coverLetter: string | null
    company: { name: string | null, nit: string | null } | null
    companyId: string
    status: string
    items: {
        id: string
        unitPrice: number
        remarks: string | null
        rfqItem: { name: string, quantity: number, unit: string } | null
    }[]
}

type SortField = 'amount' | 'delivery' | 'validity' | 'items'
type SortDir = 'asc' | 'desc'

export default function BidComparator({ bids, budget }: { bids: BidData[], budget: number }) {
    const [sortField, setSortField] = useState<SortField>('amount')
    const [sortDir, setSortDir] = useState<SortDir>('asc')
    const [expanded, setExpanded] = useState<string | null>(null)

    if (bids.length < 2) return null

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDir('asc')
        }
    }

    // Parse delivery lead time to days for sorting
    const parseDeliveryDays = (text: string | null): number => {
        if (!text) return 999
        const match = text.match(/(\d+)/)
        return match ? parseInt(match[1]) : 999
    }

    const sorted = [...bids].sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1
        switch (sortField) {
            case 'amount': return (Number(a.amount) - Number(b.amount)) * dir
            case 'delivery': return (parseDeliveryDays(a.deliveryLeadTime) - parseDeliveryDays(b.deliveryLeadTime)) * dir
            case 'validity': return ((a.validityDays || 0) - (b.validityDays || 0)) * dir
            case 'items': return (a.items.length - b.items.length) * dir
            default: return 0
        }
    })

    const lowestAmount = Math.min(...bids.map(b => Number(b.amount)))
    const highestAmount = Math.max(...bids.map(b => Number(b.amount)))
    const avgAmount = bids.reduce((s, b) => s + Number(b.amount), 0) / bids.length

    const SortIcon = ({ field }: { field: SortField }) => (
        <span className={`inline-flex ${sortField === field ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`}>
            {sortField === field && sortDir === 'desc' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </span>
    )

    return (
        <div className="mt-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <ArrowUpDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            Tabla Comparativa de Ofertas
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{bids.length} propuestas en competencia</p>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30 text-center">
                        <p className="text-[0.6rem] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Más Baja</p>
                        <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">Q {lowestAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-800/30 text-center">
                        <p className="text-[0.6rem] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Promedio</p>
                        <p className="text-lg font-black text-blue-700 dark:text-blue-300">Q {avgAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100 dark:border-amber-800/30 text-center">
                        <p className="text-[0.6rem] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Más Alta</p>
                        <p className="text-lg font-black text-amber-700 dark:text-amber-300">Q {highestAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-white/5">
                            <th className="text-left px-5 py-3 text-[0.65rem] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Proveedor</th>
                            <th className="text-right px-5 py-3 cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => toggleSort('amount')}>
                                <span className="text-[0.65rem] font-black uppercase tracking-widest flex items-center justify-end gap-1">
                                    Monto Total <SortIcon field="amount" />
                                </span>
                            </th>
                            <th className="text-center px-5 py-3 cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => toggleSort('delivery')}>
                                <span className="text-[0.65rem] font-black uppercase tracking-widest flex items-center justify-center gap-1">
                                    Entrega <SortIcon field="delivery" />
                                </span>
                            </th>
                            <th className="text-center px-5 py-3 cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => toggleSort('validity')}>
                                <span className="text-[0.65rem] font-black uppercase tracking-widest flex items-center justify-center gap-1">
                                    Validez <SortIcon field="validity" />
                                </span>
                            </th>
                            <th className="text-center px-5 py-3 text-[0.65rem] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">vs Presupuesto</th>
                            <th className="text-center px-5 py-3 text-[0.65rem] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((bid, idx) => {
                            const amount = Number(bid.amount)
                            const diff = ((amount - budget) / budget) * 100
                            const isLowest = amount === lowestAmount
                            const isExpanded = expanded === bid.id

                            return (
                                <tr key={bid.id} className="border-b border-slate-50 dark:border-white/[0.03] last:border-0">
                                    <td className="px-5 py-4">
                                        <button onClick={() => setExpanded(isExpanded ? null : bid.id)} className="text-left group">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                                                    isLowest 
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-200 dark:ring-emerald-800' 
                                                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                                                }`}>
                                                    {isLowest ? <Award className="w-4 h-4" /> : idx + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{bid.company?.name || 'Proveedor'}</p>
                                                    {isLowest && <span className="text-[0.6rem] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Mejor precio</span>}
                                                </div>
                                            </div>
                                        </button>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <p className={`font-black text-base ${isLowest ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                            Q {amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center justify-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            {bid.deliveryLeadTime || '—'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                                            {bid.validityDays ? `${bid.validityDays} días` : '—'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                                            diff <= 0 
                                                ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400' 
                                                : diff <= 10 
                                                ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400'
                                                : 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400'
                                        }`}>
                                            {diff <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                                            {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <span className={`text-[0.6rem] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                                            bid.status === 'ACCEPTED' 
                                                ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                                                : bid.status === 'REJECTED' 
                                                ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                                : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                                        }`}>
                                            {bid.status === 'ACCEPTED' ? 'Adjudicada' : bid.status === 'REJECTED' ? 'No selec.' : 'En evaluación'}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
