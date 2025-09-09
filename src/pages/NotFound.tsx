import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <div className="mb-4">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-foreground">404</h1>
          <p className="text-xl text-muted-foreground mb-6">Oops! Page not found</p>
          <p className="text-sm text-muted-foreground mb-6">
            The page you're looking for doesn't exist in the Bit Vend POS system.
          </p>
          <Button 
            onClick={() => window.location.href = "/"} 
            className="btn-pos-primary gap-2"
          >
            <Home size={16} />
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
