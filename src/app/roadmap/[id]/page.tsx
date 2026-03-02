"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import RoadmapTimeline from "@/components/analyze/RoadmapTimeline";

export default function SharedRoadmapPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [roadmap, setRoadmap] = useState<any>(null);

    useEffect(() => {
        async function fetchRoadmap() {
            try {
                const response = await fetch(`/api/roadmap/${id}`);
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Failed to load roadmap");
                setRoadmap(data.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load roadmap");
            } finally {
                setLoading(false);
            }
        }
        fetchRoadmap();
    }, [id]);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <nav className="border-b border-border/40 bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            <FileText className="h-4 w-4" />
                        </div>
                        <span className="text-base font-bold">ResumeAI</span>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-4xl px-6 py-12">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                        <p className="text-muted-foreground">Loading roadmap...</p>
                    </div>
                )}

                {error && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <p className="text-red-500 mb-4">{error}</p>
                        <Link href="/" className="text-blue-400 hover:underline text-sm">
                            Go back to Home
                        </Link>
                    </div>
                )}

                {!loading && !error && roadmap && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full mb-4">
                                <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                                Shared Roadmap
                            </div>
                            <h1 className="text-3xl font-bold md:text-4xl">
                                {roadmap.targetRole} Career Roadmap
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Experience Level: <span className="text-foreground font-medium">{roadmap.experienceLevel}</span>
                            </p>
                        </div>

                        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-5 md:p-6">
                            <RoadmapTimeline
                                content={roadmap.markdownContent}
                                role={roadmap.targetRole}
                                roadmapId={roadmap.id}
                                skills={roadmap.skills || []}
                            />
                        </div>

                        <div className="mt-8 text-center">
                            <Link
                                href="/analyze"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Sparkles className="h-5 w-5" />
                                Analyze Your Own Resume
                            </Link>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
