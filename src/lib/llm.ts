import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

export interface AnalysisResult {
  isResume: boolean;
  roles: {
    name: string;
    confidence: number;
    reason: string;
  }[];
  skills: string[];
  experienceLevel: string;
  summary: string;
}

export async function analyzeResume(text: string): Promise<AnalysisResult> {
  const prompt = `You are an expert career counselor and resume analyst. Analyze the following text and determine if it is a resume. If it is a resume, provide career role recommendations. If it is NOT a resume (e.g., a random document, a question paper, an essay, etc.), gracefully reject it.

TEXT:
"""
${text}
"""

Based on this text, respond with ONLY a valid JSON object (no markdown formatting, no code blocks, just the raw JSON) in this exact format:
{
  "isResume": true or false,
  "roles": [
    {
      "name": "Role Title",
      "confidence": 85,
      "reason": "Brief reason why this role matches"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "experienceLevel": "Entry Level / Mid Level / Senior Level",
  "summary": "A brief 2-3 sentence summary of the candidate's profile"
}

Rules:
- FIRST, determine if the text is a resume or CV. If it is a random document, school assignment, question paper, or anything else, set "isResume": false and leave the other fields empty/default.
- If it IS a resume ("isResume": true):
  - Provide exactly 3 role predictions, ranked by confidence (highest first).
  - Confidence scores should be realistic percentages between 40-95.
  - Skills should list 5-8 key skills found in the resume.
  - Be specific about role names (e.g., "Frontend Developer" not just "Developer").
  - The reason should be 1-2 sentences explaining why the role matches.
- Return ONLY the JSON object, no other text.`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const responseText = chatCompletion.choices[0]?.message?.content || "";

  try {
    const parsed: AnalysisResult = JSON.parse(responseText);
    return parsed;
  } catch {
    throw new Error("Failed to parse AI response. Please try again.");
  }
}

export async function generateRoadmap(skills: string[], experienceLevel: string, targetRole: string): Promise<string> {
  const prompt = `You are an expert technical career coach. Create a highly actionable, step-by-step career roadmap for someone aiming to become a "${targetRole}".
    
Current Profile:
- Experience Level: ${experienceLevel}
- Current Skills: ${skills.join(", ")}

Generate a detailed markdown action plan. Structure it logically with clear headings (e.g., Phase 1: Skill Gaps, Phase 2: Portfolio Projects, Phase 3: Interview Prep, etc.).
Keep the formatting strictly clean Markdown. Be extremely specific about tools, frameworks, and actionable steps. Do NOT hallucinate skills they already have as things they need to learn, acknowledge what they already know.`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
  });

  return chatCompletion.choices[0]?.message?.content || "Could not generate roadmap.";
}

// --- Feature 2: ATS JD Matcher ---

export interface ATSMatchResult {
  overallScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  experienceGaps: string[];
  suggestions: string[];
  sectionBreakdown: {
    skills: number;
    experience: number;
    education: number;
    keywords: number;
  };
}

export async function atsMatch(resumeText: string, jobDescription: string): Promise<ATSMatchResult> {
  const prompt = `You are an expert ATS (Applicant Tracking System) and recruitment specialist. Compare the following resume against the given job description and provide a detailed ATS compatibility analysis.

RESUME:
"""
${resumeText}
"""

JOB DESCRIPTION:
"""
${jobDescription}
"""

Respond with ONLY a valid JSON object in this exact format:
{
  "overallScore": 72,
  "matchedKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword3", "keyword4"],
  "experienceGaps": ["gap description 1", "gap description 2"],
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2"],
  "sectionBreakdown": {
    "skills": 80,
    "experience": 65,
    "education": 90,
    "keywords": 60
  }
}

Rules:
- overallScore: A realistic percentage 0-100 of how well this resume matches the JD.
- matchedKeywords: Keywords/skills from the JD that ARE found in the resume (5-15 items).
- missingKeywords: Important keywords/skills from the JD that are MISSING from the resume (3-10 items).
- experienceGaps: Specific experience requirements from the JD that the resume doesn't clearly demonstrate (2-5 items).
- suggestions: Actionable tips to improve ATS match score (3-5 items).
- sectionBreakdown: Score 0-100 for how well each resume section matches the JD requirements.
- Be honest and precise. Don't inflate scores.
- Return ONLY the JSON object, no other text.`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const responseText = chatCompletion.choices[0]?.message?.content || "";

  try {
    const parsed: ATSMatchResult = JSON.parse(responseText);
    return parsed;
  } catch {
    throw new Error("Failed to parse ATS match response. Please try again.");
  }
}

// --- Feature 3: Chat with Resume (RAG) ---

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chatWithResume(
  resumeText: string,
  messages: ChatMessage[],
  userQuestion: string
): Promise<string> {
  const systemPrompt = `You are an intelligent AI assistant that has been given access to a candidate's resume. Your job is to answer questions about the resume accurately and helpfully. You can provide insights, summaries, highlight strengths, identify weaknesses, and give career advice based on the resume content.

RESUME CONTENT:
"""
${resumeText}
"""

Rules:
- ONLY answer questions based on the resume content provided above.
- If asked about something not in the resume, say "I don't see that information in the resume."
- Be conversational, professional, and helpful.
- Provide specific references to resume content when answering.
- Keep answers concise but thorough.`;

  const chatHistory: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
    ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user" as const, content: userQuestion },
  ];

  const chatCompletion = await groq.chat.completions.create({
    messages: chatHistory,
    model: "llama-3.3-70b-versatile",
    temperature: 0.4,
  });

  return chatCompletion.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
}
