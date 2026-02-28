import fs from "fs";
import { jsPDF } from "jspdf";

async function runValidTest() {
    console.log("Generating Valid Test Resume...");

    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Krishna Thakur - Software Engineer", 20, 20);
    doc.setFontSize(12);
    const bodyText = `
Experienced Software Engineer with a passion for building scalable web applications.
Proficient in React, Next.js, Node.js, and Python.
Experience migrating monolithic architectures to modern microservices.
Hands-on experience with cloud platforms including AWS and GCP.
Strong understanding of AI integrations using Google Gemini and OpenAI.
Looking for a Full Stack Developer or Machine Learning Engineer role.
`;
    doc.text(bodyText, 20, 40);

    const buffer = Buffer.from(doc.output("arraybuffer"));
    fs.writeFileSync("test_valid.pdf", buffer);

    console.log("\n--- STARTING VALID TEST against http://localhost:3000/api/analyze ---");

    const formData = new FormData();
    const blob = new Blob([buffer], { type: "application/pdf" });
    formData.append("resume", blob, "test_valid.pdf");

    try {
        const response = await fetch("http://localhost:3000/api/analyze", {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log(`Response:`, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }

    fs.unlinkSync("test_valid.pdf");
}

runValidTest();
