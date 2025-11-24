import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "destructive";
  trend?: string;
}

export const StatCard = ({ title, value, icon: Icon, variant = "default", trend }: StatCardProps) => {
  const colors = {
    default: "text-primary",
    success: "text-green-600",
    destructive: "text-red-600",
  };

  const bgColors = {
    default: "bg-primary/10",
    success: "bg-green-500/10",
    destructive: "bg-red-500/10",
  };

  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-full", bgColors[variant])}>
            <Icon className={cn("w-6 h-6", colors[variant])} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
