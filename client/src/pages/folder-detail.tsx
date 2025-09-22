import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ArrowLeft, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ExpenseCard from "@/components/expense-card";
import MemberBalanceCard from "@/components/member-balance-card";
import AddExpenseModal from "@/components/add-expense-modal";
import type { Folder, ExpenseWithDetails, MemberWithBalance } from "@shared/schema";

export default function FolderDetail() {
  const [, params] = useRoute("/folders/:id");
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "expenses" | "balances" | "members">("overview");
  
  const folderId = params?.id;

  const { data: folder } = useQuery<Folder>({
    queryKey: ["/api/folders", folderId],
    enabled: !!folderId,
  });

  const { data: expenses } = useQuery<ExpenseWithDetails[]>({
    queryKey: ["/api/folders", folderId, "expenses"],
    enabled: !!folderId,
  });

  const { data: members } = useQuery<MemberWithBalance[]>({
    queryKey: ["/api/folders", folderId, "members"],
    enabled: !!folderId,
  });

  if (!folder) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Loading folder...</p>
        </div>
      </div>
    );
  }

  const totalExpenses = expenses?.reduce((sum, expense) => sum + parseFloat(expense.amount), 0) || 0;
  const recentExpenses = expenses?.slice(0, 3) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                data-testid="button-back"
              >
                <ArrowLeft size={16} />
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-foreground" data-testid="text-folder-name">
                  {folder.name}
                </h2>
                <p className="text-muted-foreground">
                  {members?.length || 0} members
                  {folder.startDate && ` • Started ${new Date(folder.startDate).toLocaleDateString()}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" data-testid="button-export-report">
                <Download size={16} className="mr-2" />
                Export Report
              </Button>
              <Button onClick={() => setShowAddExpenseModal(true)} data-testid="button-add-expense">
                <Plus size={16} className="mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {[
              { key: "overview", label: "Overview" },
              { key: "expenses", label: "Expenses" },
              { key: "balances", label: "Balances" },
              { key: "members", label: "Members" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 text-sm font-medium ${
                  activeTab === tab.key
                    ? "tab-active"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`button-tab-${tab.key}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Expenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-mono" data-testid="text-total-expenses">
                      ${totalExpenses.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-member-count">
                      {members?.length || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={folder.isActive ? "secondary" : "outline"}>
                      {folder.isActive ? "Active" : "Completed"}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Expenses */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Recent Expenses</h3>
                  <div className="space-y-3">
                    {recentExpenses.length === 0 ? (
                      <p className="text-muted-foreground">No expenses yet</p>
                    ) : (
                      recentExpenses.map((expense) => (
                        <ExpenseCard key={expense.id} expense={expense} />
                      ))
                    )}
                  </div>
                </div>

                {/* Member Balances */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Member Balances</h3>
                  <div className="space-y-3">
                    {members?.length === 0 ? (
                      <p className="text-muted-foreground">No members yet</p>
                    ) : (
                      members?.map((member) => (
                        <MemberBalanceCard key={member.id} member={member} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "expenses" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">All Expenses</h3>
              {expenses?.length === 0 ? (
                <p className="text-muted-foreground">No expenses yet</p>
              ) : (
                expenses?.map((expense) => (
                  <ExpenseCard key={expense.id} expense={expense} />
                ))
              )}
            </div>
          )}

          {activeTab === "balances" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Member Balances</h3>
              {members?.length === 0 ? (
                <p className="text-muted-foreground">No members yet</p>
              ) : (
                members?.map((member) => (
                  <MemberBalanceCard key={member.id} member={member} />
                ))
              )}
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Folder Members</h3>
              {members?.length === 0 ? (
                <p className="text-muted-foreground">No members yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {members?.map((member) => (
                    <Card key={member.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 member-avatar rounded-full flex items-center justify-center text-white font-semibold">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground" data-testid={`text-member-name-${member.id}`}>
                              {member.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Paid: <span className="font-mono">${member.totalPaid}</span>
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AddExpenseModal
        open={showAddExpenseModal}
        onOpenChange={setShowAddExpenseModal}
        folderId={folderId!}
        members={members || []}
      />
    </div>
  );
}
