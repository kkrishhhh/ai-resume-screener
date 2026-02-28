"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

interface Role {
    name: string;
    confidence: number;
}

interface ConfidenceChartProps {
    roles: Role[];
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899"];

export default function ConfidenceChart({ roles }: ConfidenceChartProps) {
    const data = roles.map((role) => ({
        name: role.name.length > 15 ? role.name.slice(0, 15) + "..." : role.name,
        confidence: role.confidence,
        fullName: role.name,
    }));

    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    fontSize={12}
                    stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    fontSize={11}
                    stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                    formatter={(value: any) => [`${value}%`, "Confidence"]}
                    labelFormatter={(_, payload) => {
                        if (payload && payload.length > 0) {
                            const item = payload[0].payload as { fullName: string };
                            return item.fullName;
                        }
                        return "";
                    }}
                    contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                    }}
                />
                <Bar dataKey="confidence" radius={[0, 6, 6, 0]} barSize={24}>
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
