import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Project from "@/lib/models/Project";

interface RouteContext {
    params: Promise<{ id: string }>;
}

// GET - Get single project
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        await connectToDatabase();

        const project = await Project.findById(id);

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            project: {
                id: project._id.toString(),
                userId: project.userId,
                name: project.name,
                canvasData: project.canvasData,
                generatedHtml: project.generatedHtml,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error fetching project:", error);
        return NextResponse.json(
            { error: "Failed to fetch project" },
            { status: 500 }
        );
    }
}

// PUT - Update project (name, canvasData, generatedHtml)
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { name, canvasData, generatedHtml } = body;

        await connectToDatabase();

        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (canvasData !== undefined) updateData.canvasData = canvasData;
        if (generatedHtml !== undefined) updateData.generatedHtml = generatedHtml;

        const project = await Project.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Project updated",
            project: {
                id: project._id.toString(),
                name: project.name,
                updatedAt: project.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error updating project:", error);
        return NextResponse.json(
            { error: "Failed to update project" },
            { status: 500 }
        );
    }
}

// DELETE - Delete project
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        await connectToDatabase();

        const project = await Project.findByIdAndDelete(id);

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Project deleted" });
    } catch (error) {
        console.error("Error deleting project:", error);
        return NextResponse.json(
            { error: "Failed to delete project" },
            { status: 500 }
        );
    }
}
