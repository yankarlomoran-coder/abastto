"use client"

import { motion } from "framer-motion"

export function HeroGraphic() {
  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center overflow-visible">
      {/* Resplandor de fondo (Ember / Glow) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 dark:bg-blue-600/20 blur-[80px] rounded-full pointer-events-none" />

      <motion.svg
        viewBox="0 0 400 400"
        className="w-full h-full max-w-md drop-shadow-[0_0_15px_rgba(37,99,235,0.15)] relative z-10"
        initial="hidden"
        animate="visible"
      >
        {/* Nodos Centrales */}
        <motion.circle
          cx="200" cy="200" r="20"
          fill="currentColor"
          className="text-blue-600 dark:text-blue-500"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring", bounce: 0.5 }}
        />
        <motion.circle
          cx="100" cy="120" r="14"
          fill="currentColor"
          className="text-blue-400 dark:text-blue-300"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4, type: "spring", bounce: 0.5 }}
        />
        <motion.circle
          cx="300" cy="100" r="16"
          fill="currentColor"
          className="text-indigo-500 dark:text-indigo-400"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5, type: "spring", bounce: 0.5 }}
        />
        <motion.circle
          cx="140" cy="300" r="12"
          fill="currentColor"
          className="text-violet-500 dark:text-violet-400"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.7, type: "spring", bounce: 0.5 }}
        />
        <motion.circle
          cx="310" cy="270" r="14"
          fill="currentColor"
          className="text-sky-500 dark:text-sky-400"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8, type: "spring", bounce: 0.5 }}
        />

        {/* Líneas conectoras (Edges) */}
        <motion.path
          d="M 200 200 L 100 120 M 200 200 L 300 100 M 200 200 L 140 300 M 200 200 L 310 270 M 100 120 L 300 100 M 140 300 L 310 270 M 100 120 L 140 300"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-slate-200 dark:text-slate-700/80"
          fill="transparent"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 1 }}
        />
        
        {/* Pulsos de datos circulando por la red */}
        <motion.circle cx="100" cy="120" r="4" fill="currentColor" className="text-white dark:text-blue-100" initial={{ opacity: 0 }} animate={{ cx: [100, 200], cy: [120, 200], opacity: [0, 1, 0], scale: [1, 1.5, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 2.5 }} />
        <motion.circle cx="300" cy="100" r="4" fill="currentColor" className="text-white dark:text-indigo-100" initial={{ opacity: 0 }} animate={{ cx: [300, 200], cy: [100, 200], opacity: [0, 1, 0], scale: [1, 1.5, 1] }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear", delay: 3.5 }} />
        <motion.circle cx="140" cy="300" r="4" fill="currentColor" className="text-white dark:text-violet-100" initial={{ opacity: 0 }} animate={{ cx: [140, 200], cy: [300, 200], opacity: [0, 1, 0], scale: [1, 1.5, 1] }} transition={{ duration: 2.8, repeat: Infinity, ease: "linear", delay: 3.0 }} />
      </motion.svg>
    </div>
  )
}
