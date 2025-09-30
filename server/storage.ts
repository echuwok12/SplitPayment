import { 
  users, folders, members, expenses, expenseShares,
  type User, type InsertUser,
  type Folder, type InsertFolder, type FolderWithStats,
  type Member, type InsertMember, type MemberWithBalance,
  type Expense, type InsertExpense, type ExpenseWithDetails,
  type ExpenseShare, type InsertExpenseShare
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, and, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Folders
  getFolders(userId: string): Promise<FolderWithStats[]>;
  getFolder(id: string): Promise<Folder | undefined>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: string, folder: Partial<InsertFolder>): Promise<Folder>;

  // Members
  getFolderMembers(folderId: string): Promise<MemberWithBalance[]>;
  getMember(id: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: string, member: Partial<InsertMember>): Promise<Member>;

  // Expenses
  getFolderExpenses(folderId: string): Promise<ExpenseWithDetails[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense, shares: InsertExpenseShare[]): Promise<Expense>;
  updateExpense(id: string, expense: Partial<InsertExpense>): Promise<Expense>;

  // Expense Shares
  getExpenseShares(expenseId: string): Promise<ExpenseShare[]>;
  createExpenseShare(share: InsertExpenseShare): Promise<ExpenseShare>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser) 
      .returning();
    return user;
  }

  // Folders
  async getFolders(userId: string): Promise<FolderWithStats[]> {
    const result = await db
      .select({
        id: folders.id,
        name: folders.name,
        description: folders.description,
        startDate: folders.startDate,
        createdAt: folders.createdAt,
        createdBy: folders.createdBy,
        isActive: folders.isActive,
        memberCount: sql<number>`count(distinct ${members.id})`,
        totalExpenses: sql<string>`coalesce(sum(${expenses.amount}), 0)`,
      })
      .from(folders)
      .leftJoin(members, eq(folders.id, members.folderId))
      .leftJoin(expenses, eq(folders.id, expenses.folderId))
      .where(eq(folders.createdBy, userId))
      .groupBy(folders.id)
      .orderBy(desc(folders.createdAt));

    // Calculate user balance for each folder
    const foldersWithStats: FolderWithStats[] = [];
    
    for (const folder of result) {
      const userMember = await db
        .select()
        .from(members)
        .where(and(eq(members.folderId, folder.id), eq(members.userId, userId)))
        .limit(1);

      let userBalance = "0.00";
      
      if (userMember.length > 0) {
        const balanceResult = await db
          .select({
            totalPaid: sql<string>`coalesce(sum(case when ${expenses.paidBy} = ${userMember[0].id} then ${expenses.amount} else 0 end), 0)`,
            totalOwed: sql<string>`coalesce(sum(${expenseShares.amount}), 0)`,
          })
          .from(expenseShares)
          .leftJoin(expenses, eq(expenseShares.expenseId, expenses.id))
          .where(eq(expenseShares.memberId, userMember[0].id));

        if (balanceResult.length > 0) {
          const totalPaid = parseFloat(balanceResult[0].totalPaid);
          const totalOwed = parseFloat(balanceResult[0].totalOwed);
          userBalance = (totalPaid - totalOwed).toFixed(2);
        }
      }

      foldersWithStats.push({
        ...folder,
        userBalance,
      });
    }

    return foldersWithStats;
  }

  async getFolder(id: string): Promise<Folder | undefined> {
    const [folder] = await db.select().from(folders).where(eq(folders.id, id));
    return folder || undefined;
  }

  async createFolder(insertFolder: InsertFolder): Promise<Folder> {
    try {
      const [folder] = await db
        .insert(folders)
        .values(insertFolder)
        .returning();
      return folder;
    } catch (err) {
      console.error("DB insert error in createFolder:", err);
      throw err;
    }
  }


  async updateFolder(id: string, insertFolder: Partial<InsertFolder>): Promise<Folder> {
    const [folder] = await db
      .update(folders)
      .set(insertFolder)
      .where(eq(folders.id, id))
      .returning();
    return folder;
  }

  // Members
  async getFolderMembers(folderId: string): Promise<MemberWithBalance[]> {
    const result = await db
      .select({
        id: members.id,
        folderId: members.folderId,
        userId: members.userId,
        name: members.name,
        isActive: members.isActive,
        totalPaid: sql<string>`coalesce(sum(case when ${expenses.paidBy} = ${members.id} then ${expenses.amount} else 0 end), 0)`,
        totalOwed: sql<string>`coalesce(sum(${expenseShares.amount}), 0)`,
      })
      .from(members)
      .leftJoin(expenses, eq(members.id, expenses.paidBy))
      .leftJoin(expenseShares, eq(members.id, expenseShares.memberId))
      .where(eq(members.folderId, folderId))
      .groupBy(members.id);

    return result.map(member => ({
      ...member,
      balance: (parseFloat(member.totalPaid) - parseFloat(member.totalOwed)).toFixed(2),
    }));
  }

  async getMember(id: string): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    return member || undefined;
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const [member] = await db
      .insert(members)
      .values(insertMember)
      .returning();
    return member;
  }

  async updateMember(id: string, insertMember: Partial<InsertMember>): Promise<Member> {
    const [member] = await db
      .update(members)
      .set(insertMember)
      .where(eq(members.id, id))
      .returning();
    return member;
  }

  // Expenses
  async getFolderExpenses(folderId: string): Promise<ExpenseWithDetails[]> {
    const result = await db
      .select({
        id: expenses.id,
        folderId: expenses.folderId,
        description: expenses.description,
        amount: expenses.amount,
        paidBy: expenses.paidBy,
        splitType: expenses.splitType,
        createdAt: expenses.createdAt,
        paidByName: members.name,
      })
      .from(expenses)
      .innerJoin(members, eq(expenses.paidBy, members.id))
      .where(eq(expenses.folderId, folderId))
      .orderBy(desc(expenses.createdAt));

    // Calculate user share for each expense
    const expensesWithDetails: ExpenseWithDetails[] = [];
    
    for (const expense of result) {
      // Get user's share for this expense
      const shareResult = await db
        .select({ amount: expenseShares.amount })
        .from(expenseShares)
        .where(eq(expenseShares.expenseId, expense.id))
        .limit(1);

      const userShare = shareResult.length > 0 ? shareResult[0].amount : "0.00";

      expensesWithDetails.push({
        ...expense,
        userShare,
      });
    }

    return expensesWithDetails;
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense || undefined;
  }

  async createExpense(insertExpense: InsertExpense, shares: InsertExpenseShare[]): Promise<Expense> {
    return db.transaction(async (tx) => {
      const [expense] = await tx
        .insert(expenses)
        .values(insertExpense)
        .returning();

      // Create expense shares
      if (shares.length > 0) {
        await tx
          .insert(expenseShares)
          .values(shares.map(share => ({ ...share, expenseId: expense.id })));
      }

      return expense;
    });
  }

  async updateExpense(id: string, insertExpense: Partial<InsertExpense>): Promise<Expense> {
    const [expense] = await db
      .update(expenses)
      .set(insertExpense)
      .where(eq(expenses.id, id))
      .returning();
    return expense;
  }

  // Expense Shares
  async getExpenseShares(expenseId: string): Promise<ExpenseShare[]> {
    return db.select().from(expenseShares).where(eq(expenseShares.expenseId, expenseId));
  }

  async createExpenseShare(insertShare: InsertExpenseShare): Promise<ExpenseShare> {
    const [share] = await db
      .insert(expenseShares)
      .values(insertShare)
      .returning();
    return share;
  }
}

export const storage = new DatabaseStorage();
