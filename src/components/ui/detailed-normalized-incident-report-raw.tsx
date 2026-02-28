"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    StackedNormalizedAreaChart,
    LinearXAxis,
    LinearXAxisTickSeries,
    LinearXAxisTickLabel,
    LinearYAxis,
    LinearYAxisTickSeries,
    StackedNormalizedAreaSeries,
    Line,
    Area,
    Gradient,
    GradientStop,
    GridlineSeries,
    Gridline,
    ChartDataTypes,
} from "reaviz";
import { AlertOctagon, AlertCircle, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

// Type definitions
interface ChartDataPoint {
    key: Date;
    data: number | null | undefined;
}

interface ChartSeries {
    key: string;
    data: ChartDataPoint[];
}

interface LegendItem {
    name: string;
    color: string;
}

interface MetricInfo {
    id: string;
    Icon: any;
    label: string;
    tooltip: string;
    value: string;
    TrendIcon: any;
    trendBaseColor: string;
    trendStrokeColor: string;
    delay: number;
    iconFillColor?: string;
}

// Data and Constants
const LEGEND_ITEMS: LegendItem[] = [
    { name: "Frontend Score", color: "#FAE5F6" }, // Lightest Pink
    { name: "Backend Score", color: "#EE4094" }, // Medium Pink
    { name: "Systems Score", color: "#BB015A" }, // Darkest Pink
];

const CHART_COLOR_SCHEME = ["#FAE5F6", "#EE4094", "#BB015A"];

const now = new Date();
const generateDate = (offsetDays: number): Date => {
    const date = new Date(now);
    date.setDate(now.getDate() - offsetDays);
    return date;
};

// Data for StackedNormalizedAreaChart
const initialMultiDateData: ChartSeries[] = [
    {
        key: "Frontend Score",
        data: Array.from({ length: 7 }, (_, i) => ({
            key: generateDate(6 - i),
            data: Math.floor(Math.random() * 20) + 10,
        })),
    },
    {
        key: "Backend Score",
        data: Array.from({ length: 7 }, (_, i) => ({
            key: generateDate(6 - i),
            data: Math.floor(Math.random() * 25) + 15,
        })),
    },
    {
        key: "Systems Score",
        data: Array.from({ length: 7 }, (_, i) => ({
            key: generateDate(6 - i),
            data: Math.floor(Math.random() * 15) + 5,
        })),
    },
];

const validateChartData = (data: ChartSeries[]): any => {
    return data.map((series) => ({
        ...series,
        data: series.data.map((item) => ({
            ...item,
            data: typeof item.data !== "number" || isNaN(item.data) ? 0 : item.data,
        })),
    }));
};

const validatedChartData = validateChartData(initialMultiDateData);

const METRICS_DATA: MetricInfo[] = [
    {
        id: "mttd",
        Icon: AlertOctagon,
        label: "Overall Confidence",
        tooltip: "Overall Match Confidence",
        value: "85%",
        TrendIcon: TrendingUp,
        trendBaseColor: "#40E5D1",
        trendStrokeColor: "#40E5D1",
        delay: 0,
        iconFillColor: "#E84045",
    },
    {
        id: "irt",
        Icon: AlertCircle,
        label: "Skill Relevancy",
        tooltip: "Percentage of required skills met",
        value: "92%",
        TrendIcon: TrendingUp,
        trendBaseColor: "#40E5D1",
        trendStrokeColor: "#40E5D1",
        delay: 0.05,
        iconFillColor: "#E84045",
    },
    {
        id: "ier",
        Icon: AlertTriangle,
        label: "Missing Experience Gap",
        tooltip: "Gap in requested years of experience",
        value: "10%",
        TrendIcon: TrendingDown,
        trendBaseColor: "#E84045",
        trendStrokeColor: "#E84045",
        delay: 0.1,
        iconFillColor: "#E84045",
    },
];

interface DetailedReportProps {
    analysis: any;
}

const DetailedNormalizedIncidentReportRaw: React.FC<DetailedReportProps> = ({ analysis }) => {
    const topConfidence = analysis?.roles?.[0]?.confidence || 85;
    const secondConfidence = analysis?.roles?.[1]?.confidence || 75;
    const thirdConfidence = analysis?.roles?.[2]?.confidence || 60;

    // Generate dynamic chart data based on the AI confidence
    const dynamicChartData: ChartSeries[] = [
        {
            key: analysis?.roles?.[0]?.name || "Primary Role",
            data: Array.from({ length: 7 }, (_, i) => ({
                key: generateDate(6 - i),
                data: Math.floor(topConfidence * (0.8 + Math.random() * 0.4)),
            })),
        },
        {
            key: analysis?.roles?.[1]?.name || "Secondary Role",
            data: Array.from({ length: 7 }, (_, i) => ({
                key: generateDate(6 - i),
                data: Math.floor(secondConfidence * (0.8 + Math.random() * 0.4)),
            })),
        },
        {
            key: analysis?.roles?.[2]?.name || "Tertiary Role",
            data: Array.from({ length: 7 }, (_, i) => ({
                key: generateDate(6 - i),
                data: Math.floor(thirdConfidence * (0.8 + Math.random() * 0.4)),
            })),
        },
    ];

    const validatedChartData = validateChartData(dynamicChartData);

    const dynamicLegendItems: LegendItem[] = [
        { name: analysis?.roles?.[0]?.name || "Primary", color: "#FAE5F6" },
        { name: analysis?.roles?.[1]?.name || "Secondary", color: "#EE4094" },
        { name: analysis?.roles?.[2]?.name || "Tertiary", color: "#BB015A" },
    ];

    const dynamicMetrics: MetricInfo[] = [
        {
            id: "mttd",
            Icon: AlertOctagon,
            label: "Top Role Match",
            tooltip: "Match confidence for highest role",
            value: `${topConfidence}%`,
            TrendIcon: TrendingUp,
            trendBaseColor: "#40E5D1",
            trendStrokeColor: "#40E5D1",
            delay: 0,
            iconFillColor: "#E84045",
        },
        {
            id: "irt",
            Icon: AlertCircle,
            label: "Skills Found",
            tooltip: "Total recognized skills",
            value: `${analysis?.skills?.length || 0} Skills`,
            TrendIcon: TrendingUp,
            trendBaseColor: "#40E5D1",
            trendStrokeColor: "#40E5D1",
            delay: 0.05,
            iconFillColor: "#E84045",
        },
        {
            id: "ier",
            Icon: AlertTriangle,
            label: "Experience Tier",
            tooltip: "Detected experience level",
            value: analysis?.experienceLevel || "N/A",
            TrendIcon: TrendingDown,
            trendBaseColor: "#E84045",
            trendStrokeColor: "#E84045",
            delay: 0.1,
            iconFillColor: "#E84045",
        },
    ];

    return (
        <>
            <style jsx global>{`
        :root {
          --reaviz-tick-fill: #9a9aaf;
          --reaviz-gridline-stroke: #7e7e8f75;
        }
        .dark {
          --reaviz-tick-fill: #a0aec0;
          --reaviz-gridline-stroke: rgba(74, 85, 104, 0.6);
        }
      `}</style>
            <div className="flex flex-col pt-4 pb-4 bg-white dark:bg-black rounded-3xl shadow-2xl border border-border w-full max-w-full min-h-[580px] overflow-hidden transition-colors duration-300">
                <h3 className="text-2xl text-left p-7 pt-6 pb-6 font-bold text-gray-900 dark:text-white transition-colors duration-300">
                    Match Trajectory Analysis
                </h3>

                {/* Legend */}
                <div className="flex justify-between flex-wrap gap-4 w-full pl-8 pr-8 mb-4">
                    {dynamicLegendItems.map((item) => (
                        <div key={item.name} className="flex gap-2 items-center">
                            <div
                                className="w-4 h-4 rounded-sm"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-gray-500 dark:text-gray-400 text-xs font-mono transition-colors duration-300">
                                {item.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Chart */}
                <div className="reaviz-chart-container h-[200px] px-2 mb-4">
                    <StackedNormalizedAreaChart
                        height={200}
                        id="stacked-normalized-details"
                        data={validatedChartData}
                        xAxis={
                            <LinearXAxis
                                type="time"
                                tickSeries={
                                    <LinearXAxisTickSeries
                                        label={
                                            <LinearXAxisTickLabel
                                                format={(v) =>
                                                    new Date(v).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })
                                                }
                                                fill="var(--reaviz-tick-fill)"
                                            />
                                        }
                                        tickSize={10}
                                    />
                                }
                            />
                        }
                        yAxis={
                            <LinearYAxis
                                axisLine={null}
                                tickSeries={
                                    <LinearYAxisTickSeries line={null} label={null} tickSize={10} />
                                }
                            />
                        }
                        series={
                            <StackedNormalizedAreaSeries
                                line={<Line strokeWidth={3} glow={{ blur: 10 }} />}
                                area={
                                    <Area
                                        glow={{ blur: 20 }}
                                        gradient={
                                            <Gradient
                                                stops={[
                                                    <GradientStop key={1} stopOpacity={0} />,
                                                    <GradientStop key={2} offset="80%" stopOpacity={0.2} />,
                                                ]}
                                            />
                                        }
                                    />
                                }
                                colorScheme={CHART_COLOR_SCHEME}
                            />
                        }
                        gridlines={
                            <GridlineSeries
                                line={<Gridline strokeColor="var(--reaviz-gridline-stroke)" />}
                            />
                        }
                    />
                </div>

                {/* Detailed Metrics List */}
                <div className="flex flex-col pl-8 pr-8 pt-4 font-mono divide-y divide-border transition-colors duration-300">
                    {dynamicMetrics.map((metric) => (
                        <motion.div
                            key={metric.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: metric.delay }}
                            className="flex w-full py-4 items-center gap-2"
                        >
                            <div className="flex flex-row gap-3 items-center text-sm w-[60%] text-muted-foreground transition-colors duration-300">
                                <metric.Icon className="h-5 w-5 text-purple-500" />
                                <span className="truncate" title={metric.tooltip}>
                                    {metric.label}
                                </span>
                            </div>
                            <div className="flex gap-2 w-[40%] justify-end items-center">
                                <span className="font-semibold text-xl text-foreground transition-colors duration-300">
                                    {metric.value}
                                </span>
                                <metric.TrendIcon
                                    className="h-5 w-5 ml-1"
                                    color={metric.trendStrokeColor}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default DetailedNormalizedIncidentReportRaw;
