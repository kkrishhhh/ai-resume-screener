"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Animated gradient background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 dark:from-blue-500/5 dark:via-purple-500/3 dark:to-pink-500/5" />
                <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-3xl" />
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-1 w-1 rounded-full bg-blue-400/30"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.8, 0.2],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 4,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            <div className="mx-auto max-w-5xl px-6 text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm"
                >
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <span>AI-Powered Resume Analysis</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
                >
                    <span className="block">Find the right career</span>
                    <span className="block mt-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent pb-2 leading-tight">
                        path for you
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
                >
                    Upload your resume and let AI analyze your skills, experience, and strengths
                    to recommend the top roles you&apos;re best suited for — with confidence scores.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
                >
                    <Link
                        href="/analyze"
                        className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
                    >
                        Analyze My Resume
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                        href="#how-it-works"
                        className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-8 py-4 text-base font-medium text-foreground backdrop-blur-sm transition-all hover:bg-muted/80 hover:scale-105 active:scale-95"
                    >
                        See How It Works
                    </Link>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="mt-20 grid grid-cols-3 gap-8 border-t border-border/40 pt-10"
                >
                    {[
                        { value: "AI", label: "Powered by Groq" },
                        { value: "3+", label: "Role Predictions" },
                        { value: "PDF", label: "Instant Reports" },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent md:text-3xl">
                                {stat.value}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground md:text-sm">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
