import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Project from "@/lib/models/Project";

// GET - List user's projects
export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const projects = await Project.find({ userId })
            .sort({ updatedAt: -1 })
            .select("_id name updatedAt createdAt")
            .limit(20);

        return NextResponse.json({ projects });
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json(
            { error: "Failed to fetch projects" },
            { status: 500 }
        );
    }
}

// POST - Create new project with auto-generated unique name
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Find existing "Untitled document" projects to generate unique name
        const existingUntitled = await Project.find({
            userId,
            name: { $regex: /^Untitled document( \(\d+\))?$/ },
        }).select("name");

        let newName = "Untitled document";

        if (existingUntitled.length > 0) {
            // Extract numbers from existing names
            const numbers = existingUntitled.map((p) => {
                const match = p.name.match(/\((\d+)\)$/);
                return match ? parseInt(match[1]) : 1;
            });

            // Find next available number
            const maxNumber = Math.max(...numbers, 1);
            newName = `Untitled document (${maxNumber + 1})`;
        }

        const project = await Project.create({
            userId,
            name: newName,
            canvasData: null,
            generatedHtml: "",
        });

        return NextResponse.json(
            {
                message: "Project created",
                project: {
                    id: project._id.toString(),
                    name: project.name,
                    createdAt: project.createdAt,
                    updatedAt: project.updatedAt,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json(
            { error: "Failed to create project" },
            { status: 500 }
        );
    }
}
