import mongoose, { Document, Model, Schema } from "mongoose";

// TypeScript interface for Project
export interface IProject {
    userId: string;
    name: string;
    canvasData: Record<string, unknown> | null; // tldraw JSON snapshot
    generatedHtml: string;
    createdAt: Date;
    updatedAt: Date;
}

// Document interface (includes Mongoose methods)
export interface IProjectDocument extends IProject, Document {
    _id: mongoose.Types.ObjectId;
}

const ProjectSchema = new Schema<IProjectDocument>(
    {
        userId: {
            type: String,
            required: [true, "User ID is required"],
            index: true,
        },
        name: {
            type: String,
            required: [true, "Project name is required"],
            trim: true,
            default: "Untitled document",
        },
        canvasData: {
            type: Schema.Types.Mixed,
            default: null,
        },
        generatedHtml: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for listing user's projects
ProjectSchema.index({ userId: 1, updatedAt: -1 });

// Prevent model recompilation in development (Next.js hot reload)
const Project: Model<IProjectDocument> =
    mongoose.models.Project || mongoose.model<IProjectDocument>("Project", ProjectSchema);

export default Project;
