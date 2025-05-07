
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-sophera-gradient-start to-sophera-gradient-end">
      <Card className="w-full max-w-md mx-4 bg-sophera-bg-card border-sophera-border-primary rounded-sophera-card shadow-lg">
        <CardContent className="pt-8 pb-8 px-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="h-10 w-10 text-sophera-accent-secondary flex-shrink-0" />
            <h1 className="text-2xl font-bold text-sophera-text-heading">404 Page Not Found</h1>
          </div>
          <p className="mt-2 text-sophera-text-body">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="mt-6 pt-6 border-t border-sophera-border-subtle">
            <a 
              href="/"
              className="inline-flex items-center justify-center rounded-sophera-button bg-sophera-brand-primary text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-sophera-brand-primary-dark transition-colors"
            >
              Return Home
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
