import { Receipt, Bell, User } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Receipt className="text-primary-foreground text-sm" size={16} />
              </div>
              <span className="text-xl font-bold text-foreground">VNShare</span>
            </div>
            <span className="text-muted-foreground">Group Expense Tracker</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-muted-foreground hover:text-foreground" data-testid="button-notifications">
              <Bell size={18} />
            </button>
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="text-muted-foreground text-sm" size={16} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
