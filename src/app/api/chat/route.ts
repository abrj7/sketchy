import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODEL_NAME = 'gemini-2.5-flash';

function getStyleEditingRules(style: string): string {
  const rules: Record<string, string> = {
    modern: `Keep clean lines, subtle shadows, generous whitespace. Use smooth transitions (0.3s ease).`,
    minimalistic: `Maximize whitespace, use minimal colors. No gradients or animations. Keep it ultra-clean.`,
    retro: `Use sharp corners, offset shadows, monospace fonts. Think 80s/90s computing aesthetic.`,
    dynamic: `Use rounded corners, bouncy animations, vibrant colors. Keep it playful and energetic.`,
    glassmorphism: `Use backdrop-filter blur effects, semi-transparent backgrounds, subtle borders.`,
    brutalist: `Sharp corners, bold borders, high contrast. Raw, typography-heavy aesthetic.`
  };
  return rules[style] || rules.modern;
}

export async function POST(req: Request) {
  try {
    const { message, currentHtml, style, backgroundColor, accentColor } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!currentHtml) {
      return NextResponse.json({ error: "No website to edit. Generate a website first!" }, { status: 400 });
    }

    const finalStyle = style || 'modern';
    const finalBgColor = backgroundColor || '#ffffff';
    const finalAccentColor = accentColor || '#3b82f6';

    const systemPrompt = `You are an EXPERT WEBSITE EDITOR AI. 
    
## CURRENT WEBSITE CODE:
${currentHtml}

## DESIGN SYSTEM:
STYLE: ${finalStyle}
BACKGROUND: ${finalBgColor}
ACCENT: ${finalAccentColor}
RULES: ${getStyleEditingRules(finalStyle)}

## USER'S EDIT REQUEST:
"${message}"

## EDITING RULES:
1. ONLY modify what is requested.
2. Maintain color palette consistency.
3. Return STRICTLY a JSON object.
4. Avoid generating massive SVGs; keep it concise.

## OUTPUT FORMAT (JSON ONLY):
{
  "html": "BODY CONTENT ONLY",
  "css": "Complete updated CSS",
  "js": "",
  "changes": "Brief description of what was changed"
}
`;

    console.log(`✏️ Editing website with ${MODEL_NAME}`);

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
        temperature: 0.3,
      }
    });

    const text = result.response.text();
    const finishReason = result.response.candidates?.[0]?.finishReason;
    
    try {
      const code = JSON.parse(text);
      console.log(`✅ Edit applied by ${MODEL_NAME}. Reason: ${finishReason}`);
      return NextResponse.json(code);
    } catch (parseError) {
      console.error("❌ Failed to parse chat response:", text);
      return NextResponse.json({ 
        error: "Failed to apply changes safely. Please try a simpler request.",
        raw: text.substring(0, 500)
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
