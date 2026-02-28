"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Upload, Brain, BarChart3 } from "lucide-react";

const steps = [
    {
        icon: Upload,
        number: "01",
        title: "Upload & Ingest",
        description:
            "Drop your PDF. Our engine instantly extracts the raw textual data and maps your career footprint.",
        color: "bg-[#111]",
        textColor: "text-white",
    },
    {
        icon: Brain,
        number: "02",
        title: "LLM Inference",
        description:
            "We pass your data through a high-parameter Language Model to identify latent skills and match them against 100+ industry roles.",
        color: "bg-[#222]",
        textColor: "text-white",
    },
    {
        icon: BarChart3,
        number: "03",
        title: "Actionable Intelligence",
        description:
            "Receive your top statistical matches and generate a step-by-step AI roadmap to bridge your skill gaps.",
        color: "bg-[#181818]",
        textColor: "text-white",
    },
];

const Card = ({ step, i, progress, range, targetScale }: any) => {
    const containerRef = useRef(null);
    const scale = useTransform(progress, range, [1, targetScale]);

    return (
        <div ref={containerRef} className="h-screen flex items-center justify-center sticky top-0">
            <motion.div
                style={{ scale, top: `calc(-5vh + ${i * 25}px)` }}
                className={`flex flex-col relative w-full max-w-4xl h-[450px] md:h-[500px] rounded-[40px] p-10 md:p-16 origin-top ${step.color} ${step.textColor} shadow-2xl border border-white/10`}
            >
                <div className="flex justify-between items-start mb-12">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-md">
                        <step.icon className={`h-8 w-8 ${step.textColor === "text-white" ? "text-white" : "text-black"}`} />
                    </div>
                    <span className="text-6xl md:text-8xl font-black opacity-20 tracking-tighter">
                        {step.number}
                    </span>
                </div>

                <div className="mt-auto">
                    <h3 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                        {step.title}
                    </h3>
                    <p className={`text-lg md:text-xl md:w-2/3 leading-relaxed ${step.textColor === "text-white" ? "text-white/60" : "text-black/60"}`}>
                        {step.description}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default function HowItWorks() {
    const container = useRef(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ["start start", "end end"],
    });

    return (
        <section id="how-it-works" className="bg-[#020202] py-24">
            <div className="mx-auto max-w-5xl px-6 text-center mb-12 relative z-10">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase">
                    The <span className="text-outline text-transparent" style={{ WebkitTextStroke: "1px white" }}>Architecture</span>
                </h2>
            </div>

            <div ref={container} className="relative mt-12">
                {steps.map((step, i) => {
                    const targetScale = 1 - (steps.length - i) * 0.05;
                    return (
                        <Card
                            key={i}
                            i={i}
                            step={step}
                            progress={scrollYProgress}
                            range={[i * 0.25, 1]}
                            targetScale={targetScale}
                        />
                    );
                })}
            </div>
        </section>
    );
}
