import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";
import { insertPdfJobSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const tempDir = path.join(os.tmpdir(), "pdftoolkit");
      
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      cb(null, tempDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max file size
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get recent PDF jobs
  app.get("/api/jobs/recent", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const jobs = await storage.getRecentPdfJobs(limit);
      res.json(jobs);
    } catch (error) {
      console.error("Error getting recent jobs:", error);
      res.status(500).json({ message: "Failed to get recent jobs" });
    }
  });

  // Create a new PDF job
  app.post("/api/jobs", async (req: Request, res: Response) => {
    try {
      const jobData = insertPdfJobSchema.parse(req.body);
      const newJob = await storage.createPdfJob(jobData);
      res.status(201).json(newJob);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid job data", errors: error.errors });
      } else {
        console.error("Error creating job:", error);
        res.status(500).json({ message: "Failed to create job" });
      }
    }
  });

  // Update a PDF job
  app.patch("/api/jobs/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updatedFields = req.body;
      
      const updatedJob = await storage.updatePdfJob(id, updatedFields);
      if (!updatedJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(updatedJob);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  // File upload endpoint for PDF processing
  app.post("/api/upload", upload.array("files"), (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      
      const fileInfos = files.map(file => ({
        filename: file.originalname,
        path: file.path,
        size: file.size
      }));
      
      res.json({ 
        message: "Files uploaded successfully", 
        files: fileInfos 
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
