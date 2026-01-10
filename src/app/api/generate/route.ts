import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { image, type, prompt } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    // Initialize Gemini 1.5 Flash (ideal for speed/vision)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `
      You are an expert web developer. 
      Analyze the attached hand-drawn sketch and convert it into a fully functional, high-quality website.
      The website type is: ${type}.
      
      Requirements:
      1. Return a single JSON object with "html", "css", and "js" fields.
      2. Use semantic HTML5.
      3. Use modern, premium Vanilla CSS (gradients, shadows, clean typography).
      4. Ensure responsiveness.
      5. The code should be self-contained and ready to be rendered in an iframe.
    `;

    // Process the base64 image
    const imageParts = [
      {
        inlineData: {
          data: image.split(",")[1], // Remove metadata prefix if present
          mimeType: "image/png",
        },
      },
    ];

    const result = await model.generateContent([systemPrompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    // Note: In production, we'd add more robust JSON parsing logic here
    // For now, we'll assume Gemini returns clean JSON strings
    try {
      const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const code = JSON.parse(cleanedText);
      return NextResponse.json(code);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      return NextResponse.json({ error: "Invalid AI response format", raw: text }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
