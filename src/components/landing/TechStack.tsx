"use client";

import { motion } from "framer-motion";

const techStack = [
    { name: "Next.js 16", category: "Framework", color: "border-white/20 hover:border-white/40" },
    { name: "TypeScript", category: "Language", color: "border-blue-500/30 hover:border-blue-500/60" },
    { name: "Tailwind CSS", category: "Styling", color: "border-cyan-500/30 hover:border-cyan-500/60" },
    { name: "Framer Motion", category: "Animations", color: "border-purple-500/30 hover:border-purple-500/60" },
    { name: "Groq (Llama 3.3)", category: "AI / LLM", color: "border-orange-500/30 hover:border-orange-500/60" },
    { name: "Prisma ORM", category: "Database", color: "border-teal-500/30 hover:border-teal-500/60" },
    { name: "Neon PostgreSQL", category: "Cloud DB", color: "border-green-500/30 hover:border-green-500/60" },
    { name: "Clerk", category: "Auth", color: "border-violet-500/30 hover:border-violet-500/60" },
    { name: "Upstash Redis", category: "Rate Limiting", color: "border-red-500/30 hover:border-red-500/60" },
    { name: "Three.js + R3F", category: "3D / WebGL", color: "border-pink-500/30 hover:border-pink-500/60" },
    { name: "GSAP", category: "Animations", color: "border-lime-500/30 hover:border-lime-500/60" },
    { name: "React Markdown", category: "Rendering", color: "border-amber-500/30 hover:border-amber-500/60" },
];

export default function TechStack() {
    return (
        <section id="tech-stack" className="py-16 md:py-24 bg-[#020202]">
            <div className="mx-auto max-w-5xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-white">
                        Built with production-grade tech
                    </h2>
                    <p className="mt-4 text-white/40 text-sm md:text-base">
                        12 modern tools and frameworks powering this full-stack AI application.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-wrap items-center justify-center gap-3"
                >
                    {techStack.map((tech, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            className={`flex flex-col items-center gap-1 rounded-xl border ${tech.color} bg-white/[0.03] px-5 py-3 backdrop-blur-sm transition-all`}
                        >
                            <span className="text-sm font-medium text-white">{tech.name}</span>
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">
                                {tech.category}
                            </span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
