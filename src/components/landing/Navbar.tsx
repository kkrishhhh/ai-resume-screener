"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Menu, X } from "lucide-react";

import { useState } from "react";


export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#020202]/80 backdrop-blur-xl"
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 transition-shadow group-hover:shadow-blue-500/40">
                        <FileText className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">
                        ResumeAI
                    </span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-8">
                    <Link
                        href="#features"
                        className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                        Features
                    </Link>
                    <Link
                        href="#how-it-works"
                        className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                        How It Works
                    </Link>
                    <Link
                        href="#story"
                        className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                        Story
                    </Link>




                    <Link
                        href="/analyze"
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
                    >
                        Try Now
                    </Link>
                </div>

                {/* Mobile menu button */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden border-t border-white/[0.06] bg-[#020202]/95 backdrop-blur-xl"
                >
                    <div className="flex flex-col gap-4 px-6 py-6">
                        <Link href="#features" onClick={() => setMobileOpen(false)} className="text-sm text-white/50 hover:text-white">Features</Link>
                        <Link href="#how-it-works" onClick={() => setMobileOpen(false)} className="text-sm text-white/50 hover:text-white">How It Works</Link>
                        <Link href="#story" onClick={() => setMobileOpen(false)} className="text-sm text-white/50 hover:text-white">Story</Link>
                        <div className="flex items-center justify-between pt-2">

                            <Link
                                href="/analyze"
                                onClick={() => setMobileOpen(false)}
                                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white"
                            >
                                Try Now
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
}
