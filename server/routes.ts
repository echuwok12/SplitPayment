import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFolderSchema, insertMemberSchema, insertExpenseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Folders
  app.get("/api/folders", async (req, res) => {
    try {
      // For demo purposes, using a hardcoded user ID
      // In production, this would come from authentication
      const userId = "demo-user-id";
      const folders = await storage.getFolders(userId);
      res.json(folders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch folders" });
    }
  });

  app.get("/api/folders/:id", async (req, res) => {
    try {
      const folder = await storage.getFolder(req.params.id);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      res.json(folder);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch folder" });
    }
  });

  app.post("/api/folders", async (req, res) => {
    try {
      const validatedData = insertFolderSchema.parse({
        ...req.body,
        createdBy: "demo-user-id", // In production, get from auth
      });
      const folder = await storage.createFolder(validatedData);
      res.status(201).json(folder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create folder" });
    }
  });

  // Members
  app.get("/api/folders/:folderId/members", async (req, res) => {
    try {
      const members = await storage.getFolderMembers(req.params.folderId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.post("/api/folders/:folderId/members", async (req, res) => {
    try {
      const validatedData = insertMemberSchema.parse({
        ...req.body,
        folderId: req.params.folderId,
      });
      const member = await storage.createMember(validatedData);
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create member" });
    }
  });

  // Expenses
  app.get("/api/folders/:folderId/expenses", async (req, res) => {
    try {
      const expenses = await storage.getFolderExpenses(req.params.folderId);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/folders/:folderId/expenses", async (req, res) => {
    try {
      const { shares, ...expenseData } = req.body;
      
      const validatedExpense = insertExpenseSchema.parse({
        ...expenseData,
        folderId: req.params.folderId,
      });

      // Validate shares if provided
      const validatedShares = shares || [];
      
      const expense = await storage.createExpense(validatedExpense, validatedShares);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  // Balances (summary endpoint)
  app.get("/api/folders/:folderId/balances", async (req, res) => {
    try {
      const members = await storage.getFolderMembers(req.params.folderId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch balances" });
    }
  });

  // Summary/Report endpoint
  app.get("/api/folders/:folderId/summary", async (req, res) => {
    try {
      const folder = await storage.getFolder(req.params.folderId);
      const members = await storage.getFolderMembers(req.params.folderId);
      const expenses = await storage.getFolderExpenses(req.params.folderId);

      const summary = {
        folder,
        members,
        expenses,
        totalExpenses: expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0),
        memberCount: members.length,
      };

      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate summary" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
