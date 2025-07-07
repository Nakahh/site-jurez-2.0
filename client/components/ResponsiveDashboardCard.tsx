import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Responsive Stats Card Component
interface ResponsiveStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  description?: string;
  trend?: string;
  trendDirection?: "up" | "down";
  color?: string;
  className?: string;
}

export function ResponsiveStatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendDirection = "up",
  color = "primary",
  className,
}: ResponsiveStatsCardProps) {
  return (
    <Card className={cn("hover:shadow-lg transition-shadow h-full", className)}>
      <CardContent className="p-4 lg:p-6 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <div
            className={`h-10 w-10 lg:h-12 lg:w-12 bg-${color}/10 rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <Icon className={`h-5 w-5 lg:h-6 lg:w-6 text-${color}`} />
          </div>
        </div>
        {trend && (
          <div className="flex items-center mt-auto pt-3 border-t">
            {trendDirection === "up" ? (
              <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-green-600 mr-1 flex-shrink-0" />
            ) : (
              <TrendingDown className="h-3 w-3 lg:h-4 lg:w-4 text-red-600 mr-1 flex-shrink-0" />
            )}
            <span
              className={`text-xs sm:text-sm font-medium truncate ${
                trendDirection === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Responsive Action Card Component
interface ResponsiveActionCardProps {
  title: string;
  description?: string;
  icon: React.ComponentType<any>;
  onClick?: () => void;
  className?: string;
  iconColor?: string;
  disabled?: boolean;
}

export function ResponsiveActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  className,
  iconColor = "blue-600",
  disabled = false,
}: ResponsiveActionCardProps) {
  return (
    <Card
      className={cn(
        "border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      onClick={!disabled ? onClick : undefined}
    >
      <CardContent className="p-4 lg:p-6 text-center h-full flex flex-col justify-center">
        <div
          className={`w-12 h-12 lg:w-16 lg:h-16 bg-${iconColor.split("-")[0]}-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4`}
        >
          <Icon className={`h-6 w-6 lg:h-8 lg:w-8 text-${iconColor}`} />
        </div>
        <h3 className="font-bold mb-2 text-sm lg:text-base line-clamp-1">
          {title}
        </h3>
        {description && (
          <p className="text-xs lg:text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Responsive List Item Component
interface ResponsiveListItemProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveListItem({
  children,
  className,
}: ResponsiveListItemProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors space-y-3 sm:space-y-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

// Responsive Info Card Component
interface ResponsiveInfoCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  className?: string;
}

export function ResponsiveInfoCard({
  title,
  value,
  subtitle,
  badge,
  className,
}: ResponsiveInfoCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="p-4 lg:p-6 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
          {badge && (
            <Badge
              variant={badge.variant || "default"}
              className="text-xs flex-shrink-0 ml-2"
            >
              {badge.text}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Responsive Grid Container Component
interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    base: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function ResponsiveGrid({
  children,
  cols = { base: 1, sm: 2, lg: 3 },
  gap = "md",
  className,
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: "gap-2 lg:gap-4",
    md: "gap-4 lg:gap-6",
    lg: "gap-6 lg:gap-8",
  };

  const gridClasses = [
    `grid-cols-${cols.base}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("grid", gridClasses, gapClasses[gap], className)}>
      {children}
    </div>
  );
}

// Export all components
export {
  ResponsiveStatsCard as StatsCard,
  ResponsiveActionCard as ActionCard,
  ResponsiveListItem as ListItem,
  ResponsiveInfoCard as InfoCard,
  ResponsiveGrid as Grid,
};
