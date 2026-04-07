export default function RfqLoading() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] p-4 sm:p-8 transition-colors">
            <div className="max-w-[1200px] mx-auto">
                {/* Header skeleton */}
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-8 w-56 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
                            <div className="h-4 w-40 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
                        </div>
                    </div>
                    <div className="h-11 w-40 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
                </header>

                {/* Filters skeleton */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl animate-pulse" />
                    <div className="flex items-center gap-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className={`h-8 rounded-lg bg-slate-200 dark:bg-white/10 animate-pulse ${i === 0 ? 'w-16' : 'w-20'}`} />
                        ))}
                    </div>
                </div>

                {/* Table skeleton */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
                    {/* Table header */}
                    <div className="flex items-center bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 px-8 py-4 gap-8">
                        {['w-24', 'w-28', 'w-16', 'w-20', 'w-12'].map((w, i) => (
                            <div key={i} className={`h-3 ${w} bg-slate-200 dark:bg-white/10 rounded animate-pulse`} />
                        ))}
                    </div>
                    {/* Rows */}
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="flex items-center px-8 py-5 gap-8">
                                <div className="flex-1 space-y-1.5">
                                    <div className={`h-4 bg-slate-200 dark:bg-white/10 rounded animate-pulse ${i % 3 === 0 ? 'w-64' : i % 3 === 1 ? 'w-48' : 'w-56'}`} />
                                    <div className="h-2.5 w-20 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
                                </div>
                                <div className="w-16 space-y-1.5">
                                    <div className="h-4 w-14 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                                    <div className="h-2.5 w-10 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
                                </div>
                                <div className="h-6 w-20 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse" />
                                <div className="h-4 w-16 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                                <div className="h-8 w-24 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
