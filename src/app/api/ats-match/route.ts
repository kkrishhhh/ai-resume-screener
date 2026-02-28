import { NextRequest, NextResponse } from "next/server";
import { atsMatch } from "@/lib/llm";
import { rateLimit } from "@/lib/redis";
import { extractTextFromPdf } from "@/lib/pdf-parser";

export async function POST(request: NextRequest) {
    try {
        // Rate limiting (50 ATS matches per IP per day)
        const ip = request.headers.get("x-forwarded-for") || "anonymous";
        const { success } = await rateLimit(`ats:${ip}`, 50, 86400);

        if (!success) {
            return NextResponse.json(
                { error: "Rate limit exceeded. Try again tomorrow." },
                { status: 429 }
            );
        }



        const formData = await request.formData();
        const file = formData.get("resume") as File | null;
        const jobDescription = formData.get("jobDescription") as string | null;

        if (!file || !jobDescription) {
            return NextResponse.json(
                { error: "Both resume PDF and job description are required." },
                { status: 400 }
            );
        }

        if (!jobDescription.trim() || jobDescription.trim().length < 50) {
            return NextResponse.json(
                { error: "Please provide a more detailed job description (at least 50 characters)." },
                { status: 400 }
            );
        }

        // Extract text from PDF
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        let resumeText = "";
        try {
            resumeText = await extractTextFromPdf(buffer);
        } catch {
            return NextResponse.json(
                { error: "Failed to read the PDF file." },
                { status: 400 }
            );
        }

        if (!resumeText || resumeText.trim().length < 50) {
            return NextResponse.json(
                { error: "Could not extract enough text from the PDF." },
                { status: 400 }
            );
        }

        // Run ATS matching
        const result = await atsMatch(resumeText, jobDescription);

        return NextResponse.json({
            success: true,
            data: result,
        });

    } catch (error) {
        console.error("ATS match error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "ATS matching failed." },
            { status: 500 }
        );
    }
}
