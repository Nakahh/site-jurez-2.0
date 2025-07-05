import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden border-amber-200 shadow-md">
      <div className="relative">
        <div className="w-full h-64 bg-gray-200 animate-pulse" />
        <div className="absolute top-3 left-3 w-16 h-6 bg-gray-300 rounded animate-pulse" />
        <div className="absolute top-3 right-3 flex gap-2">
          <div className="w-8 h-8 bg-gray-300 rounded animate-pulse" />
          <div className="w-8 h-8 bg-gray-300 rounded animate-pulse" />
        </div>
      </div>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="w-20 h-5 bg-gray-200 rounded animate-pulse" />
          <div className="w-16 h-5 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-full h-6 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="w-32 h-8 bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
          <div className="w-20 h-10 bg-gray-200 rounded animate-pulse" />
          <div className="w-12 h-10 bg-gray-200 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="border-amber-200 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex space-x-4 p-4 border-b">
        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="w-28 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex space-x-4 p-4">
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-28 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="border-amber-200 shadow-md">
      <CardHeader>
        <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="w-64 h-4 bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="w-full h-64 bg-gray-200 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

export function BlogPostSkeleton() {
  return (
    <Card className="overflow-hidden border-amber-200 shadow-md">
      <div className="w-full h-48 bg-gray-200 animate-pulse" />
      <CardHeader className="p-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-full h-6 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between">
          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="w-full h-10 bg-gray-200 rounded animate-pulse" />

      <div className="w-28 h-6 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="w-full h-10 bg-gray-200 rounded animate-pulse" />

      <div className="w-36 h-6 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="w-full h-24 bg-gray-200 rounded animate-pulse" />

      <div className="flex gap-2 justify-end">
        <div className="w-20 h-10 bg-gray-200 rounded animate-pulse" />
        <div className="w-16 h-10 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
