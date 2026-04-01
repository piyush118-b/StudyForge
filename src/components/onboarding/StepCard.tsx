import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface StepCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function StepCard({ title, description, children }: StepCardProps) {
  return (
    <Card className="w-full bg-slate-900 border-white/10 shadow-2xl overflow-hidden glassmorphism">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-white tracking-wide">{title}</CardTitle>
        <CardDescription className="text-slate-400 text-sm md:text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  );
}
