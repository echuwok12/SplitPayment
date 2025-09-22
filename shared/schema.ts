import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, uuid, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
});

export const folders = pgTable("folders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  isActive: boolean("is_active").default(true).notNull(),
});

export const members = pgTable("members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  folderId: varchar("folder_id").notNull().references(() => folders.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  folderId: varchar("folder_id").notNull().references(() => folders.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paidBy: varchar("paid_by").notNull().references(() => members.id),
  splitType: text("split_type").notNull().default("equal"), // equal or custom
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const expenseShares = pgTable("expense_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  expenseId: varchar("expense_id").notNull().references(() => expenses.id, { onDelete: "cascade" }),
  memberId: varchar("member_id").notNull().references(() => members.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  folders: many(folders),
  members: many(members),
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [folders.createdBy],
    references: [users.id],
  }),
  members: many(members),
  expenses: many(expenses),
}));

export const membersRelations = relations(members, ({ one, many }) => ({
  folder: one(folders, {
    fields: [members.folderId],
    references: [folders.id],
  }),
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
  expensesPaid: many(expenses),
  expenseShares: many(expenseShares),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  folder: one(folders, {
    fields: [expenses.folderId],
    references: [folders.id],
  }),
  paidBy: one(members, {
    fields: [expenses.paidBy],
    references: [members.id],
  }),
  shares: many(expenseShares),
}));

export const expenseSharesRelations = relations(expenseShares, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseShares.expenseId],
    references: [expenses.id],
  }),
  member: one(members, {
    fields: [expenseShares.memberId],
    references: [members.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertFolderSchema = createInsertSchema(folders).omit({
  id: true,
  createdAt: true,
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
});

export const insertExpenseShareSchema = createInsertSchema(expenseShares).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Folder = typeof folders.$inferSelect;
export type InsertFolder = z.infer<typeof insertFolderSchema>;

export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type ExpenseShare = typeof expenseShares.$inferSelect;
export type InsertExpenseShare = z.infer<typeof insertExpenseShareSchema>;

// Extended types for API responses
export type FolderWithStats = Folder & {
  memberCount: number;
  totalExpenses: string;
  userBalance: string;
};

export type MemberWithBalance = Member & {
  totalPaid: string;
  totalOwed: string;
  balance: string;
};

export type ExpenseWithDetails = Expense & {
  paidByName: string;
  userShare: string;
};
