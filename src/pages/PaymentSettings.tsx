import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, PlugZap, Smartphone, CreditCard, Globe2, Eye, EyeOff, Copy, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const providerLabels: Record<string, string> = {
  mpesa: 'M-Pesa (Daraja)',
  paypal: 'PayPal',
  flutterwave: 'Flutterwave',
};

type ProviderKey = keyof typeof providerLabels;

type ProviderSettings = {
  enabled: boolean;
  credentials: Record<string, string>;
  status?: 'connected' | 'not_configured';
  env?: 'sandbox' | 'live';
};

const useCompany = () => {
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await supabase.auth.getUser();
        const user = res?.data?.user || null;
        if (!user) return;

        // 1) Try company_users link
        try {
          const { data: cu } = await supabase
            .from('company_users')
            .select('company_id, role')
            .eq('user_id', user.id)
            .maybeSingle();
          if (cu?.company_id) { setCompanyId(Number(cu.company_id)); setRole(cu.role || null); return; }
        } catch {}

        // 2) Try system_users.company_id
        let su: any = null;
        try {
          const { data } = await supabase
            .from('system_users')
            .select('company_id, user_metadata')
            .eq('id', user.id)
            .maybeSingle();
          su = data;
          if (su?.company_id) { setCompanyId(Number(su.company_id)); setRole('owner'); return; }
        } catch {}

        // 3) Attach to first company or create a new one
        try {
          const { data: firstCompany } = await supabase.from('companies').select('id, name').order('id').limit(1).maybeSingle();
          let cid = firstCompany?.id as number | undefined;
          if (!cid) {
            const meta = (su as any)?.user_metadata || {};
            const fallbackName = meta.company_name || (user.email ? user.email.split('@')[0] + "'s Company" : 'My Company');
            const { data: created } = await supabase.from('companies').insert({ name: fallbackName }).select('id').single();
            cid = created?.id;
          }
          if (cid) {
            const { count } = await supabase.from('company_users').select('id', { count: 'exact', head: true }).eq('company_id', cid);
            const isFirst = (count || 0) === 0;
            await supabase.from('company_users').upsert({ company_id: cid, user_id: user.id, role: isFirst ? 'owner' : 'member' });
            await supabase.from('system_users').update({ company_id: cid }).eq('id', user.id);
            setCompanyId(Number(cid));
            setRole(isFirst ? 'owner' : 'member');
          }
        } catch {}
      } catch {
        // auth getUser failed (offline/CORS). Leave companyId null; page will show helpful message.
      }
    })();
  }, []);

  return { companyId, role };
};

const ProviderSection: React.FC<{
  provider: ProviderKey;
  value: ProviderSettings;
  onChange: (v: ProviderSettings) => void;
  onSave: () => Promise<void>;
  onTest: () => Promise<void>;
}> = ({ provider, value, onChange, onSave, onTest }) => {
  const [showSecrets, setShowSecrets] = useState(false);

  const toggleSecrets = () => setShowSecrets((s) => !s);

  const copyWebhook = async () => {
    try {
      const base = window.location.origin;
      let path = '';
      if (provider === 'mpesa') path = '/api/payments/mpesa/callback';
      else if (provider === 'paypal') path = '/api/payments/paypal/webhook';
      else if (provider === 'flutterwave') path = '/api/payments/flutterwave/webhook';
      await navigator.clipboard.writeText(base + path);
    } catch {}
  };
  const logo = useMemo(() => {
    switch (provider) {
      case 'mpesa': return <Smartphone className="h-5 w-5" />;
      case 'paypal': return <Globe2 className="h-5 w-5" />;
      case 'flutterwave': return <CreditCard className="h-5 w-5" />;
      default: return <PlugZap className="h-5 w-5" />;
    }
  }, [provider]);

  const statusBadge = value.enabled && Object.keys(value.credentials).length > 0
    ? (<Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Connected (Live)</Badge>)
    : (<Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 flex items-center gap-1"><XCircle className="h-3 w-3"/> Not Configured</Badge>);

  return (
    <Card className="border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {logo}
          <CardTitle className="text-base">{providerLabels[provider]}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {statusBadge}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Enabled</span>
            <Switch checked={value.enabled} onCheckedChange={(c) => onChange({ ...value, enabled: c })} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {provider === 'mpesa' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Consumer Key</Label>
              <Input value={value.credentials.consumerKey || ''} onChange={(e) => onChange({ ...value, credentials: { ...value.credentials, consumerKey: e.target.value } })} />
            </div>
            <div>
              <Label>Consumer Secret</Label>
              <div className="relative">
                <Input type={showSecrets ? 'text' : 'password'} value={value.credentials.consumerSecret || ''} onChange={(e) => onChange({ ...value, credentials: { ...value.credentials, consumerSecret: e.target.value } })} />
                <button type="button" onClick={toggleSecrets} className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground">
                  {showSecrets ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </button>
              </div>
            </div>
            <div>
              <Label>Passkey (STK Push)</Label>
              <div className="relative">
                <Input type={showSecrets ? 'text' : 'password'} value={value.credentials.passkey || ''} onChange={(e) => onChange({ ...value, credentials: { ...value.credentials, passkey: e.target.value } })} />
                <button type="button" onClick={toggleSecrets} className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground">
                  {showSecrets ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </button>
              </div>
            </div>
            <div>
              <Label>Shortcode (Paybill/Till)</Label>
              <Input value={value.credentials.shortcode || ''} onChange={(e) => onChange({ ...value, credentials: { ...value.credentials, shortcode: e.target.value } })} />
            </div>
            <div>
              <Label>Environment</Label>
              <Select value={value.env || 'sandbox'} onValueChange={(v: 'sandbox'|'live') => onChange({ ...value, env: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {provider === 'paypal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Client ID</Label>
              <Input value={value.credentials.clientId || ''} onChange={(e) => onChange({ ...value, credentials: { ...value.credentials, clientId: e.target.value } })} />
            </div>
            <div>
              <Label>Client Secret</Label>
              <div className="relative">
                <Input type={showSecrets ? 'text' : 'password'} value={value.credentials.clientSecret || ''} onChange={(e) => onChange({ ...value, credentials: { ...value.credentials, clientSecret: e.target.value } })} />
                <button type="button" onClick={toggleSecrets} className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground">
                  {showSecrets ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </button>
              </div>
            </div>
            <div>
              <Label>Mode</Label>
              <Select value={value.env || 'sandbox'} onValueChange={(v: 'sandbox'|'live') => onChange({ ...value, env: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {provider === 'flutterwave' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Public Key</Label>
              <Input value={value.credentials.publicKey || ''} onChange={(e) => onChange({ ...value, credentials: { ...value.credentials, publicKey: e.target.value } })} />
            </div>
            <div>
              <Label>Secret Key</Label>
              <div className="relative">
                <Input type={showSecrets ? 'text' : 'password'} value={value.credentials.secretKey || ''} onChange={(e) => onChange({ ...value, credentials: { ...value.credentials, secretKey: e.target.value } })} />
                <button type="button" onClick={toggleSecrets} className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground">
                  {showSecrets ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </button>
              </div>
            </div>
            <div>
              <Label>Encryption Key</Label>
              <div className="relative">
                <Input type={showSecrets ? 'text' : 'password'} value={value.credentials.encryptionKey || ''} onChange={(e) => onChange({ ...value, credentials: { ...value.credentials, encryptionKey: e.target.value } })} />
                <button type="button" onClick={toggleSecrets} className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground">
                  {showSecrets ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </button>
              </div>
            </div>
            <div>
              <Label>Environment</Label>
              <Select value={value.env || 'sandbox'} onValueChange={(v: 'sandbox'|'live') => onChange({ ...value, env: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2 flex-wrap">
          <Button variant="outline" onClick={onTest}>Test Connection</Button>
          <Button onClick={onSave}>Save Settings</Button>
        </div>

        <Alert className="mt-2">
          <AlertDescription className="flex items-center justify-between gap-3">
            <span>Credentials are stored server-side per business. Webhook URL: <code className="px-1 py-0.5 rounded bg-muted text-xs">{typeof window !== 'undefined' ? window.location.origin : ''}{provider === 'mpesa' ? '/api/payments/mpesa/callback' : provider === 'paypal' ? '/api/payments/paypal/webhook' : '/api/payments/flutterwave/webhook'}</code></span>
            <Button size="sm" variant="outline" className="gap-1" onClick={copyWebhook}><Copy className="h-3 w-3"/> Copy</Button>
          </AlertDescription>
        </Alert>
        <div className="text-xs text-muted-foreground">
          Need help? See provider docs {provider === 'mpesa' && (<a className="underline inline-flex items-center gap-1" href="https://developer.safaricom.co.ke" target="_blank" rel="noreferrer">Daraja <ExternalLink className="h-3 w-3"/></a>)}{provider === 'paypal' && (<a className="underline inline-flex items-center gap-1" href="https://developer.paypal.com" target="_blank" rel="noreferrer">PayPal <ExternalLink className="h-3 w-3"/></a>)}{provider === 'flutterwave' && (<a className="underline inline-flex items-center gap-1" href="https://developer.flutterwave.com" target="_blank" rel="noreferrer">Flutterwave <ExternalLink className="h-3 w-3"/></a>)}
        </div>
      </CardContent>
    </Card>
  );
};

const PaymentSettings: React.FC = () => {
  const { toast } = useToast();
  const { isAdmin, isChecking } = useAdminAuth();
  const { companyId, role } = useCompany();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Record<ProviderKey, ProviderSettings>>({
    mpesa: { enabled: false, credentials: {}, env: 'sandbox', status: 'not_configured' },
    paypal: { enabled: false, credentials: {}, env: 'sandbox', status: 'not_configured' },
    flutterwave: { enabled: false, credentials: {}, env: 'sandbox', status: 'not_configured' },
  });

  useEffect(() => {
    const load = async () => {
      if (!companyId) { setLoading(false); return; }
      const { data, error } = await supabase
        .from('payment_provider_settings')
        .select('provider_key, enabled, credentials')
        .eq('company_id', companyId);
      if (error) { setLoading(false); return; }
      const next: any = { ...settings };
      (data || []).forEach((row: any) => {
        const key = row.provider_key as ProviderKey;
        next[key] = {
          ...next[key],
          enabled: !!row.enabled,
          credentials: row.credentials || {},
          status: row.enabled && row.credentials && Object.keys(row.credentials).length > 0 ? 'connected' : 'not_configured'
        };
      });
      setSettings(next);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const handleSave = async (provider: ProviderKey) => {
    if (!companyId) {
      toast({ title: 'Missing company', description: 'No company selected for current user', variant: 'destructive' });
      return;
    }
    try {
      const payload = {
        company_id: companyId,
        provider_key: provider,
        enabled: settings[provider].enabled,
        credentials: settings[provider].credentials,
      };
      const { error } = await supabase
        .from('payment_provider_settings')
        .upsert(payload, { onConflict: 'company_id,provider_key' });
      if (error) throw error;
      const { data: s } = await supabase.auth.getSession();
      await supabase.from('payment_audit_logs').insert({
        company_id: companyId,
        user_id: s?.session?.user?.id || null,
        action: 'update_settings',
        details: { provider }
      });
      toast({ title: 'Saved', description: `${providerLabels[provider]} settings updated` });
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message || 'Error saving settings', variant: 'destructive' });
    }
  };

  const handleTest = async (provider: ProviderKey) => {
    try {
      // Call serverless endpoint which uses stored credentials securely
      const res = await fetch(`/api/payments/${provider}/test`, { method: 'POST' });
      const ok = res.ok;
      const { data: s } = await supabase.auth.getSession();
      await supabase.from('payment_audit_logs').insert({ company_id: companyId, user_id: s?.session?.user?.id || null, action: 'test_connection', details: { provider, ok } });
      if (ok) toast({ title: 'Connection OK', description: `${providerLabels[provider]} test succeeded` });
      else toast({ title: 'Test failed', description: `${providerLabels[provider]} test failed`, variant: 'destructive' });
    } catch (e: any) {
      toast({ title: 'Test failed', description: e.message || 'Network error', variant: 'destructive' });
    }
  };

  if (isChecking) {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }
  const [allow, setAllow] = useState(false);
  useEffect(() => {
    (async () => {
      if (isAdmin) { setAllow(true); return; }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) { setAllow(false); return; }
        // Company role owner/admin allowed
        if (role === 'owner' || role === 'admin') { setAllow(true); return; }
        // First ever system user gets access
        const { count } = await supabase.from('system_users').select('id', { count: 'exact', head: true });
        if ((count || 0) === 1) { setAllow(true); return; }
        setAllow(false);
      } catch {
        setAllow(false);
      }
    })();
  }, [isAdmin, role]);

  if (!allow) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>Only your business owner/admin or super admin can manage Payment Settings.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="animate-slideInLeft">
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
          <CardDescription>Connect and manage payment providers per business</CardDescription>
        </CardHeader>
      </Card>

      {!loading && companyId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(providerLabels) as ProviderKey[]).map((p) => {
            const val = settings[p];
            const connected = val.enabled && Object.keys(val.credentials).length > 0;
            return (
              <Card key={p} className={connected ? 'border-green-500/40' : ''}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    {p === 'mpesa' ? <Smartphone className="h-5 w-5"/> : p === 'paypal' ? <Globe2 className="h-5 w-5"/> : <CreditCard className="h-5 w-5"/>}
                    <CardTitle className="text-base">{providerLabels[p]}</CardTitle>
                  </div>
                  {connected ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Connected</Badge>
                  ) : (
                    <Badge variant="secondary">Not Configured</Badge>
                  )}
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Enabled</span>
                    <Switch checked={val.enabled} onCheckedChange={(c) => setSettings(prev => ({ ...prev, [p]: { ...prev[p], enabled: c } }))} />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    const el = document.getElementById(`provider-${p}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}>Configure</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="p-6 text-muted-foreground">Loading...</div>
      ) : !companyId ? (
        <Card className="p-6"><CardDescription>No company linked to your account yet. A default company has been created and linked. Please refresh.</CardDescription></Card>
      ) : (
        <Accordion type="multiple" className="space-y-4">
          {(Object.keys(providerLabels) as ProviderKey[]).map((p) => (
            <AccordionItem key={p} value={p}>
              <div id={`provider-${p}`}></div>
              <AccordionTrigger className="text-base font-semibold">{providerLabels[p]}</AccordionTrigger>
              <AccordionContent>
                <ProviderSection
                  provider={p}
                  value={settings[p]}
                  onChange={(v) => setSettings((prev) => ({ ...prev, [p]: v }))}
                  onSave={() => handleSave(p)}
                  onTest={() => handleTest(p)}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default PaymentSettings;
