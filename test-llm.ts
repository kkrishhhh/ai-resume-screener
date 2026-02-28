import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
    const { analyzeResume } = await import("./src/lib/llm");
    console.log("--- STARTING DIRECT LLM VALIDATION TESTS ---");

    // 1. Valid Resume Text
    const validText = `
  Krishna Thakur
  Software Engineer

  Summary:
  Experienced Software Engineer with a passion for building scalable web applications. Proficient in React, Next.js, Node.js.

  Experience:
  Software Developer at TechCorp (2022-Present)
  - Migrated monolithic architecture to microservices.
  - Developed full-stack applications using Next.js.
  
  Skills:
  JavaScript, TypeScript, React, Next.js, Node.js, Python, AWS
  `;

    // 2. Question Paper Text
    const questionPaperText = `
  CS101 Midterm Examination 2024
  Instructions: Answer all questions. Time limit: 2 hours.
  
  Q1: Explain the difference between a process and a thread. (10 marks)
  Q2: What is the time complexity of QuickSort in the worst-case scenario? Provide a brief explanation. (15 marks)
  Q3: Write a Python function to reverse a linked list. (25 marks)
  Q4: Describe the ACID properties in database management systems. (20 marks)
  Best of luck!
  `;

    // 3. Random Essay Text
    const essayText = `
  The Impact of Climate Change on Coastal Cities
  
  Climate change poses a significant threat to coastal cities worldwide. Rising sea levels, driven by the melting of polar ice caps and thermal expansion of seawater, lead to increased frequency and severity of coastal flooding. This essay explores the economic, social, and environmental consequences of these changes. We will examine case studies of vulnerable regions and discuss potential mitigation strategies such as building seawalls and improving urban planning. Ultimately, a concerted global effort is required to address this pressing issue.
  `;

    const tests = [
        { name: "Valid Resume", text: validText },
        { name: "Question Paper", text: questionPaperText },
        { name: "Random Essay", text: essayText }
    ];

    for (const test of tests) {
        console.log("\\nTesting:", test.name);
        try {
            const result = await analyzeResume(test.text);
            console.log("Result: isResume =", result.isResume);
            if (result.isResume) {
                console.log("Predicted Roles:", result.roles.map(r => r.name).join(", "));
            } else {
                console.log("Successfully rejected non-resume document.");
            }
        } catch (e: any) {
            console.error("Error analyzing:", e.message);
        }
    }
}

main();
