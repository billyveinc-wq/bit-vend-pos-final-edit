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
import { CheckCircle2, XCircle, PlugZap, Smartphone, CreditCard, Globe2 } from 'lucide-react';
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('company_users')
        .select('company_id, role')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data?.company_id) setCompanyId(Number(data.company_id));
      if (data?.role) setRole(data.role);
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
              <Input type="password" value={value.credentials.consumerSecret || ''} onChange={(e) => onChange({ ...value, credentials: { ...value.credentials, consumerSecret: e.target.value } })} />
            </div>
            <div>
              <Label>Passkey (STK Push)</Label>
              <Input type="password" value={value.credentials.passkey || ''} onChange={(e) => onChange({ ...value, credentials: { ...value.credentials, passkey: e.target.value } })} />
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
              <Input type="password" value={value.credentials.clientSecret || ''} onChange={(e) => onChange({ ...value, credentials: { ...value.credentials, clientSecret: e.target.value } })} />
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
              <Input type="password" value={value.credentials.secretKey || ''} onChange={(e) => onChange({ ...value, credentials: { ...value.credentials, secretKey: e.target.value } })} />
            </div>
            <div>
              <Label>Encryption Key</Label>
              <Input type="password" value={value.credentials.encryptionKey || ''} onChange={(e) => onChange({ ...value, credentials: { ...value.credentials, encryptionKey: e.target.value } })} />
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

        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" onClick={onTest}>Test Connection</Button>
          <Button onClick={onSave}>Save Settings</Button>
        </div>

        <Alert className="mt-2">
          <AlertDescription>
            Credentials are stored server-side per business. Webhooks required:
            /api/payments/mpesa/callback, /api/payments/paypal/webhook, /api/payments/flutterwave/webhook
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

const PaymentSettings: React.FC = () => {
  const { toast } = useToast();
  const { isAdmin, isChecking } = useAdminAuth();
  const { companyId } = useCompany();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Record<ProviderKey, ProviderSettings>>({
    mpesa: { enabled: false, credentials: {}, env: 'sandbox', status: 'not_configured' },
    paypal: { enabled: false, credentials: {}, env: 'sandbox', status: 'not_configured' },
    flutterwave: { enabled: false, credentials: {}, env: 'sandbox', status: 'not_configured' },
  });

  useEffect(() => {
    const load = async () => {
      if (!companyId) return;
      const { data, error } = await supabase
        .from('payment_provider_settings')
        .select('provider_key, enabled, credentials')
        .eq('company_id', companyId);
      if (error) {
        setLoading(false);
        return;
      }
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
  if (!isAdmin) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>Only Admins can manage Payment Settings.</CardDescription>
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

      {loading ? (
        <div className="p-6 text-muted-foreground">Loading...</div>
      ) : (
        <Accordion type="multiple" className="space-y-4">
          {(Object.keys(providerLabels) as ProviderKey[]).map((p) => (
            <AccordionItem key={p} value={p}>
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
