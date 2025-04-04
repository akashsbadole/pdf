import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const pdfJobs = pgTable("pdf_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  jobName: text("job_name").notNull(),
  jobType: text("job_type").notNull(), // merge, split, compress, etc.
  inputFileNames: text("input_file_names").array().notNull(),
  outputFileName: text("output_file_name").notNull(),
  status: text("status").notNull(), // pending, completed, failed
  createdAt: text("created_at").notNull(), // ISO date string
  fileSize: integer("file_size"), // size in bytes
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPdfJobSchema = createInsertSchema(pdfJobs).pick({
  jobName: true,
  jobType: true,
  inputFileNames: true,
  outputFileName: true,
  status: true,
  createdAt: true,
  fileSize: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPdfJob = z.infer<typeof insertPdfJobSchema>;
export type PdfJob = typeof pdfJobs.$inferSelect;
