import mongoose, { Schema, Document } from "mongoose";

export interface IWebsite extends Document {
  name: string;
  type: string;
  code: {
    html: string;
    css: string;
    js: string;
  };
  screenshot?: string; // Base64 or URL
  canvasState: any; // Store tldraw shapes/state
  createdAt: Date;
  updatedAt: Date;
}

const WebsiteSchema: Schema = new Schema(
  {
    name: { type: String, default: "Untitled Site" },
    type: { type: String, required: true },
    code: {
      html: { type: String, required: true },
      css: { type: String, default: "" },
      js: { type: String, default: "" },
    },
    screenshot: { type: String },
    canvasState: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.models.Website || mongoose.model<IWebsite>("Website", WebsiteSchema);
