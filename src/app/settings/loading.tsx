export default function SettingsLoading() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] transition-colors">
            <div className="max-w-5xl mx-auto px-6 py-8 sm:px-8 sm:py-12">
                {/* Header skeleton */}
                <div className="space-y-2 mb-8">
                    <div className="h-8 w-56 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
                    <div className="h-4 w-80 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Nav skeleton */}
                    <div className="md:w-[220px] shrink-0 space-y-1">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl">
                                <div className="w-4 h-4 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                                <div className={`h-4 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse ${i % 2 === 0 ? 'w-24' : 'w-32'}`} />
                            </div>
                        ))}
                    </div>

                    {/* Form skeleton */}
                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-3 w-32 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                                    <div className="h-10 w-full bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end">
                            <div className="h-10 w-32 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
