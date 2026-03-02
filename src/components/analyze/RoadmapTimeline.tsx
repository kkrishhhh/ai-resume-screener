"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Video, FileText, Wrench, GraduationCap, CheckCircle2, Clock, Sparkles, Target, ArrowRight, ChevronDown, ChevronUp, Copy, Check, Download, Share2, Link2, Timer } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface RoadmapPhase {
    title: string;
    description: string;
    duration: string;
    topics: { name: string; description: string }[];
    resources: { name: string; url: string; type: string }[];
    metrics: string[];
}

export interface RoadmapData {
    targetRole: string;
    overview: string;
    phases: RoadmapPhase[];
}

interface RoadmapTimelineProps {
    content: string;
    role: string;
    roadmapId?: string;
    skills?: string[];
}

const getResourceIcon = (type: string) => {
    switch (type) {
        case 'course': return <GraduationCap className="h-4 w-4" />;
        case 'book': return <BookOpen className="h-4 w-4" />;
        case 'video': return <Video className="h-4 w-4" />;
        case 'tool': return <Wrench className="h-4 w-4" />;
        default: return <FileText className="h-4 w-4" />;
    }
};

// Check if a topic name matches any of the user's existing skills
function isKnownSkill(topicName: string, skills: string[]): boolean {
    const topicLower = topicName.toLowerCase();
    return skills.some(skill => {
        const skillLower = skill.toLowerCase();
        return topicLower.includes(skillLower) || skillLower.includes(topicLower);
    });
}

// Parse duration strings like "2-4 Weeks", "1-2 Months" into a rough week range
function parseDuration(duration: string): { min: number; max: number; unit: string } {
    const match = duration.match(/(\d+)\s*[-–to]*\s*(\d+)?\s*(week|month|day)/i);
    if (!match) return { min: 0, max: 0, unit: 'weeks' };
    const min = parseInt(match[1]);
    const max = match[2] ? parseInt(match[2]) : min;
    const unit = match[3].toLowerCase();
    if (unit.startsWith('month')) {
        return { min: min * 4, max: max * 4, unit: 'weeks' };
    }
    if (unit.startsWith('day')) {
        return { min: Math.ceil(min / 7), max: Math.ceil(max / 7), unit: 'weeks' };
    }
    return { min, max, unit: 'weeks' };
}

function formatWeeksToReadable(weeks: number): string {
    if (weeks >= 8) {
        const months = Math.round(weeks / 4);
        return `${months} month${months > 1 ? 's' : ''}`;
    }
    return `${weeks} week${weeks > 1 ? 's' : ''}`;
}

// Generate plain text version for copy to clipboard
function roadmapToText(data: RoadmapData): string {
    let text = `🎯 ${data.targetRole} Career Roadmap\n\n`;
    text += `${data.overview}\n\n`;
    data.phases.forEach((phase, i) => {
        text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        text += `📌 ${phase.title}\n`;
        text += `⏱️ Duration: ${phase.duration}\n`;
        text += `${phase.description}\n\n`;
        if (phase.topics?.length) {
            text += `📚 Key Topics:\n`;
            phase.topics.forEach(t => { text += `  • ${t.name}: ${t.description}\n`; });
            text += `\n`;
        }
        if (phase.resources?.length) {
            text += `🔗 Resources:\n`;
            phase.resources.forEach(r => { text += `  • ${r.name} (${r.type}): ${r.url}\n`; });
            text += `\n`;
        }
        if (phase.metrics?.length) {
            text += `✅ Success Metrics:\n`;
            phase.metrics.forEach(m => { text += `  • ${m}\n`; });
            text += `\n`;
        }
    });
    return text;
}

export default function RoadmapTimeline({ content, role, roadmapId, skills = [] }: RoadmapTimelineProps) {
    let parsedData: RoadmapData | null = null;
    let isJson = false;

    try {
        parsedData = JSON.parse(content);
        if (parsedData && parsedData.phases && Array.isArray(parsedData.phases)) {
            isJson = true;
        }
    } catch {
        isJson = false;
    }

    // Fallback for old markdown roadmaps
    if (!isJson || !parsedData) {
        return (
            <div className="prose prose-invert max-w-none text-sm md:text-base prose-headings:text-white prose-headings:mt-6 prose-headings:mb-3 prose-a:text-blue-400">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
        );
    }

    return <RoadmapTimelineInner data={parsedData} role={role} roadmapId={roadmapId} skills={skills} />;
}

function RoadmapTimelineInner({ data, role, roadmapId, skills }: { data: RoadmapData; role: string; roadmapId?: string; skills: string[] }) {
    const [expandedPhases, setExpandedPhases] = useState<Set<number>>(() => new Set([0])); // First phase open by default
    const [copied, setCopied] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const roadmapRef = useRef<HTMLDivElement>(null);

    const togglePhase = (index: number) => {
        setExpandedPhases(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    const expandAll = () => setExpandedPhases(new Set(data.phases.map((_, i) => i)));
    const collapseAll = () => setExpandedPhases(new Set());

    // Estimated total duration
    const totalDuration = data.phases.reduce((acc, phase) => {
        const d = parseDuration(phase.duration);
        return { min: acc.min + d.min, max: acc.max + d.max };
    }, { min: 0, max: 0 });

    const handleCopyToClipboard = async () => {
        const text = roadmapToText(data);
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadPDF = () => {
        // Use the browser's print functionality scoped to the roadmap
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${data.targetRole} Career Roadmap</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; padding: 40px; color: #1a1a2e; line-height: 1.6; background: #fff; }
          h1 { font-size: 28px; margin-bottom: 8px; color: #1a1a2e; }
          .overview { font-size: 14px; color: #555; margin-bottom: 32px; padding: 16px; background: #f0f4ff; border-radius: 8px; border-left: 4px solid #3b82f6; }
          .duration-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 32px; padding: 12px 16px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e; font-size: 14px; font-weight: 600; color: #166534; }
          .phase { margin-bottom: 28px; page-break-inside: avoid; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; }
          .phase-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
          .phase-title { font-size: 18px; font-weight: 700; color: #1a1a2e; }
          .phase-duration { font-size: 12px; color: #3b82f6; background: #eff6ff; padding: 4px 12px; border-radius: 20px; }
          .phase-desc { font-size: 13px; color: #666; margin-bottom: 16px; }
          .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 8px; margin-top: 16px; }
          .topic { display: inline-block; padding: 4px 10px; margin: 3px; border-radius: 6px; font-size: 12px; border: 1px solid #e5e7eb; }
          .topic-known { background: #f0fdf4; border-color: #22c55e; color: #166534; }
          .topic-learn { background: #fff7ed; border-color: #f97316; color: #9a3412; }
          .resource { font-size: 13px; color: #3b82f6; margin-bottom: 4px; }
          .metric { font-size: 13px; color: #333; margin-bottom: 4px; padding-left: 20px; position: relative; }
          .metric::before { content: "✓"; position: absolute; left: 0; color: #22c55e; font-weight: bold; }
          .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #aaa; }
        </style>
      </head>
      <body>
        <h1>🎯 ${data.targetRole} Career Roadmap</h1>
        <div class="overview">${data.overview}</div>
        <div class="duration-bar">⏱️ Estimated Duration: ${formatWeeksToReadable(totalDuration.min)} – ${formatWeeksToReadable(totalDuration.max)}</div>
        ${data.phases.map((phase, i) => `
          <div class="phase">
            <div class="phase-header">
              <div class="phase-title">${phase.title}</div>
              <div class="phase-duration">${phase.duration}</div>
            </div>
            <div class="phase-desc">${phase.description}</div>
            ${phase.topics?.length ? `
              <div class="section-title">Key Topics</div>
              <div>${phase.topics.map(t => `<span class="topic ${isKnownSkill(t.name, skills) ? 'topic-known' : 'topic-learn'}">${isKnownSkill(t.name, skills) ? '✓' : '○'} ${t.name}</span>`).join('')}</div>
            ` : ''}
            ${phase.resources?.length ? `
              <div class="section-title">Resources</div>
              ${phase.resources.map(r => `<div class="resource">📎 ${r.name} (${r.type})</div>`).join('')}
            ` : ''}
            ${phase.metrics?.length ? `
              <div class="section-title">Success Metrics</div>
              ${phase.metrics.map(m => `<div class="metric">${m}</div>`).join('')}
            ` : ''}
          </div>
        `).join('')}
        <div class="footer">Generated by ResumeAI • Personalized for your profile</div>
      </body>
      </html>
    `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.print();
        };
    };

    const handleShareLink = async () => {
        if (!roadmapId) return;
        const url = `${window.location.origin}/roadmap/${roadmapId}`;
        await navigator.clipboard.writeText(url);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    return (
        <div className="w-full space-y-6 mt-4" ref={roadmapRef}>
            {/* ── Action Buttons Row ── */}
            <div className="flex flex-wrap items-center gap-2">
                <button
                    onClick={handleCopyToClipboard}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border/40"
                >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                </button>

                <button
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border/40"
                >
                    <Download className="h-3.5 w-3.5" />
                    Download PDF
                </button>

                {roadmapId && (
                    <button
                        onClick={handleShareLink}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border/40"
                    >
                        {linkCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Share2 className="h-3.5 w-3.5" />}
                        {linkCopied ? "Link Copied!" : "Share"}
                    </button>
                )}

                <div className="ml-auto flex items-center gap-2">
                    <button onClick={expandAll} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Expand All</button>
                    <span className="text-muted-foreground/30">|</span>
                    <button onClick={collapseAll} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Collapse All</button>
                </div>
            </div>

            {/* ── Overview Card ── */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-400" />
                    Journey to {data.targetRole || role}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    {data.overview}
                </p>
            </div>

            {/* ── Estimated Duration Bar ── */}
            {totalDuration.max > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 px-5 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5"
                >
                    <Timer className="h-5 w-5 text-emerald-400" />
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-emerald-400">
                            Estimated Total Duration: {formatWeeksToReadable(totalDuration.min)} – {formatWeeksToReadable(totalDuration.max)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                            Across {data.phases.length} phases • Adjust based on your pace
                        </div>
                    </div>
                    {/* Mini progress segments */}
                    <div className="hidden sm:flex items-center gap-1">
                        {data.phases.map((phase, i) => {
                            const d = parseDuration(phase.duration);
                            const widthPct = totalDuration.max > 0 ? Math.max(12, (d.max / totalDuration.max) * 80) : 20;
                            return (
                                <div
                                    key={i}
                                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-70"
                                    style={{ width: `${widthPct}px` }}
                                    title={`${phase.title}: ${phase.duration}`}
                                />
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* ── Skill Legend ── */}
            {skills.length > 0 && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        <span>Already Known</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                        <span>Need to Learn</span>
                    </div>
                </div>
            )}

            {/* ── Timeline ── */}
            <div className="relative border-l-2 border-muted/50 ml-4 md:ml-6 space-y-6 pb-4">
                {data.phases.map((phase, index) => {
                    const isExpanded = expandedPhases.has(index);

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative pl-8 md:pl-10"
                        >
                            {/* Timeline dot */}
                            <div className="absolute -left-[17px] top-3 flex h-8 w-8 items-center justify-center rounded-full border-4 border-background bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm">
                                <span className="text-xs font-bold text-white">{index + 1}</span>
                            </div>

                            <div className="bg-card/40 border border-border/50 rounded-2xl backdrop-blur-sm transition-all hover:border-blue-500/30 hover:bg-card/60 overflow-hidden">
                                {/* Phase Header — Always visible, clickable */}
                                <button
                                    onClick={() => togglePhase(index)}
                                    className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-lg font-bold text-foreground mb-0.5">
                                            {phase.title}
                                        </h4>
                                        <p className="text-muted-foreground text-sm line-clamp-1">
                                            {phase.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4 shrink-0">
                                        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                                            <Clock className="h-3.5 w-3.5" />
                                            {phase.duration}
                                        </div>
                                        {isExpanded ? (
                                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </button>

                                {/* Phase Content — Collapsible */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 md:px-6 pb-5 md:pb-6 pt-0 space-y-5">
                                                {/* Duration on mobile */}
                                                <div className="sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {phase.duration}
                                                </div>

                                                <p className="text-muted-foreground text-sm">{phase.description}</p>

                                                {/* Topics with skill colors */}
                                                {phase.topics && phase.topics.length > 0 && (
                                                    <div>
                                                        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Key Topics</h5>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {phase.topics.map((topic, i) => {
                                                                const known = skills.length > 0 && isKnownSkill(topic.name, skills);
                                                                return (
                                                                    <div key={i} className={`rounded-xl p-3 border transition-colors ${known
                                                                            ? 'bg-green-500/5 border-green-500/20'
                                                                            : 'bg-orange-500/5 border-orange-500/20'
                                                                        }`}>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            {skills.length > 0 && (
                                                                                <div className={`h-2 w-2 rounded-full shrink-0 ${known ? 'bg-green-500' : 'bg-orange-500'}`} />
                                                                            )}
                                                                            <span className="font-medium text-sm text-foreground">{topic.name}</span>
                                                                            {known && (
                                                                                <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full ml-auto">KNOWN</span>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground ml-4">{topic.description}</div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Resources */}
                                                    {phase.resources && phase.resources.length > 0 && (
                                                        <div>
                                                            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Actionable Resources</h5>
                                                            <ul className="space-y-2.5">
                                                                {phase.resources.map((resource, i) => (
                                                                    <li key={i}>
                                                                        <a
                                                                            href={resource.url && resource.url !== '#' && !resource.url.toLowerCase().includes('search') ? resource.url : `https://www.google.com/search?q=${encodeURIComponent(resource.name)}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="group flex flex-col p-2.5 rounded-lg border border-transparent hover:border-blue-500/20 hover:bg-blue-500/5 transition-colors"
                                                                        >
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className="text-blue-400 p-1 rounded-md bg-blue-500/10">
                                                                                    {getResourceIcon(resource.type)}
                                                                                </span>
                                                                                <span className="text-sm font-medium text-foreground group-hover:text-blue-400 transition-colors line-clamp-1">
                                                                                    {resource.name}
                                                                                </span>
                                                                            </div>
                                                                            <span className="text-xs text-muted-foreground ml-9 opacity-80 group-hover:opacity-100 flex items-center gap-1">
                                                                                {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)} <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all cursor-pointer" />
                                                                            </span>
                                                                        </a>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Metrics */}
                                                    {phase.metrics && phase.metrics.length > 0 && (
                                                        <div>
                                                            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Success Metrics</h5>
                                                            <ul className="space-y-3">
                                                                {phase.metrics.map((metric, i) => (
                                                                    <li key={i} className="flex items-start gap-2.5 text-sm">
                                                                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                                                        <span className="text-muted-foreground leading-relaxed">{metric}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="flex items-center justify-center pt-4">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-full">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Roadmap customized for your profile
                </div>
            </div>
        </div>
    );
}
