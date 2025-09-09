import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

const MarketingLayout: React.FC<MarketingLayoutProps> = ({ children }) => {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BV</span>
              </div>
              <span className="font-bold text-xl">BitVend</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive(item.href) ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="w-9 px-0"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
              
              <Button asChild size="sm">
                <Link to="/auth?mode=signup">
                  Start Free Trial
                </Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="w-9 px-0"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-9 px-0"
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border">
              <div className="py-4 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "block px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                      isActive(item.href) ? "text-primary" : "text-muted-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 space-y-2 border-t border-border">
                  <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="w-full">
                    <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                      Start Free Trial
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="h-6 w-6 bg-gradient-to-br from-orange-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">BV</span>
                </div>
                <span className="text-lg font-bold">BitVend</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                The modern POS system for growing businesses. Streamline operations, 
                boost sales, and delight customers.
              </p>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="/integrations" className="hover:text-primary transition-colors">Integrations</Link></li>
                <li><Link to="/security" className="hover:text-primary transition-colors">Security</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link to="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link to="/api" className="hover:text-primary transition-colors">API Reference</Link></li>
                <li><Link to="/status" className="hover:text-primary transition-colors">System Status</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 BitVend POS. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingLayout;