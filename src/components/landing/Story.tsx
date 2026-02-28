"use client";

import { motion } from "framer-motion";

export default function Story() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
            },
        },
    };

    const textVariants = {
        hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: 1, ease: "easeOut" as const }
        },
    };

    return (
        <section id="story" className="relative py-32 md:py-48 bg-[#020202] text-white overflow-hidden">
            {/* Subtle Grain Background overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }}></div>

            <div className="mx-auto max-w-3xl px-6 relative z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="space-y-16 md:space-y-24"
                >
                    <motion.div variants={textVariants}>
                        <p className="font-mono text-xs text-white/40 uppercase tracking-[0.3em] mb-6">
                            01 // The Origin
                        </p>
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight">
                            We didn't just build a tool. <br />
                            <span className="text-white/40 italic">We built a solution to our own problem.</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={textVariants} className="pl-0 md:pl-20 border-l border-white/10 ml-0 md:ml-10">
                        <p className="text-lg md:text-2xl text-white/70 leading-relaxed font-light">
                            Browsing through thousands of job listings — <span className="text-white font-medium">Software Engineer, Data Analyst, Frontend Developer</span> — is exhausting when you don't know exactly what your resume is tailored for.
                        </p>
                    </motion.div>

                    <motion.div variants={textVariants} className="pl-0 md:pl-20 border-l border-white/10 ml-0 md:ml-10">
                        <p className="text-lg md:text-2xl text-white/70 leading-relaxed font-light">
                            We were applying blindly, hoping something would stick. Then it hit us: <span className="text-white font-medium">What if the AI could just read the resume and tell us our exact statistical matches?</span>
                        </p>
                    </motion.div>

                    <motion.div variants={textVariants}>
                        <p className="font-mono text-xs text-white/40 uppercase tracking-[0.3em] mb-6 mt-12 md:mt-24">
                            02 // The Result
                        </p>
                        <h3 className="text-2xl md:text-4xl lg:text-5xl font-normal leading-[1.1] tracking-tight">
                            A high-precision inference engine that transforms static CVs into <span className="italic text-white/40">clear career trajectories.</span>
                        </h3>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
