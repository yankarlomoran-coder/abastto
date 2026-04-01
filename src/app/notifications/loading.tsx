export default function NotificationsLoading() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] p-4 sm:p-8 transition-colors">
            <div className="max-w-[800px] mx-auto">
                {/* Header skeleton */}
                <header className="flex items-center gap-4 mb-8">
                    <div className="w-9 h-9 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-8 w-64 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
                        <div className="h-4 w-48 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
                    </div>
                </header>

                {/* Notification items skeleton */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-start gap-4 p-5 sm:p-6">
                            <div className="w-11 h-11 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div className={`h-4 bg-slate-200 dark:bg-white/10 rounded animate-pulse ${i % 2 === 0 ? 'w-40' : 'w-32'}`} />
                                    <div className="h-5 w-14 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse" />
                                </div>
                                <div className={`h-3 bg-slate-100 dark:bg-white/5 rounded animate-pulse ${i % 3 === 0 ? 'w-full' : 'w-3/4'}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
