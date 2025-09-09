import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSearch } from '@/hooks/useSearch';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { SearchDropdown } from '@/components/ui/search-dropdown';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Search,
  Plus,
  Calculator,
  Globe,
  Mail,
  Bell,
  Settings,
  User,
  Menu,
  ChevronDown,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Custom hook for auto-hide tooltips
const useAutoHideTooltip = (delay = 2000) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    
    if (open) {
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Set new timeout to auto-hide
      const newTimeoutId = setTimeout(() => {
        setIsOpen(false);
      }, delay);
      
      setTimeoutId(newTimeoutId);
    } else {
      // Clear timeout if manually closed
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return { isOpen, handleOpenChange };
};

// ---------------- Theme Toggle ----------------
const goldenSun = "🌞", goldenMoon = "🌙";

interface TopbarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const Topbar: React.FC<TopbarProps> = ({
  collapsed,
  onToggleSidebar,
  darkMode,
  onToggleDarkMode,
}) => {
  const navigate = useNavigate();
  const { isAdmin, logout: adminLogout } = useAdminAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const { businesses, currentBusiness, setCurrentBusiness } = useBusiness();
  
  const {
    query,
    results,
    recentSearches,
    isOpen,
    setIsOpen,
    handleQueryChange,
    handleSearch,
    handleResultSelect,
    handleRecentSearchSelect,
    clearRecentSearches,
  } = useSearch();
  
  // Auto-hide tooltips
  const internetTooltip = useAutoHideTooltip(2000);
  const mailTooltip = useAutoHideTooltip(2000);
  const notificationTooltip = useAutoHideTooltip(2000);
  const settingsTooltip = useAutoHideTooltip(2000);
  const themeTooltip = useAutoHideTooltip(2000);
  const profileTooltip = useAutoHideTooltip(2000);

  useEffect(() => {
    const el = document.querySelector('.pos-content');
    const handleScroll = () => {
      const y = (el as HTMLElement | null)?.scrollTop ?? window.scrollY;
      setIsScrolled(y > 8);
    };

    // Initialize state on mount
    handleScroll();

    if (el) {
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    } else {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus({ preventScroll: true } as any);
    }
  }, [isOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <header className={cn(
      'pos-topbar transition-all duration-300',
      collapsed && 'collapsed',
      'bg-transparent backdrop-blur-md border-border/50'
    )}>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="lg:hidden"
        >
          <Menu size={20} />
        </Button>

        <div className="text-lg font-semibold text-foreground">Welcome</div>

        <SearchDropdown
          results={results}
          recentSearches={recentSearches}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSelect={handleResultSelect}
          onRecentSelect={handleRecentSearchSelect}
          onClearRecent={clearRecentSearches}
        >
          <form onSubmit={handleSearchSubmit} className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search products, settings, pages..."
              value={query}
              onChange={(e) => {
                const value = e.target.value;
                handleQueryChange(value);
              }}
              onFocus={() => {
                if (query.length > 0 || recentSearches.length > 0) {
                  setIsOpen(true);
                }
              }}
              className="pl-10 w-80 pos-input focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
          </form>
        </SearchDropdown>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 max-w-48">
              <span className="truncate">{currentBusiness?.businessName || 'Select Business'}</span>
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {businesses.map((business) => (
              <div key={business.id} className="flex items-center justify-between">
                <DropdownMenuItem 
                  onClick={() => setCurrentBusiness(business.id)}
                  className={cn(
                    "flex-1 cursor-pointer",
                    currentBusiness?.id === business.id && "bg-accent"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{business.businessName}</span>
                    <span className="text-xs text-muted-foreground capitalize">{business.businessType}</span>
                  </div>
                </DropdownMenuItem>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/settings?section=business&subsection=business-info&edit=' + business.id);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Edit size={14} />
                </Button>
              </div>
            ))}
            <DropdownMenuItem 
              onClick={() => navigate('/settings?section=business&subsection=business-info&mode=add')}
              className="border-t mt-1 pt-2"
            >
              <Plus size={16} className="mr-2" />
              Add New Business
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate('/settings?section=business&subsection=business-info')}
            >
              <Settings size={16} className="mr-2" />
              Business Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          onClick={() => navigate('/dashboard/products/add')}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2 transition-all duration-200 hover:scale-95 active:scale-90"
          size="sm"
        >
          <Plus size={16} />
          Add New
        </Button>

        <Button
          onClick={() => navigate('/dashboard/checkout')}
          className="bg-blue-500 hover:bg-blue-600 text-white gap-2 transition-all duration-200 hover:scale-95 active:scale-90"
          size="sm"
        >
          <Calculator size={16} />
          POS
        </Button>

        <div className={cn("flex items-center gap-3 transition-colors duration-300", darkMode ? "text-white" : "text-black")}>
          <Tooltip open={internetTooltip.isOpen} onOpenChange={internetTooltip.handleOpenChange}>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 transition-all duration-200 hover:scale-90 active:scale-75"
                onClick={() => window.open('https://google.com', '_blank')}
              >
                <Globe size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Internet
            </TooltipContent>
          </Tooltip>
          
          <Tooltip open={mailTooltip.isOpen} onOpenChange={mailTooltip.handleOpenChange}>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 relative transition-all duration-200 hover:scale-90 active:scale-75"
                onClick={() => window.open('mailto:', '_blank')}
              >
                <Mail size={18} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Mail
            </TooltipContent>
          </Tooltip>
          
          <Tooltip open={notificationTooltip.isOpen} onOpenChange={notificationTooltip.handleOpenChange}>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 relative transition-all duration-200 hover:scale-90 active:scale-75"
                onClick={() => console.log('Open notifications')}
              >
                <Bell size={18} />
                <span className={cn("absolute -top-1 -right-1 bg-primary text-xs rounded-full w-4 h-4 flex items-center justify-center", darkMode ? "text-black" : "text-white")}>
                  5
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>  
              Notifications
            </TooltipContent>
          </Tooltip>
          
          <Tooltip open={settingsTooltip.isOpen} onOpenChange={settingsTooltip.handleOpenChange}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 transition-all duration-200 hover:scale-90 active:scale-75"
                onClick={() => navigate('/dashboard/settings')}
              >
                <Settings size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Settings
            </TooltipContent>
          </Tooltip>
        </div>

        <Tooltip open={themeTooltip.isOpen} onOpenChange={themeTooltip.handleOpenChange}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleDarkMode}
              className={`p-2 transition-all duration-300 hover:scale-110 active:scale-95 hover:bg-accent/10 rounded-lg ${darkMode ? 'theme-toggle-sun' : 'theme-toggle-moon'}`}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="text-lg transition-transform duration-300 hover:rotate-12">
                {darkMode ? goldenSun : goldenMoon}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <Tooltip open={profileTooltip.isOpen} onOpenChange={profileTooltip.handleOpenChange}>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2 transition-all duration-200 hover:scale-90 active:scale-75"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User size={18} className="text-primary" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              Profile  
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              Profile Settings
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem onClick={() => navigate('/dashboard/admin-settings')}>
                Admin Settings
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
              System Settings
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem onClick={() => {
                adminLogout();
                window.location.href = '/';
              }}>
                Logout as Admin
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/';
            }}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Topbar;