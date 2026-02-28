import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdf } from "@/lib/pdf-parser";
import { analyzeResume } from "@/lib/llm";
import { rateLimit } from "@/lib/redis";

// Allow up to 60 seconds for Vercel Serverless Functions to prevent timeout "Connection error"
export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        // Rate limiting (50 analyzes per IP per day)
        const ip = request.headers.get("x-forwarded-for") || "anonymous";
        const { success } = await rateLimit(`analyze:${ip}`, 50, 86400); // 24 hours

        if (!success) {
            return NextResponse.json(
                { error: "You've reached the daily analysis limit (50/day). Please try again tomorrow." },
                { status: 429 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("resume") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded. Please select a PDF resume." },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.name.toLowerCase().endsWith(".pdf")) {
            return NextResponse.json(
                { error: "Only PDF files are supported. Please upload a .pdf file." },
                { status: 400 }
            );
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 10MB." },
                { status: 400 }
            );
        }

        // Validate file is not empty
        if (file.size === 0) {
            return NextResponse.json(
                { error: "The uploaded file is empty. Please upload a valid resume PDF." },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Extract text from PDF
        let text = "";
        try {
            text = await extractTextFromPdf(buffer);
        } catch (parseError) {
            console.error("PDF Parsing error:", parseError);
            return NextResponse.json(
                { error: "Failed to read the PDF file. The file may be corrupt, password-protected, or in an unsupported format." },
                { status: 400 }
            );
        }

        if (!text || text.trim().length < 50) {
            return NextResponse.json(
                { error: "Could not extract enough text from the PDF. Please ensure your resume is not an image-only (scanned) PDF." },
                { status: 400 }
            );
        }

        // Analyze with Groq
        const analysis = await analyzeResume(text);

        if (analysis.isResume === false) {
            return NextResponse.json(
                { error: "The uploaded document does not appear to be a resume or CV. Please upload a properly formatted resume." },
                { status: 400 }
            );
        }

        // Save to DB (best-effort — don't crash the whole analysis if DB fails)
        let savedAnalysisId: string | null = null;
        try {
            const getPrismaClient = (await import("@/lib/prisma")).default;
            const prisma = getPrismaClient();

            const savedAnalysis = await prisma.analysis.create({
                data: {
                    userId: null,
                    skills: analysis.skills,
                    experienceLevel: analysis.experienceLevel,
                    roles: {
                        create: analysis.roles.map((role: any) => ({
                            name: role.name,
                            confidence: role.confidence,
                            reason: role.reason,
                        })),
                    },
                },
            });
            savedAnalysisId = savedAnalysis.id;
        } catch (dbError) {
            console.error("DB save error (non-fatal):", dbError);
            // Continue — analysis result is still valid even if DB save fails
        }

        return NextResponse.json({
            success: true,
            data: { ...analysis, id: savedAnalysisId },
            filename: file.name,
        });
    } catch (error) {
        console.error("Analysis error:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Analysis failed. Please try again.",
            },
            { status: 500 }
        );
    }
}
