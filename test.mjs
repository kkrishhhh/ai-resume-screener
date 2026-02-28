import fs from "fs";
import { jsPDF } from "jspdf";

async function runTests() {
    console.log("Generating Test Files...");

    // 1. Text file pretending to be PDF
    fs.writeFileSync("test_fake.pdf", "Hello World this is not a PDF");

    // 2. Blank PDF
    const blankDoc = new jsPDF();
    fs.writeFileSync("test_blank.pdf", Buffer.from(blankDoc.output("arraybuffer")));

    // 3. Corrupt PDF
    const corruptBuffer = Buffer.alloc(1024);
    for (let i = 0; i < 1024; i++) corruptBuffer[i] = Math.floor(Math.random() * 256);
    fs.writeFileSync("test_corrupt.pdf", corruptBuffer);

    // 4. Short Text PDF (Should fail validation for < 50 chars)
    const shortDoc = new jsPDF();
    shortDoc.text("Too short!", 10, 10);
    fs.writeFileSync("test_short.pdf", Buffer.from(shortDoc.output("arraybuffer")));

    const files = [
        { name: "test_fake.pdf", desc: "Fake PDF (Plain Text)" },
        { name: "test_blank.pdf", desc: "Blank PDF" },
        { name: "test_corrupt.pdf", desc: "Corrupt/Random Bytes PDF" },
        { name: "test_short.pdf", desc: "PDF with very little text (< 50 chars)" },
    ];

    console.log("\n--- STARTING TESTS against http://localhost:3000/api/analyze ---");

    for (const file of files) {
        console.log(`\nTesting: ${file.desc}`);
        const formData = new FormData();
        const blob = new Blob([fs.readFileSync(file.name)], { type: "application/pdf" });
        formData.append("resume", blob, file.name);

        try {
            const response = await fetch("http://localhost:3000/api/analyze", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            console.log(`Status: ${response.status}`);
            console.log(`Response:`, data);
        } catch (e) {
            console.error("Fetch failed:", e.message);
        }
    }

    // Cleanup
    for (const file of files) {
        fs.unlinkSync(file.name);
    }
}

runTests();
