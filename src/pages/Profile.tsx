import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  bio: string;
}

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormData>({ email: '', firstName: '', lastName: '', username: '', phone: '', bio: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;
        if (!user) { setLoading(false); return; }

        const { data: row } = await supabase.from('system_users').select('*').eq('id', user.id).maybeSingle();
        const meta = (row as any)?.user_metadata || {};
        setForm({
          email: user.email || '',
          firstName: meta.first_name || meta.firstName || '',
          lastName: meta.last_name || meta.lastName || '',
          username: meta.username || meta.full_name || (user.email ? user.email.split('@')[0] : ''),
          phone: meta.phone || '',
          bio: meta.bio || ''
        });
      } catch (e: any) {
        console.warn('Load profile error', e);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) { toast.error('Not signed in'); return; }

      const user_metadata = {
        username: form.username,
        first_name: form.firstName,
        last_name: form.lastName,
        phone: form.phone,
        bio: form.bio
      };

      const { error } = await supabase.from('system_users').upsert({
        id: user.id,
        email: form.email,
        user_metadata
      }, { onConflict: 'id' });
      if (error) throw error;

      toast.success('Profile saved');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={form.email} disabled />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={form.username} onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))} placeholder="johndoe" />
                </div>
                <div>
                  <Label htmlFor="first">First Name</Label>
                  <Input id="first" value={form.firstName} onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="John" />
                </div>
                <div>
                  <Label htmlFor="last">Last Name</Label>
                  <Input id="last" value={form.lastName} onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Doe" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+123456789" />
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell us about yourself" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
