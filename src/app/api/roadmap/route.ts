import { NextRequest, NextResponse } from "next/server";
import { generateRoadmap } from "@/lib/llm";
import { rateLimit } from "@/lib/redis";

// Allow up to 60 seconds for Vercel Serverless Functions to prevent timeout "Connection error"
export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        // Rate limiting (50 roadmaps per IP per day)
        const ip = request.headers.get("x-forwarded-for") || "anonymous";
        const { success } = await rateLimit(`roadmap:${ip}`, 50, 86400); // 24 hours

        if (!success) {
            return NextResponse.json(
                { error: "Rate limit exceeded. Try again tomorrow." },
                { status: 429 }
            );
        }

        const { analysisId, targetRole } = await request.json();

        if (!analysisId || !targetRole) {
            return NextResponse.json({ error: "Missing analysisId or targetRole" }, { status: 400 });
        }



        // Dynamically import prisma to prevent Next.js edge runtime execution issues
        const getPrismaClient = (await import("@/lib/prisma")).default;
        const prisma = getPrismaClient();

        // Fetch analysis from DB
        const analysis = await prisma.analysis.findUnique({
            where: { id: analysisId }
        });

        if (!analysis) {
            return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
        }

        // Generate roadmap using Groq LLM
        const roadmapMarkdown = await generateRoadmap(analysis.skills, analysis.experienceLevel, targetRole);

        // Save to DB
        const savedRoadmap = await prisma.roadmap.create({
            data: {
                analysisId,
                targetRole,
                markdownContent: roadmapMarkdown
            }
        });

        return NextResponse.json({
            success: true,
            data: savedRoadmap,
        });

    } catch (error) {
        console.error("Roadmap generation error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to generate roadmap" },
            { status: 500 }
        );
    }
}
