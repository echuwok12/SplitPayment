import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ExpenseWithDetails } from "@shared/schema";

interface ExpenseCardProps {
  expense: ExpenseWithDetails;
}

export default function ExpenseCard({ expense }: ExpenseCardProps) {
  return (
    <Card className="expense-card transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="font-medium text-foreground" data-testid="text-expense-description">
                {expense.description}
              </h4>
              <Badge variant="outline" className="text-xs">
                {expense.splitType === "equal" ? "Equal Split" : "Custom Split"}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>
                Paid by <span className="font-medium" data-testid="text-paid-by">{expense.paidByName}</span>
              </span>
              <span data-testid="text-expense-date">
                {new Date(expense.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono font-semibold text-foreground" data-testid="text-expense-amount">
              ${parseFloat(expense.amount).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              Your share: <span className="font-mono" data-testid="text-user-share">${parseFloat(expense.userShare).toFixed(2)}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
