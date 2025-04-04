import { users, type User, type InsertUser, pdfJobs, type PdfJob, type InsertPdfJob } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getPdfJob(id: number): Promise<PdfJob | undefined>;
  createPdfJob(job: InsertPdfJob): Promise<PdfJob>;
  updatePdfJob(id: number, job: Partial<InsertPdfJob>): Promise<PdfJob | undefined>;
  getPdfJobsByUserId(userId: number | null): Promise<PdfJob[]>;
  getRecentPdfJobs(limit: number): Promise<PdfJob[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pdfJobs: Map<number, PdfJob>;
  private currentUserId: number;
  private currentPdfJobId: number;

  constructor() {
    this.users = new Map();
    this.pdfJobs = new Map();
    this.currentUserId = 1;
    this.currentPdfJobId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getPdfJob(id: number): Promise<PdfJob | undefined> {
    return this.pdfJobs.get(id);
  }

  async createPdfJob(insertJob: InsertPdfJob): Promise<PdfJob> {
    const id = this.currentPdfJobId++;
    const job: PdfJob = { ...insertJob, id, userId: null };
    this.pdfJobs.set(id, job);
    return job;
  }

  async updatePdfJob(id: number, updatedFields: Partial<InsertPdfJob>): Promise<PdfJob | undefined> {
    const job = this.pdfJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updatedFields };
    this.pdfJobs.set(id, updatedJob);
    return updatedJob;
  }

  async getPdfJobsByUserId(userId: number | null): Promise<PdfJob[]> {
    return Array.from(this.pdfJobs.values())
      .filter(job => job.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getRecentPdfJobs(limit: number): Promise<PdfJob[]> {
    return Array.from(this.pdfJobs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
