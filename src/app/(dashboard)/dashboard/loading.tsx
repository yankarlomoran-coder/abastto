export default function DashboardLoading() {
    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 font-sans">
            {/* Sidebar skeleton */}
            <aside className="w-[280px] bg-white/70 dark:bg-[#0a0f1c]/70 border-r border-slate-200 dark:border-white/5 flex-shrink-0 hidden md:flex flex-col">
                <div className="p-8 pb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
                        <div className="h-6 w-28 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
                    </div>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3.5 rounded-xl">
                            <div className="w-5 h-5 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                            <div className={`h-4 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse ${i % 2 === 0 ? 'w-32' : 'w-40'}`} />
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main area skeleton */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header skeleton */}
                <header className="h-[80px] bg-white/50 dark:bg-[#0a0f1c]/50 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-10 shrink-0">
                    <div className="w-[350px] h-11 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
                        <div className="w-11 h-11 bg-slate-200 dark:bg-white/10 rounded-2xl animate-pulse" />
                    </div>
                </header>

                <div className="flex-1 p-10 xl:p-14 max-w-[1600px] w-full mx-auto space-y-12">
                    {/* Title skeleton */}
                    <div className="space-y-3">
                        <div className="h-10 w-72 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
                        <div className="h-5 w-96 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
                    </div>

                    {/* Metric cards skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-7 shadow-sm border border-slate-200 dark:border-white/5">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="h-3 w-24 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
                                </div>
                                <div className="h-8 w-32 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
                            </div>
                        ))}
                    </div>

                    {/* Table skeleton */}
                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-10">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
                            <div className="px-8 py-6 flex justify-between items-center bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                                <div className="h-6 w-48 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
                                <div className="h-9 w-36 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-white/5">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-6 px-8 py-5">
                                        <div className="flex-1 space-y-2">
                                            <div className={`h-4 bg-slate-200 dark:bg-white/10 rounded animate-pulse ${i % 2 === 0 ? 'w-48' : 'w-64'}`} />
                                            <div className="h-3 w-20 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
                                        </div>
                                        <div className="h-4 w-16 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
                                        <div className="h-6 w-20 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse" />
                                        <div className="h-4 w-20 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Side panel skeleton */}
                        <div className="space-y-8">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-8">
                                <div className="h-4 w-20 bg-slate-200 dark:bg-white/10 rounded animate-pulse mb-6" />
                                <div className="h-24 bg-slate-50 dark:bg-white/5 rounded-xl animate-pulse" />
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-8">
                                <div className="h-4 w-24 bg-slate-200 dark:bg-white/10 rounded animate-pulse mb-6" />
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 animate-pulse">
                                            <div className="w-10 h-10 bg-slate-200 dark:bg-white/10 rounded-xl" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 w-40 bg-slate-200 dark:bg-white/10 rounded" />
                                                <div className="h-2 w-24 bg-slate-100 dark:bg-white/5 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
