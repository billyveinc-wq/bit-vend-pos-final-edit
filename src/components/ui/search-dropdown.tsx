import React from 'react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchResult } from '@/hooks/useSearch';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  UserCheck, 
  Tag, 
  Building2,
  Clock,
  X,
  Settings as Cog,
  FileText
} from 'lucide-react';

interface SearchDropdownProps {
  results: SearchResult[];
  recentSearches: string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (result: SearchResult) => void;
  onRecentSelect: (search: string) => void;
  onClearRecent: () => void;
  children: React.ReactNode;
}

const getTypeIcon = (type: SearchResult['type']) => {
  const iconMap = {
    product: Package,
    customer: Users,
    sale: ShoppingCart,
    employee: UserCheck,
    category: Tag,
    brand: Building2,
    setting: Cog,
    page: FileText,
  } as const;
  const Icon = iconMap[type] ?? Package;
  return <Icon className="h-4 w-4 pointer-events-none" />;
};

const getTypeBadge = (type: SearchResult['type']) => {
  const colorMap = {
    product: 'bg-primary/10 text-primary',
    customer: 'bg-secondary/10 text-secondary-foreground',
    sale: 'bg-accent/10 text-accent-foreground',
    employee: 'bg-primary/10 text-primary',
    category: 'bg-muted text-muted-foreground',
    brand: 'bg-muted text-muted-foreground',
    setting: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    page: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
  } as const;

  return (
    <Badge variant="secondary" className={`text-xs pointer-events-none ${colorMap[type] || colorMap.product}`}>
      {type}
    </Badge>
  );
};

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  results,
  recentSearches,
  isOpen,
  onOpenChange,
  onSelect,
  onRecentSelect,
  onClearRecent,
  children,
}) => {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange} modal={false}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0 z-[60] bg-popover border border-border shadow-xl rounded-lg" align="start" onOpenAutoFocus={(e) => e.preventDefault()} onCloseAutoFocus={(e) => e.preventDefault()} onPointerDownOutside={(e) => {
        const target = e.target as HTMLElement;
        // Allow clicks on scrollbar without blurring input
        if (target.closest('[cmdk-list]')) return;
      }}>
        <Command shouldFilter={false}>
          <CommandList>
            {results.length > 0 && (
              <>
                {/* Group results by type */}
                {['setting', 'page', 'product'].map(type => {
                  const typeResults = results.filter(r => r.type === type);
                  if (typeResults.length === 0) return null;
                  
                  const typeLabels = {
                    setting: 'Settings',
                    page: 'Pages',
                    product: 'Products'
                  };
                  
                  return (
                    <CommandGroup key={type} heading={typeLabels[type as keyof typeof typeLabels]}>
                      {typeResults.map((result) => (
                        <CommandItem
                          key={result.id}
                          onSelect={() => onSelect(result)}
                          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02] group"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <div className="transition-colors group-hover:text-primary">
                              {getTypeIcon(result.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate group-hover:text-primary transition-colors">{result.title}</span>
                                {getTypeBadge(result.type)}
                              </div>
                              {result.subtitle && (
                                <span className="text-sm text-muted-foreground truncate">
                                  {result.subtitle}
                                </span>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  );
                })}
              </>
            )}
            
            {recentSearches.length > 0 && (
              <>
                {results.length > 0 && <CommandSeparator />}
                <CommandGroup>
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-sm font-medium text-muted-foreground">Recent Searches</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearRecent}
                      className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {recentSearches.map((search, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => onRecentSelect(search)}
                      className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/50 transition-colors duration-200"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{search}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
            
            {results.length === 0 && recentSearches.length === 0 && (
              <CommandEmpty className="py-8 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-2xl">🔍</div>
                  <span className="font-medium">No results found</span>
                  <span className="text-xs">Try searching for products, settings, or pages</span>
                  <div className="mt-2 text-xs flex items-center gap-2 text-muted-foreground/60">
                    <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">↑↓</kbd>
                    <span>Navigate</span>
                    <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">↵</kbd>
                    <span>Select</span>
                  </div>
                </div>
              </CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};