import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart3,
  Shield,
  Layers,
  LayoutGrid,
  Calculator,
  Receipt,
  RotateCcw,
  FileText,
  TrendingUp,
  Package,
  Tags,
  Factory,
  Archive,
  ClipboardList,
  QrCode,
  TruckIcon,
  Warehouse,
  ArrowLeftRight,
  ClipboardCheck,
  DollarSign,
  List,
  HandCoins,
  Building2,
  ArrowRightLeft,
  PieChart,
  Scale,
  Waves,
  FileBarChart,
  Users,
  Briefcase,
  IdCard,
  Clock,
  Calendar,
  CreditCard,
  UserCog,
  UserCheck,
  Settings,
  Database,
  ChevronLeft,
  ChevronRight,
  Menu,
  ShoppingCart
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAdminAuth();
  const [allowedPages, setAllowedPages] = useState<string[] | null>(null);
  const [canManagePayments, setCanManagePayments] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const SCROLL_KEY = 'sidebar-scroll-top';

  // Restore saved scroll on mount
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) el.scrollTop = parseInt(saved, 10) || 0;
  }, []);

  // Save scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop));
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Reapply after route change and ensure active item is visible
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      const saved = sessionStorage.getItem(SCROLL_KEY);
      if (saved) el.scrollTop = parseInt(saved, 10) || 0;
      const active = el.querySelector('[data-active="true"]') as HTMLElement | null;
      if (active) {
        const targetTop = Math.max(0, active.offsetTop - Math.floor(el.clientHeight / 2));
        el.scrollTop = targetTop;
        sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop));
      }
    });
    return () => cancelAnimationFrame(id);
  }, [location.pathname]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data: { session } } = await (await import('@/integrations/supabase/safeAuth')).safeGetSession();
        const user = session?.user;
        if (!user) return;
        // Determine payment settings access: super admin OR company owner/admin OR first system user
        if (isAdmin) { if (isMounted) setCanManagePayments(true); }
        try {
          const { data: cu } = await supabase.from('company_users').select('role').eq('user_id', user.id).maybeSingle();
          const role = (cu as any)?.role;
          if ((role === 'owner' || role === 'admin') && isMounted) setCanManagePayments(true);
        } catch {}
        try {
          const { count } = await supabase.from('system_users').select('id', { count: 'exact', head: true });
          if ((count || 0) === 1 && isMounted) setCanManagePayments(true);
        } catch {}
        // Restrictions metadata for other pages
        if (!isAdmin) {
          const { data } = await supabase.from('system_users').select('user_metadata').eq('id', user.id).maybeSingle();
          const meta = (data as any)?.user_metadata || {};
          const restr = meta?.restrictions;
          if (isMounted && restr && restr.enabled && Array.isArray(restr.pages)) {
            setAllowedPages(restr.pages as string[]);
          } else if (isMounted) {
            setAllowedPages(null);
          }
        } else if (isMounted) {
          setAllowedPages(null);
        }
      } catch (err) {
        if (isMounted) {
          setAllowedPages(null);
          setCanManagePayments(isAdmin);
        }
      }
    })();
    return () => { isMounted = false; };
  }, [isAdmin]);

  // Build menu sections with Admin-only pushed to top when available
  const baseSections = [
    {
      title: 'Main',
      items: [
        { href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
      ]
    },
    {
      title: 'Sales',
      items: [
        { href: '/dashboard/checkout', icon: Calculator, label: 'POS (Checkout)' },
        { href: '/dashboard/sales', icon: Receipt, label: 'Sales List' },
        { href: '/dashboard/sales-return', icon: RotateCcw, label: 'Sales Return' },
        { href: '/dashboard/quotation', icon: FileText, label: 'Quotation' },
        { href: '/dashboard/purchases', icon: TrendingUp, label: 'Purchases' },
      ]
    },
    {
      title: 'Inventory',
      items: [
        { href: '/dashboard/products', icon: Package, label: 'Products' },
        { href: '/dashboard/categories', icon: Tags, label: 'Categories' },
        { href: '/dashboard/brands', icon: Factory, label: 'Brands' },
        { href: '/dashboard/units', icon: Archive, label: 'Units' },
        { href: '/dashboard/variants', icon: ClipboardList, label: 'Variants' },
        { href: '/dashboard/barcode', icon: QrCode, label: 'Print Barcode' },
      ]
    },
    {
      title: 'Stock',
      items: [
        { href: '/dashboard/stock-in', icon: TruckIcon, label: 'Stock In' },
        { href: '/dashboard/stock-out', icon: Warehouse, label: 'Stock Out' },
        { href: '/dashboard/stock-transfer', icon: ArrowLeftRight, label: 'Stock Transfer' },
        { href: '/dashboard/stock-return', icon: ClipboardCheck, label: 'Stock Return' },
        { href: '/dashboard/stock-adjustment', icon: Layers, label: 'Stock Adjustment' },
      ]
    },
    {
      title: 'Finance & Accounts',
      items: [
        { href: '/dashboard/expenses', icon: DollarSign, label: 'Expenses' },
        { href: '/dashboard/expense-category', icon: List, label: 'Expense Category' },
        { href: '/dashboard/income', icon: HandCoins, label: 'Income' },
        { href: '/dashboard/income-category', icon: List, label: 'Income Category' },
        { href: '/dashboard/bank-accounts', icon: Building2, label: 'Bank Accounts' },
        { href: '/dashboard/money-transfer', icon: ArrowRightLeft, label: 'Money Transfer' },
        { href: '/dashboard/balance-sheet', icon: BarChart3, label: 'Balance Sheet' },
        { href: '/dashboard/trial-balance', icon: Scale, label: 'Trial Balance' },
        { href: '/dashboard/cash-flow', icon: Waves, label: 'Cash Flow' },
        { href: '/dashboard/account-statement', icon: FileBarChart, label: 'Account Statement' },
      ]
    },
    {
      title: 'People',
      items: [
        { href: '/dashboard/customers', icon: Users, label: 'Customers' },
        { href: '/dashboard/suppliers', icon: Briefcase, label: 'Suppliers' },
      ]
    },
    {
      title: 'HRM',
      items: [
        { href: '/dashboard/employees', icon: IdCard, label: 'Employees' },
        { href: '/dashboard/attendance', icon: Clock, label: 'Attendance' },
        { href: '/dashboard/holidays', icon: Calendar, label: 'Holidays' },
        { href: '/dashboard/payroll', icon: CreditCard, label: 'Payroll' },
      ]
    },
    {
      title: 'Reports',
      items: [
        { href: '/dashboard/sales-report', icon: PieChart, label: 'Sales Report' },
        { href: '/dashboard/stock-report', icon: Archive, label: 'Stock Report' },
        { href: '/dashboard/purchase-report', icon: FileText, label: 'Purchase Report' },
        { href: '/dashboard/expense-report', icon: DollarSign, label: 'Expense Report' },
      ]
    },
    {
      title: 'User Management',
      items: [
        { href: '/dashboard/users', icon: UserCog, label: 'Users' },
        { href: '/dashboard/roles', icon: UserCheck, label: 'Roles & Permissions' },
      ]
    },
    {
      title: 'Settings',
      items: [
        { href: '/dashboard/payment-settings', icon: CreditCard, label: 'Payment Settings', requiresPaymentAdmin: true },
        { href: '/dashboard/general-settings', icon: Settings, label: 'General Settings' },
        { href: '/dashboard/invoice-settings', icon: FileText, label: 'Invoice Settings' },
        { href: '/dashboard/tax-settings', icon: Calculator, label: 'Tax Settings' },
        { href: '/dashboard/subscription', icon: CreditCard, label: 'Subscription' },
        { href: '/dashboard/backup', icon: Database, label: 'Backup & Restore' },
      ]
    },
  ];

  const adminSection = isAdmin ? [{
    title: 'Admin Only',
    items: [
      { href: '/dashboard/superadmin', icon: Shield, label: 'Super Admin' },
      { href: '/dashboard/application', icon: Settings, label: 'Application' },
      { href: '/dashboard/layout', icon: LayoutGrid, label: 'Layout' },
    ]
  }] : [];

  const menuItems = [
    ...adminSection,
    ...baseSections
  ];

  return (
    <div className={cn("pos-sidebar", collapsed && "collapsed")}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-black">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center space-x-2 hover:opacity-90 transition-colors">
            <span className="text-xl font-bold flex items-center">
              <span
                className="inline-block"
                style={{
                  color: '#f97316 !important',
                  textShadow: '0 0 12px rgba(249, 115, 22, 0.4)',
                  fontWeight: 'bold'
                }}
              >
                Bit Vend
              </span>
              <span
                className="inline-block ml-1"
                style={{
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                POS
              </span>
              <ShoppingCart
                size={20}
                className="ml-2"
                style={{
                  color: '#FFB84D !important',
                  fill: '#FFB84D !important',
                  stroke: '#FFB84D !important',
                  filter: 'drop-shadow(0 0 10px rgba(255,184,77,0.45))'
                }}
              />
            </span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 bg-black h-full overflow-hidden">
        <div ref={scrollRef} className="h-full overflow-y-auto py-4 px-0 bg-black">
          {menuItems.map((section) => (
            <div key={section.title} className="mb-6">
              {!collapsed && (
                <div className="px-6 mb-3">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
              )}
              <ul className="space-y-1 px-3">
                {section.items
                  .filter((item: any) => {
                    if (item.requiresPaymentAdmin) return isAdmin || canManagePayments;
                    if (item.requiresAdmin) return isAdmin;
                    return (isAdmin || !allowedPages || allowedPages.includes(item.href));
                  })
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = item.href === '/dashboard'
                      ? location.pathname === item.href
                      : (location.pathname === item.href || location.pathname.startsWith(item.href + '/'));

                    return (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          data-active={isActive ? 'true' : undefined}
                          onClick={() => { const el = scrollRef.current; if (el) sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop)); }}
                          className={cn(
                            "w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                            isActive
                              ? "bg-gray-800 text-white"
                              : "text-white hover:text-white hover:bg-gray-800"
                          )}
                        >
                          <Icon size={18} className="flex-shrink-0 text-white" />
                          {!collapsed && (
                            <span className="ml-3 text-white">{item.label}</span>
                          )}
                          {collapsed && (
                            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50 shadow-lg">
                              {item.label}
                            </div>
                          )}
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
