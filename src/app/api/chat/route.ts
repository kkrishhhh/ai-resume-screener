import { NextRequest, NextResponse } from "next/server";
import { chatWithResume, ChatMessage } from "@/lib/llm";
import { rateLimit } from "@/lib/redis";

export async function POST(request: NextRequest) {
    try {
        // Rate limiting (100 chat messages per IP per day)
        const ip = request.headers.get("x-forwarded-for") || "anonymous";
        const { success } = await rateLimit(`chat:${ip}`, 100, 86400);

        if (!success) {
            return NextResponse.json(
                { error: "Rate limit exceeded. Try again tomorrow." },
                { status: 429 }
            );
        }



        const { resumeText, messages, question } = await request.json();

        if (!resumeText || !question) {
            return NextResponse.json(
                { error: "Resume text and question are required." },
                { status: 400 }
            );
        }

        const chatMessages: ChatMessage[] = messages || [];

        const answer = await chatWithResume(resumeText, chatMessages, question);

        return NextResponse.json({
            success: true,
            data: { answer },
        });

    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Chat failed." },
            { status: 500 }
        );
    }
}
