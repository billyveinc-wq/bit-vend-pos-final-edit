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
  Edit,
  Undo2,
  Redo2,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough,
  List as ListIcon,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Paperclip,
  Send as SendIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
import { toast } from 'sonner';

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
  const [supportEmail, setSupportEmail] = useState<string | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [compose, setCompose] = useState<{ to: string; cc: string; bcc: string; subject: string; body: string; attachments: File[] }>({ to: '', cc: '', bcc: '', subject: '', body: '', attachments: [] });
  const editorRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fontFamilyKey, setFontFamilyKey] = useState<'sans' | 'serif' | 'mono'>('sans');
  const fontMap: Record<typeof fontFamilyKey, string> = {
    sans: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, sans-serif',
    serif: 'Times New Roman, Times, Georgia, serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  } as any;

  useEffect(() => {
    const loadSupportEmail = async () => {
      try {
        const { data: comp } = await supabase.from('companies').select('id').order('id').limit(1).maybeSingle();
        const companyId = (comp as any)?.id;
        if (!companyId) return;
        const { data } = await supabase.from('app_settings').select('value').eq('company_id', companyId).eq('key', 'support_email').maybeSingle();
        const val = (data as any)?.value;
        if (typeof val === 'string' && val) { setSupportEmail(val); return; }
        const app = await supabase.from('app_settings').select('value').eq('company_id', companyId).eq('key', 'application_settings').maybeSingle();
        const appVal = (app.data as any)?.value;
        if (appVal?.supportEmail) setSupportEmail(appVal.supportEmail);
      } catch {}
    };
    loadSupportEmail();
  }, []);
  
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
    if (editorRef.current) editorRef.current.style.fontFamily = fontMap[fontFamilyKey];
  }, [fontFamilyKey]);

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
              <span className="truncate">{currentBusiness?.businessName || ''}</span>
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
              onClick={() => navigate('/dashboard/settings?section=business&subsection=business-info&mode=add')}
              className="border-t mt-1 pt-2"
            >
              <Plus size={16} className="mr-2" />
              Add New Business
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate('/dashboard/settings?section=business&subsection=business-info')}
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
                onClick={() => {
                  if (isAdmin) setShowSupportDialog(true);
                  else {
                    setCompose({ to: supportEmail || '', cc: '', bcc: '', subject: '', body: '', attachments: [] });
                    setShowEmailDialog(true);
                  }
                }}
              >
                <Mail size={18} />
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
                onClick={() => navigate('/dashboard/system-updates')}
              >
                <Bell size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              System Updates
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

            {/* Show only one logout option depending on session type to avoid duplicate actions */}
            {isAdmin ? (
              <DropdownMenuItem onClick={async () => {
                // Clear local admin session and also ensure Supabase session is cleared
                adminLogout();
                try {
                  await supabase.auth.signOut();
                } catch (err) {
                  // ignore sign out errors for supabase if no session exists
                  console.warn('Supabase signOut error during admin logout:', err);
                }
                window.location.href = '/';
              }}>
                Logout
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/';
              }}>
                Logout
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* User email compose dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-3xl max-w-[95vw] w-full overflow-hidden">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="mail-to">To</Label>
                <Input id="mail-to" value={compose.to} onChange={(e) => setCompose(prev => ({ ...prev, to: e.target.value }))} placeholder="support@company.com" />
              </div>
              <div>
                <Label htmlFor="mail-cc">Cc</Label>
                <Input id="mail-cc" value={compose.cc} onChange={(e) => setCompose(prev => ({ ...prev, cc: e.target.value }))} placeholder="" />
              </div>
              <div>
                <Label htmlFor="mail-bcc">Bcc</Label>
                <Input id="mail-bcc" value={compose.bcc} onChange={(e) => setCompose(prev => ({ ...prev, bcc: e.target.value }))} placeholder="" />
              </div>
              <div>
                <Label htmlFor="mail-sub">Subject</Label>
                <Input id="mail-sub" value={compose.subject} onChange={(e) => setCompose(prev => ({ ...prev, subject: e.target.value }))} placeholder="" />
              </div>
            </div>
            {/* Formatting toolbar (Gmail-like) */}
            <div className="border rounded-md">
              <div className="flex items-center gap-1 px-2 py-1 border-b bg-muted/50">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => document.execCommand('undo')}><Undo2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => document.execCommand('redo')}><Redo2 className="h-4 w-4" /></Button>
                <div className="mx-2 h-5 w-px bg-border" />
                <Select value={fontFamilyKey} onValueChange={(v) => {
                  const key = v as 'sans' | 'serif' | 'mono';
                  setFontFamilyKey(key);
                  try { document.execCommand('fontName', false, fontMap[key]); } catch {}
                }}>
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue placeholder="Font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sans">Sans Serif</SelectItem>
                    <SelectItem value="serif">Serif</SelectItem>
                    <SelectItem value="mono">Fixed Width</SelectItem>
                  </SelectContent>
                </Select>
                <div className="mx-2 h-5 w-px bg-border" />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => document.execCommand('bold', false)}><BoldIcon className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => document.execCommand('italic', false)}><ItalicIcon className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => document.execCommand('underline', false)}><UnderlineIcon className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => document.execCommand('strikeThrough', false)}><Strikethrough className="h-4 w-4" /></Button>
                <div className="mx-2 h-5 w-px bg-border" />
                <input type="color" aria-label="Text color" className="h-8 w-8 rounded cursor-pointer border" onChange={(e) => document.execCommand('foreColor', false, e.target.value)} />
                <div className="mx-2 h-5 w-px bg-border" />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => document.execCommand('insertUnorderedList')}><ListIcon className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => document.execCommand('insertOrderedList')}><ListOrdered className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => document.execCommand('formatBlock', false, 'blockquote')}><Quote className="h-4 w-4" /></Button>
                <div className="mx-2 h-5 w-px bg-border" />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => document.execCommand('justifyLeft')}><AlignLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => document.execCommand('justifyCenter')}><AlignCenter className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => document.execCommand('justifyRight')}><AlignRight className="h-4 w-4" /></Button>
                <div className="mx-2 h-5 w-px bg-border" />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { const url = window.prompt('Enter URL'); if (url) document.execCommand('createLink', false, url); }}><LinkIcon className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { const url = window.prompt('Image URL'); if (url) document.execCommand('insertImage', false, url); }}><ImageIcon className="h-4 w-4" /></Button>
              </div>
              <div className="min-h-[180px] p-3 outline-none" style={{ fontFamily: fontMap[fontFamilyKey] }} contentEditable ref={editorRef} data-placeholder="Write your message..." onInput={(e) => setCompose(prev => ({ ...prev, body: (e.target as HTMLDivElement).innerText }))}></div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">Attachments</Label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setCompose(prev => ({ ...prev, attachments: files as File[] }));
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
                  <Paperclip className="h-4 w-4" />
                  Attach
                </Button>
                <Button type="button" size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => {
                  const toVal = (compose.to && compose.to.trim()) || (supportEmail || '');
                  const bodyVal = (editorRef.current?.innerText || compose.body || '').trim();
                  const params = new URLSearchParams();
                  if (toVal) params.set('to', toVal);
                  if (compose.cc) params.set('cc', compose.cc);
                  if (compose.bcc) params.set('bcc', compose.bcc);
                  if (compose.subject) params.set('su', compose.subject);
                  if (bodyVal) params.set('body', bodyVal);
                  const url = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&${params.toString()}`;
                  window.open(url, '_blank');
                  setShowEmailDialog(false);
                }}>
                  <SendIcon className="h-4 w-4" />
                  Send
                </Button>
              </div>
              {compose.attachments.length > 0 && (
                <div className="max-h-32 overflow-auto border rounded p-2 text-sm">
                  {compose.attachments.map((f, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="truncate mr-2">{f.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => setCompose(prev => ({ ...prev, attachments: prev.attachments.filter((_, idx) => idx !== i) }))}>Remove</Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Note: Attachments cannot be auto-included via mailto/Gmail URL. You'll need to attach them in the email window.</p>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm">Formatting</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowEmailDialog(false)}>Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => {
                  const toVal = (compose.to && compose.to.trim()) || (supportEmail || '');
                  const bodyVal = (editorRef.current?.innerText || compose.body || '').trim();
                  const params = new URLSearchParams();
                  if (toVal) params.set('to', toVal);
                  if (compose.cc) params.set('cc', compose.cc);
                  if (compose.bcc) params.set('bcc', compose.bcc);
                  if (compose.subject) params.set('su', compose.subject);
                  if (bodyVal) params.set('body', bodyVal);
                  const url = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&${params.toString()}`;
                  window.open(url, '_blank');
                  setShowEmailDialog(false);
                }}>Open in Gmail</Button>
                <Button onClick={() => {
                  const qp: string[] = [];
                  const enc = (s: string) => encodeURIComponent(s);
                  const toVal = (compose.to && compose.to.trim()) || (supportEmail || '');
                  const bodyVal = (editorRef.current?.innerText || compose.body || '').trim();
                  if (compose.subject) qp.push(`subject=${enc(compose.subject)}`);
                  if (compose.cc) qp.push(`cc=${enc(compose.cc)}`);
                  if (compose.bcc) qp.push(`bcc=${enc(compose.bcc)}`);
                  if (bodyVal) qp.push(`body=${enc(bodyVal)}`);
                  const mailto = `mailto:${enc(toVal)}${qp.length ? '?' + qp.join('&') : ''}`;
                  window.location.href = mailto;
                  setShowEmailDialog(false);
                }}>Open Mail App</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin support email manage dialog */}
      <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customer Support Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="support-email">Support Email</Label>
              <Input id="support-email" type="email" value={supportEmail || ''} onChange={(e) => setSupportEmail(e.target.value)} placeholder="support@company.com" />
            </div>
            <div className="flex justify-between">
              <Button variant="destructive" onClick={async () => {
                try {
                  const { data: comp } = await supabase.from('companies').select('id').order('id').limit(1).maybeSingle();
                  const companyId = (comp as any)?.id;
                  if (!companyId) { toast.error('No company configured. Please save settings first.'); return; }
                  const { error } = await supabase.from('app_settings').delete().eq('company_id', companyId).eq('key', 'support_email');
                  if (error) { toast.error(error.message); return; }
                  setSupportEmail(null);
                  setShowSupportDialog(false);
                  toast.success('Support email deleted');
                } catch (e) { toast.error('Failed to delete'); }
              }}>Delete</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowSupportDialog(false)}>Cancel</Button>
                <Button onClick={async () => {
                  try {
                    let companyId: any;
                    const { data: comp } = await supabase.from('companies').select('id').order('id').limit(1).maybeSingle();
                    companyId = (comp as any)?.id;
                    if (!companyId) {
                      const { data: created, error: cErr } = await supabase.from('companies').insert({ name: 'Default Company' }).select('id').single();
                      if (cErr) { toast.error('Failed to create company'); return; }
                      companyId = created?.id;
                    }
                    if (!supportEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(supportEmail)) { toast.error('Enter a valid email'); return; }
                    const { error } = await supabase.from('app_settings').upsert({ company_id: companyId, key: 'support_email', value: supportEmail }, { onConflict: 'company_id,key' });
                    if (error) { toast.error(error.message); return; }
                    setShowSupportDialog(false);
                    toast.success('Support email saved');
                  } catch { toast.error('Failed to save'); }
                }}>Save</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Topbar;
