"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const DetailedNormalizedIncidentReportRaw = dynamic(
    () => import("./detailed-normalized-incident-report-raw"),
    { ssr: false }
);

interface DetailedReportProps {
    analysis: any;
}

export default function DetailedNormalizedIncidentReport({ analysis }: DetailedReportProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="flex flex-col pt-4 pb-4 bg-white dark:bg-black rounded-3xl shadow-2xl border border-border w-full max-w-full h-[580px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
                <p className="text-muted-foreground font-mono text-sm">Loading Match Analytics...</p>
            </div>
        );
    }

    return <DetailedNormalizedIncidentReportRaw analysis={analysis} />;
}
