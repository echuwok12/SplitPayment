import { Card, CardContent } from "@/components/ui/card";
import type { MemberWithBalance } from "@shared/schema";

interface MemberBalanceCardProps {
  member: MemberWithBalance;
}

export default function MemberBalanceCard({ member }: MemberBalanceCardProps) {
  const getBalanceClass = (balance: string) => {
    const value = parseFloat(balance);
    if (value > 0) return "balance-positive";
    if (value < 0) return "balance-negative";
    return "balance-neutral";
  };

  const getBalanceLabel = (balance: string) => {
    const value = parseFloat(balance);
    if (value > 0) return "gets back";
    if (value < 0) return "owes";
    return "settled";
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 member-avatar rounded-full flex items-center justify-center text-white font-semibold">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-foreground" data-testid="text-member-name">
                {member.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Paid: <span className="font-mono" data-testid="text-total-paid">${parseFloat(member.totalPaid).toFixed(2)}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-mono font-semibold ${getBalanceClass(member.balance)}`} data-testid="text-balance">
              {parseFloat(member.balance) >= 0 ? '+' : ''}${parseFloat(member.balance).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">{getBalanceLabel(member.balance)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
