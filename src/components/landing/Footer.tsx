"use client";

import Link from "next/link";
import { ArrowUp, Mail, Linkedin, Github, Phone } from "lucide-react";

function handleScrollTop() {
    window.scroll({
        top: 0,
        behavior: "smooth",
    });
}

const navigation = [
    {
        name: "Product",
        items: [
            { name: "Features", href: "#features" },
            { name: "How It Works", href: "#how-it-works" },
            { name: "Analyze Resume", href: "/analyze" },
        ],
    },
    {
        name: "About",
        items: [
            { name: "Story", href: "#story" },
            { name: "Tech Stack", href: "#tech-stack" },
        ],
    },
    {
        name: "Connect",
        items: [
            { name: "LinkedIn", href: "https://www.linkedin.com/in/krishna-thakur-6a6786293" },
            { name: "GitHub", href: "https://github.com" },
            { name: "Email", href: "mailto:krishhhh.work@gmail.com" },
        ],
    },
];

const Underline =
    "hover:-translate-y-1 border border-white/10 rounded-xl p-2.5 transition-transform text-white/40 hover:text-white";

export default function Footer() {
    return (
        <footer className="border-t border-white/[0.06] px-2 bg-[#020202]">
            <div className="mx-auto max-w-7xl px-6 py-12">
                {/* Navigation grid */}
                <div className="grid grid-cols-2 gap-8 md:grid-cols-3 md:gap-12">
                    {navigation.map((section) => (
                        <div key={section.name}>
                            <h3 className="text-sm font-semibold mb-4 text-white">{section.name}</h3>
                            <ul className="space-y-2.5">
                                {section.items.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            target={item.href.startsWith("http") ? "_blank" : undefined}
                                            className="text-sm text-white/40 hover:text-white transition-colors"
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-b border-white/[0.06] my-10" />

                {/* Social icons + scroll top */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <Link
                        aria-label="Email"
                        href="mailto:krishhhh.work@gmail.com"
                        target="_blank"
                        className={Underline}
                    >
                        <Mail strokeWidth={1.5} className="h-5 w-5" />
                    </Link>
                    <Link
                        aria-label="Phone"
                        href="tel:+917028289876"
                        className={Underline}
                    >
                        <Phone strokeWidth={1.5} className="h-5 w-5" />
                    </Link>
                    <Link
                        aria-label="LinkedIn"
                        href="https://www.linkedin.com/in/krishna-thakur-6a6786293"
                        target="_blank"
                        className={Underline}
                    >
                        <Linkedin strokeWidth={1.5} className="h-5 w-5" />
                    </Link>
                    <Link
                        aria-label="GitHub"
                        href="https://github.com"
                        target="_blank"
                        className={Underline}
                    >
                        <Github strokeWidth={1.5} className="h-5 w-5" />
                    </Link>

                    <button type="button" onClick={handleScrollTop} className={Underline}>
                        <ArrowUp className="h-4 w-4" />
                        <span className="sr-only">Back to top</span>
                    </button>
                </div>

                {/* Copyright */}
                <div className="mt-10 text-center text-xs text-white/30">
                    <span>© {new Date().getFullYear()} ResumeAI — AI Resume Screener. Built by Krishna Thakur.</span>
                </div>
            </div>
        </footer>
    );
}
