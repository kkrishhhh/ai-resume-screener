"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, Loader2, ArrowLeft, Download, RotateCcw, Sparkles, CheckCircle, Brain, BarChart3, Target, MessageCircle, Send, Search } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const ConfidenceChart = dynamic(() => import("@/components/analyze/ConfidenceChart"), { ssr: false });
const DetailedNormalizedIncidentReport = dynamic(() => import("@/components/ui/detailed-normalized-incident-report"), { ssr: false });
import ReactMarkdown from "react-markdown";
import RoadmapTimeline from "@/components/analyze/RoadmapTimeline";

interface RolePrediction {
    name: string;
    confidence: number;
    reason: string;
}

interface AnalysisData {
    roles: RolePrediction[];
    skills: string[];
    experienceLevel: string;
    summary: string;
}

type Stage = "upload" | "processing" | "results";

export default function AnalyzePage() {
    const [stage, setStage] = useState<Stage>("upload");
    const [file, setFile] = useState<File | null>(null);
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [processingStep, setProcessingStep] = useState(0);
    const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState<string | null>(null);
    const [roadmapData, setRoadmapData] = useState<{ role: string; content: string; id: string } | null>(null);

    // ATS Matcher state
    const [showAtsPanel, setShowAtsPanel] = useState(false);
    const [jdText, setJdText] = useState("");
    const [isMatchingAts, setIsMatchingAts] = useState(false);
    const [atsResult, setAtsResult] = useState<any>(null);

    // Chat state  
    const [showChatPanel, setShowChatPanel] = useState(false);
    const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [isSendingChat, setIsSendingChat] = useState(false);
    const [resumeTextForChat, setResumeTextForChat] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    const handleGenerateRoadmap = async (roleName: string) => {
        if (!analysisData || !("id" in analysisData)) return;

        setIsGeneratingRoadmap(roleName);
        setRoadmapData(null);

        try {
            const response = await fetch("/api/roadmap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    analysisId: (analysisData as any).id,
                    targetRole: roleName
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate roadmap");
            }

            setRoadmapData({ role: roleName, content: data.data.markdownContent, id: data.data.id });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate roadmap");
        } finally {
            setIsGeneratingRoadmap(null);
        }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"] },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024, // 10MB
    });

    const handleAnalyze = async () => {
        if (!file) return;

        setStage("processing");
        setError(null);
        setProcessingStep(0);

        const formData = new FormData();
        formData.append("resume", file);

        // Simulate processing steps
        const stepTimer1 = setTimeout(() => setProcessingStep(1), 1500);
        const stepTimer2 = setTimeout(() => setProcessingStep(2), 3000);

        try {
            const response = await fetch("/api/analyze", {
                method: "POST",
                body: formData,
            });

            clearTimeout(stepTimer1);
            clearTimeout(stepTimer2);

            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}. Please try again.`);
            }

            if (!response.ok) {
                throw new Error(data.error || `Error ${response.status}: Analysis failed`);
            }

            setAnalysisData(data.data);
            setStage("results");
        } catch (err) {
            console.error("Analysis fetch error:", err);
            setError(err instanceof Error ? err.message : "Something went wrong catching the error");
            setStage("upload");
        }
    };

    const handleDownloadReport = async () => {
        if (!analysisData) return;

        try {
            const response = await fetch("/api/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(analysisData),
            });

            if (!response.ok) throw new Error("Failed to generate report");

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "resume_analysis_report.pdf";
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            setError("Failed to download report. Please try again.");
        }
    };

    const handleReset = () => {
        setStage("upload");
        setFile(null);
        setAnalysisData(null);
        setError(null);
        setProcessingStep(0);
        setRoadmapData(null);
        setAtsResult(null);
        setShowAtsPanel(false);
        setChatMessages([]);
        setShowChatPanel(false);
        setResumeTextForChat("");
    };

    // --- ATS Match Handler ---
    const handleAtsMatch = async () => {
        if (!file || !jdText.trim()) return;

        setIsMatchingAts(true);
        setAtsResult(null);

        try {
            const formData = new FormData();
            formData.append("resume", file);
            formData.append("jobDescription", jdText);

            const response = await fetch("/api/ats-match", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "ATS matching failed");

            setAtsResult(data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "ATS matching failed");
        } finally {
            setIsMatchingAts(false);
        }
    };

    // --- Chat Handler ---
    const handleSendChat = async () => {
        if (!chatInput.trim() || isSendingChat) return;

        const question = chatInput.trim();
        setChatInput("");
        setChatMessages(prev => [...prev, { role: "user", content: question }]);
        setIsSendingChat(true);

        try {
            // If we don't have the resume text yet, read it from the file
            let text = resumeTextForChat;
            if (!text && file) {
                // We need the raw text — we'll re-extract via a quick helper call
                const formData = new FormData();
                formData.append("resume", file);
                formData.append("jobDescription", "extract only");
                // Actually, let's just use a summary from analysisData
                text = `Resume Summary: ${analysisData?.summary || ""}\nSkills: ${analysisData?.skills?.join(", ") || ""}\nExperience Level: ${analysisData?.experienceLevel || ""}\nMatched Roles: ${analysisData?.roles?.map(r => `${r.name} (${r.confidence}%): ${r.reason}`).join("; ") || ""}`;
                setResumeTextForChat(text);
            }

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeText: text,
                    messages: chatMessages,
                    question,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Chat failed");

            setChatMessages(prev => [...prev, { role: "assistant", content: data.data.answer }]);
        } catch (err) {
            setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsSendingChat(false);
        }
    };

    const processingSteps = [
        { icon: FileText, label: "Extracting text from PDF..." },
        { icon: Brain, label: "Analyzing skills & experience..." },
        { icon: BarChart3, label: "Generating role predictions..." },
    ];

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
                <AnimatePresence mode="wait">
                    {/* UPLOAD STAGE */}
                    {stage === "upload" && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="text-center mb-10">
                                <h1 className="text-3xl font-bold md:text-4xl">Analyze Your Resume</h1>
                                <p className="mt-3 text-muted-foreground">
                                    Upload your resume PDF and get AI-powered career recommendations
                                </p>
                            </div>

                            {/* Error message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-500 flex items-center gap-3"
                                >
                                    <X className="h-4 w-4 shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            {/* Dropzone */}
                            <div
                                {...getRootProps()}
                                className={`
                  group relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300
                  ${isDragActive
                                        ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
                                        : "border-border/60 hover:border-blue-500/50 hover:bg-muted/50"
                                    }
                `}
                            >
                                <input {...getInputProps()} />

                                <div className="flex flex-col items-center gap-4">
                                    <div className={`
                    flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300
                    ${isDragActive
                                            ? "bg-blue-500 text-white scale-110"
                                            : "bg-muted text-muted-foreground group-hover:bg-blue-500/10 group-hover:text-blue-500"
                                        }
                  `}>
                                        <Upload className="h-7 w-7" />
                                    </div>

                                    <div>
                                        <p className="text-lg font-medium">
                                            {isDragActive ? "Drop your resume here" : "Drag & drop your resume"}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            or click to browse • PDF format • Max 10MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* File preview */}
                            {file && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6"
                                >
                                    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/50 px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{file.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFile(null);
                                            }}
                                            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleAnalyze}
                                        className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <Sparkles className="h-5 w-5" />
                                        Analyze Resume
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* PROCESSING STAGE */}
                    {stage === "processing" && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <div className="relative mb-8">
                                <div className="h-20 w-20 rounded-full border-4 border-muted" />
                                <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Brain className="h-8 w-8 text-blue-500" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold mb-2">Analyzing your resume</h2>
                            <p className="text-muted-foreground mb-10">
                                Our AI is reading and understanding your profile...
                            </p>

                            <div className="w-full max-w-md space-y-4">
                                {processingSteps.map((step, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.3 }}
                                        className={`flex items-center gap-3 rounded-xl border px-5 py-3 transition-all duration-500 ${i < processingStep
                                            ? "border-green-500/30 bg-green-500/5 text-green-500"
                                            : i === processingStep
                                                ? "border-blue-500/30 bg-blue-500/5 text-blue-500"
                                                : "border-border/40 text-muted-foreground"
                                            }`}
                                    >
                                        {i < processingStep ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : i === processingStep ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <step.icon className="h-5 w-5" />
                                        )}
                                        <span className="text-sm font-medium">{step.label}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* RESULTS STAGE */}
                    {stage === "results" && analysisData && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="text-center mb-10">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                    className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500 mb-4"
                                >
                                    <CheckCircle className="h-8 w-8" />
                                </motion.div>
                                <h1 className="text-3xl font-bold md:text-4xl">Analysis Complete</h1>
                                <p className="mt-2 text-muted-foreground">{analysisData.summary}</p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Experience Level: <span className="text-foreground font-medium">{analysisData.experienceLevel}</span>
                                </p>
                            </div>

                            {/* Top Role Predictions */}
                            <div className="mb-8">
                                <h2 className="text-xl font-bold mb-4">Top Role Predictions</h2>
                                <div className="space-y-4">
                                    {analysisData.roles.map((role, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + i * 0.15 }}
                                            className="rounded-xl border border-border/60 bg-card/50 p-5 backdrop-blur-sm"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
                                                        #{i + 1}
                                                    </span>
                                                    <h3 className="text-lg font-semibold">{role.name}</h3>
                                                </div>
                                                <span className={`text-lg font-bold ${role.confidence >= 70 ? "text-green-500" : role.confidence >= 50 ? "text-yellow-500" : "text-red-500"
                                                    }`}>
                                                    {role.confidence}%
                                                </span>
                                            </div>

                                            {/* Confidence bar */}
                                            <div className="mb-3 h-2 rounded-full bg-muted overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${role.confidence}%` }}
                                                    transition={{ duration: 1, delay: 0.5 + i * 0.2, ease: "easeOut" }}
                                                    className={`h-full rounded-full ${role.confidence >= 70
                                                        ? "bg-gradient-to-r from-green-500 to-emerald-400"
                                                        : role.confidence >= 50
                                                            ? "bg-gradient-to-r from-yellow-500 to-amber-400"
                                                            : "bg-gradient-to-r from-red-500 to-orange-400"
                                                        }`}
                                                />
                                            </div>

                                            <p className="text-sm text-muted-foreground mb-4">{role.reason}</p>

                                            <button
                                                onClick={() => handleGenerateRoadmap(role.name)}
                                                disabled={isGeneratingRoadmap !== null}
                                                className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-500 hover:bg-blue-500/20 transition-all disabled:opacity-50 border border-blue-500/20"
                                            >
                                                {isGeneratingRoadmap === role.name ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                                {isGeneratingRoadmap === role.name ? "Generating..." : "Generate AI Roadmap"}
                                            </button>

                                            <AnimatePresence>
                                                {roadmapData && roadmapData.role === role.name && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-6 overflow-hidden rounded-xl border border-blue-500/30 bg-blue-500/5 p-5 md:p-6"
                                                    >
                                                        <h4 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                                                            <Sparkles className="h-5 w-5 text-blue-500" />
                                                            {roadmapData.role} Career Roadmap
                                                        </h4>
                                                        <RoadmapTimeline content={roadmapData.content} role={roadmapData.role} roadmapId={roadmapData.id} skills={analysisData.skills} />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Advanced Chart Overview */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="mb-8 w-full"
                            >
                                <DetailedNormalizedIncidentReport analysis={analysisData} />
                            </motion.div>

                            {/* Skills */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                                className="rounded-xl border border-border/60 bg-card/50 p-5 mb-8"
                            >
                                <h3 className="text-base font-semibold mb-4">Skills Extracted from Resume</h3>
                                <div className="flex flex-wrap gap-2">
                                    {analysisData.skills.map((skill, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 1 + i * 0.05 }}
                                            className="inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-3 py-1.5 text-xs font-medium"
                                        >
                                            {skill}
                                        </motion.span>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Action buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.1 }}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <button
                                    onClick={handleDownloadReport}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Download className="h-4 w-4" />
                                    Download PDF Report
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-background px-6 py-3.5 text-sm font-medium transition-all hover:bg-muted hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Try Another Resume
                                </button>
                            </motion.div>


                            {/* === FEATURE TABS: ATS + CHAT === */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.3 }}
                                className="mt-8 flex flex-col sm:flex-row gap-4"
                            >
                                <button
                                    onClick={() => { setShowAtsPanel(!showAtsPanel); setShowChatPanel(false); }}
                                    className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-semibold transition-all border ${showAtsPanel
                                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                                        : "border-border/60 bg-card/50 text-muted-foreground hover:bg-muted"
                                        }`}
                                >
                                    <Target className="h-5 w-5" />
                                    ATS JD Matcher
                                </button>
                                <button
                                    onClick={() => { setShowChatPanel(!showChatPanel); setShowAtsPanel(false); }}
                                    className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-semibold transition-all border ${showChatPanel
                                        ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                                        : "border-border/60 bg-card/50 text-muted-foreground hover:bg-muted"
                                        }`}
                                >
                                    <MessageCircle className="h-5 w-5" />
                                    Chat with Resume
                                </button>
                            </motion.div>

                            {/* === ATS MATCHER PANEL === */}
                            <AnimatePresence>
                                {showAtsPanel && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-6 rounded-xl border border-green-500/30 bg-green-500/5 p-6 md:p-8"
                                    >
                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <Target className="h-5 w-5 text-green-500" />
                                            ATS Job Description Matcher
                                        </h3>

                                        <p className="text-sm text-muted-foreground mb-4">
                                            Paste a job description below to see how well your resume matches it.
                                        </p>
                                        <textarea
                                            value={jdText}
                                            onChange={(e) => setJdText(e.target.value)}
                                            placeholder="Paste the full job description here..."
                                            className="w-full h-40 rounded-xl border border-border/60 bg-background/80 p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500/50 mb-4"
                                        />
                                        <button
                                            onClick={handleAtsMatch}
                                            disabled={isMatchingAts || jdText.trim().length < 50}
                                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-green-600 disabled:opacity-50"
                                        >
                                            {isMatchingAts ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                            {isMatchingAts ? "Analyzing Match..." : "Analyze ATS Match"}
                                        </button>

                                        {/* ATS Results */}
                                        {atsResult && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-6 space-y-6"
                                            >
                                                {/* Overall Score */}
                                                <div className="text-center">
                                                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 ${atsResult.overallScore >= 70 ? "border-green-500 text-green-500" :
                                                        atsResult.overallScore >= 50 ? "border-yellow-500 text-yellow-500" :
                                                            "border-red-500 text-red-500"
                                                        }`}>
                                                        <span className="text-3xl font-black">{atsResult.overallScore}%</span>
                                                    </div>
                                                    <p className="mt-2 text-sm font-medium text-muted-foreground">ATS Match Score</p>
                                                </div>

                                                {/* Section Breakdown */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {Object.entries(atsResult.sectionBreakdown || {}).map(([key, val]) => (
                                                        <div key={key} className="rounded-lg border border-border/60 bg-card/50 p-3 text-center">
                                                            <p className="text-lg font-bold">{val as number}%</p>
                                                            <p className="text-xs text-muted-foreground capitalize">{key}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Matched vs Missing Keywords */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-green-400 mb-2">✓ Matched Keywords</h4>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {atsResult.matchedKeywords?.map((kw: string, i: number) => (
                                                                <span key={i} className="inline-flex rounded-full bg-green-500/10 border border-green-500/20 px-2.5 py-1 text-xs text-green-400">{kw}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-red-400 mb-2">✗ Missing Keywords</h4>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {atsResult.missingKeywords?.map((kw: string, i: number) => (
                                                                <span key={i} className="inline-flex rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-xs text-red-400">{kw}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Suggestions */}
                                                <div>
                                                    <h4 className="text-sm font-semibold mb-2">💡 Suggestions to Improve</h4>
                                                    <ul className="space-y-2">
                                                        {atsResult.suggestions?.map((s: string, i: number) => (
                                                            <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                                                <span className="text-blue-400 shrink-0">→</span> {s}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Experience Gaps */}
                                                {atsResult.experienceGaps?.length > 0 && (
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-yellow-400 mb-2">⚠ Experience Gaps</h4>
                                                        <ul className="space-y-1">
                                                            {atsResult.experienceGaps.map((g: string, i: number) => (
                                                                <li key={i} className="text-sm text-muted-foreground">• {g}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* === CHAT WITH RESUME PANEL === */}
                            <AnimatePresence>
                                {showChatPanel && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-6 rounded-xl border border-purple-500/30 bg-purple-500/5 p-6 md:p-8"
                                    >
                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <MessageCircle className="h-5 w-5 text-purple-500" />
                                            Chat with Your Resume
                                        </h3>

                                        <p className="text-sm text-muted-foreground mb-4">
                                            Ask any question about your resume — strengths, weaknesses, career advice, and more.
                                        </p>

                                        {/* Chat Messages */}
                                        <div className="max-h-80 overflow-y-auto space-y-3 mb-4 p-3 rounded-xl bg-background/50 border border-border/40">
                                            {chatMessages.length === 0 && (
                                                <p className="text-sm text-muted-foreground/50 text-center py-8">Start a conversation about your resume...</p>
                                            )}
                                            {chatMessages.map((msg, i) => (
                                                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user"
                                                        ? "bg-purple-500 text-white rounded-br-md"
                                                        : "bg-card border border-border/60 rounded-bl-md"
                                                        }`}>
                                                        {msg.role === "assistant" ? (
                                                            <div className="prose prose-invert prose-sm max-w-none">
                                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                            </div>
                                                        ) : msg.content}
                                                    </div>
                                                </div>
                                            ))}
                                            {isSendingChat && (
                                                <div className="flex justify-start">
                                                    <div className="bg-card border border-border/60 rounded-2xl rounded-bl-md px-4 py-3">
                                                        <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                                                    </div>
                                                </div>
                                            )}
                                            <div ref={chatEndRef} />
                                        </div>

                                        {/* Chat Input */}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendChat()}
                                                placeholder="Ask about your resume..."
                                                className="flex-1 rounded-xl border border-border/60 bg-background/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                disabled={isSendingChat}
                                            />
                                            <button
                                                onClick={handleSendChat}
                                                disabled={isSendingChat || !chatInput.trim()}
                                                className="rounded-xl bg-purple-500 px-4 py-3 text-white transition-all hover:bg-purple-600 disabled:opacity-50"
                                            >
                                                <Send className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
