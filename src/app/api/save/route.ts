import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Website from "@/models/Website";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    await connectToDatabase();

    const website = await Website.create(data);

    return NextResponse.json({ success: true, id: website._id });
  } catch (error: any) {
    console.error("Save Website Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const websites = await Website.find({}).sort({ updatedAt: -1 });
    return NextResponse.json(websites);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
