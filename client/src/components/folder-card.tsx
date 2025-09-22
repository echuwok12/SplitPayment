import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FolderWithStats } from "@shared/schema";

interface FolderCardProps {
  folder: FolderWithStats;
}

export default function FolderCard({ folder }: FolderCardProps) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setLocation(`/folders/${folder.id}`);
  };

  const getBalanceClass = (balance: string) => {
    const value = parseFloat(balance);
    if (value > 0) return "balance-positive";
    if (value < 0) return "balance-negative";
    return "balance-neutral";
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
      data-testid={`card-folder-${folder.id}`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-foreground mb-1" data-testid="text-folder-name">
              {folder.name}
            </h3>
            {folder.startDate && (
              <p className="text-sm text-muted-foreground">
                Started {new Date(folder.startDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <Badge variant={folder.isActive ? "secondary" : "outline"}>
            {folder.isActive ? "Active" : "Completed"}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Members</span>
            <span className="font-medium" data-testid="text-member-count">
              {folder.memberCount}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Expenses</span>
            <span className="font-mono font-medium" data-testid="text-total-expenses">
              ${parseFloat(folder.totalExpenses).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Your Balance</span>
            <span className={`font-mono font-medium ${getBalanceClass(folder.userBalance)}`} data-testid="text-user-balance">
              {parseFloat(folder.userBalance) >= 0 ? '+' : ''}${parseFloat(folder.userBalance).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
