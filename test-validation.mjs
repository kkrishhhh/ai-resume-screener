import fs from "fs";
import { jsPDF } from "jspdf";

async function createTestPDF(filename, title, body) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 20, 20);
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(body, 170);
    doc.text(splitText, 20, 30);

    const buffer = Buffer.from(doc.output("arraybuffer"));
    fs.writeFileSync(filename, buffer);
    return buffer;
}

async function runValidationTests() {
    console.log("Generating Validation Test Files...");

    const files = [];

    // 1. Valid Resume
    files.push({
        name: "valid_resume.pdf",
        buffer: await createTestPDF(
            "valid_resume.pdf",
            "Krishna Thakur - Software Engineer",
            "Experienced Software Engineer with a passion for building scalable web applications. Proficient in React, Next.js, Node.js, and Python. Experience migrating monolithic architectures to modern microservices. Hands-on experience with cloud platforms including AWS and GCP. Strong understanding of AI integrations using Google Gemini and OpenAI. Looking for a Full Stack Developer or Machine Learning Engineer role."
        ),
        desc: "Valid Software Engineer Resume"
    });

    // 2. Question Paper
    files.push({
        name: "question_paper.pdf",
        buffer: await createTestPDF(
            "question_paper.pdf",
            "CS101 Midterm Examination 2024",
            "Instructions: Answer all questions. Time limit: 2 hours. \n\nQ1: Explain the difference between a process and a thread. (10 marks)\nQ2: What is the time complexity of QuickSort in the worst-case scenario? Provide a brief explanation. (15 marks)\nQ3: Write a Python function to reverse a linked list. (25 marks)\nQ4: Describe the ACID properties in database management systems. (20 marks)\nBest of luck!"
        ),
        desc: "A University Question Paper"
    });

    // 3. Random Essay
    files.push({
        name: "random_essay.pdf",
        buffer: await createTestPDF(
            "random_essay.pdf",
            "The Impact of Climate Change on Coastal Cities",
            "Climate change poses a significant threat to coastal cities worldwide. Rising sea levels, driven by the melting of polar ice caps and thermal expansion of seawater, lead to increased frequency and severity of coastal flooding. This essay explores the economic, social, and environmental consequences of these changes. We will examine case studies of vulnerable regions and discuss potential mitigation strategies such as building seawalls and improving urban planning. Ultimately, a concerted global effort is required to address this pressing issue."
        ),
        desc: "A Random Academic Essay"
    });

    console.log("\n--- STARTING VALIDATION TESTS against http://localhost:3000/api/analyze ---");

    for (const file of files) {
        console.log(`\nTesting Case: ${file.desc}`);
        const formData = new FormData();
        const blob = new Blob([file.buffer], { type: "application/pdf" });
        formData.append("resume", blob, file.name);

        try {
            // Simulate an actual fetch call
            const response = await fetch("http://localhost:3000/api/analyze", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            console.log(`Status: ${response.status}`);
            if (response.status === 200) {
                console.log(`[SUCCESS] Accepted. Roles predicted:`, data.data.roles.map(r => r.name).join(", "));
            } else {
                console.log(`[REJECTED] Error:`, data.error);
            }
        } catch (e) {
            console.error("Fetch failed:", e.message);
        }
    }

    // Cleanup
    for (const file of files) {
        fs.unlinkSync(file.name);
    }
}

runValidationTests();
