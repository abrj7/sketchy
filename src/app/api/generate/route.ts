import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODEL_NAME = 'gemini-2.5-flash';

// Compact style rules
function getCompactStyleRules(style: string): string {
  const rules: Record<string, string> = {
    modern: 'Clean sans-serif, 0.5-1rem radius, soft shadows, smooth transitions, gradient accents',
    minimalist: 'Max whitespace (8rem padding), sharp corners, no shadows, outlined buttons, <5% accent usage',
    retro: 'Monospace/serif mix, 0 radius, bold offset shadows (4px 4px), thick borders (3px), flat colors, 80s aesthetic',
    playful: 'Rounded fonts (Poppins), 1.5-3rem radius, bright gradients, bouncy hover (scale 1.05), emoji icons',
    professional: 'Serif headings, conservative radius (0.25rem), subtle shadows, structured grid, trust indicators',
    brutalist: 'Heavy sans-serif, 0 radius, no transitions, asymmetric layout, high contrast, raw aesthetic, huge bold text'
  };
  return rules[style] || rules.modern;
}

function getTextColor(bg: string): string {
  const hex = bg.replace('#', '');
  if (hex.length !== 6) return '#1f2937';
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1f2937' : '#f9fafb';
}

export async function POST(req: Request) {
  try {
    const { image, style, backgroundColor, accentColor, currentHtml } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const finalStyle = style || 'modern';
    const finalBgColor = backgroundColor || '#ffffff';
    const finalAccentColor = accentColor || '#3b82f6';

    let systemPrompt = `You are an expert website generator. Create a professional website from the user's sketch.
    
## STYLE CONSTRAINTS:
Style: ${finalStyle}
Background: ${finalBgColor}
Accent: ${finalAccentColor}
Rules: ${getCompactStyleRules(finalStyle)}

## GUIDELINES:
1. USE EXTERNAL ICONS: Use Lucide icons (via CDN/SVG) or simple font icons. Avoid generating massive custom SVG paths that bloat the code.
2. BE CONCISE: Only generate necessary HTML/CSS. 
3. JSON ONLY: Return strictly a JSON object. No other text.
`;

    if (currentHtml) {
      systemPrompt += `
## TASK: UPDATE EXISTING CODE
Update the following code to match the new sketch changes.
${currentHtml}

## UPDATE STRATEGY:
- Modify only changed parts.
- Preserve existing structure where it matches.
- MUST return COMPLETE CSS in the 'css' field.

OUTPUT FORMAT:
{
  "html": "updated body content only",
  "css": "THE COMPLETE UPDATED CSS",
  "js": ""
}
`;
    } else {
      systemPrompt += `
## TASK: NEW GENERATION
Create a complete website body content and CSS.

OUTPUT FORMAT:
{
  "html": "body content with sections, forms, cards as sketched",
  "css": "complete, responsive CSS with :root variables",
  "js": ""
}
`;
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    
    const result = await model.generateContent({
      contents: [{ 
        role: "user", 
        parts: [
          { text: systemPrompt },
          { inlineData: { mimeType: 'image/png', data: base64Data } }
        ] 
      }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 12000, // Increased further
        temperature: 0.4,
      }
    });

    const response = result.response;
    const text = response.text();
    const finishReason = response.candidates?.[0]?.finishReason;

    console.log(`📡 Generation finished. Reason: ${finishReason} | Length: ${text.length}`);
    
    try {
      const code = JSON.parse(text);
      return NextResponse.json(code);
    } catch (parseError) {
      console.error("❌ Failed to parse AI response. Finish Reason:", finishReason);
      console.error("Partial text:", text.substring(text.length - 200));
      return NextResponse.json({ 
        error: "AI response was incomplete. Please try again with a simpler sketch.",
        raw: text.substring(0, 1000),
        reason: finishReason
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


