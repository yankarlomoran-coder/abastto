export default function NetworkLoading() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] p-4 sm:p-8 transition-colors">
            <div className="max-w-[1200px] mx-auto">
                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-8 w-56 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
                            <div className="h-4 w-80 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
                        </div>
                    </div>
                </header>

                {/* Filters */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl animate-pulse" />
                    <div className="h-8 w-28 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
                    <div className="h-8 w-36 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-white/10 animate-pulse shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className={`h-4 bg-slate-200 dark:bg-white/10 rounded animate-pulse ${i % 3 === 0 ? 'w-40' : 'w-32'}`} />
                                    <div className="h-3 w-24 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="h-3 w-28 bg-slate-100 dark:bg-white/5 rounded animate-pulse mb-4" />
                            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center gap-4">
                                <div className="h-4 w-16 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                                <div className="h-4 w-10 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
                                <div className="h-5 w-20 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse ml-auto" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
