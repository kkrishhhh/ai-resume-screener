import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 10;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Missing roadmap ID" }, { status: 400 });
        }

        const getPrismaClient = (await import("@/lib/prisma")).default;
        const prisma = getPrismaClient();

        const roadmap = await prisma.roadmap.findUnique({
            where: { id },
            include: {
                analysis: {
                    select: {
                        skills: true,
                        experienceLevel: true,
                    }
                }
            }
        });

        if (!roadmap) {
            return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                id: roadmap.id,
                targetRole: roadmap.targetRole,
                markdownContent: roadmap.markdownContent,
                createdAt: roadmap.createdAt,
                skills: roadmap.analysis?.skills || [],
                experienceLevel: roadmap.analysis?.experienceLevel || "Unknown",
            },
        });
    } catch (error) {
        console.error("Roadmap fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch roadmap" },
            { status: 500 }
        );
    }
}
