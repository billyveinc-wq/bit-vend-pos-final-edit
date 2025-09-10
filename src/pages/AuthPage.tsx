import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
  Gift,
  Users,
  ArrowLeft,
  Sun,
  Moon,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Shield } from 'lucide-react';

const AuthPage = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'signin';
  const referralCode = searchParams.get('ref') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCodeInput, setReferralCodeInput] = useState(referralCode);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [currentMode, setCurrentMode] = useState<'signin' | 'signup' | 'forgot' | 'reset'>(mode as any);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // If user is already authenticated, redirect to dashboard instead of staying on auth page
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        console.warn('Auth check failed (offline or misconfigured Supabase). Proceeding without redirect.');
      }
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        if ((new URLSearchParams(window.location.search)).get('mode') === 'reset') return;
        navigate('/dashboard', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if this is an admin login
      if (email === 'admn.bitvend@gmail.com') {
        // First, try authenticating with Supabase (in case admin is a Supabase user)
        try {
          const { error: supErr } = await supabase.auth.signInWithPassword({ email, password });
          if (!supErr) {
            // successful Supabase auth -> create local admin session and redirect
            localStorage.setItem('admin-session', JSON.stringify({
              email: email,
              loginTime: new Date().toISOString(),
              role: 'super_admin'
            }));
            toast.success('Admin login successful! Redirecting to admin dashboard...');
            navigate('/dashboard/superadmin');
            return;
          }
        } catch (err) {
          console.warn('Supabase admin login attempt failed', err);
        }

        // Fallback: check local stored admin password (for local/demo admin)
        const stored = localStorage.getItem('admin-password') || 'admin123';
        if (password === stored) {
          localStorage.setItem('admin-session', JSON.stringify({
            email: email,
            loginTime: new Date().toISOString(),
            role: 'super_admin'
          }));
          toast.success('Admin login successful! Redirecting to admin dashboard...');
          navigate('/dashboard/superadmin');
          return;
        }

        toast.error('Invalid admin credentials');
        return;
      }
      
      // Regular user authentication via Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('system_users').upsert({ id: user.id, last_sign_in_at: new Date().toISOString() }, { onConflict: 'id' });
          }
        } catch {}
      }

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and click the confirmation link before signing in.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success('Welcome back! Redirecting to dashboard...');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const [newPw, setNewPw] = useState('');
  const [newPw2, setNewPw2] = useState('');

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (newPw.length < 8) { toast.error('Password must be at least 8 characters'); setIsLoading(false); return; }
    if (newPw !== newPw2) { toast.error('Passwords do not match'); setIsLoading(false); return; }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) { toast.error(error.message); setIsLoading(false); return; }
      toast.success('Password updated. Please sign in.');
      setCurrentMode('signin');
    } catch (err) {
      console.error('Reset password error', err);
      toast.error('Failed to update password');
    } finally { setIsLoading(false); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            company_name: companyName,
            phone: phone,
            referral_code: referralCodeInput,
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists. Please sign in instead.');
          setCurrentMode('signin');
        } else {
          toast.error(error.message);
        }
        return;
      }

      // If this is the reserved admin email, create an admin session locally and redirect to admin dashboard
      if (email === 'admn.bitvend@gmail.com') {
        localStorage.setItem('admin-session', JSON.stringify({
          email: email,
          loginTime: new Date().toISOString(),
          role: 'super_admin'
        }));
        toast.success('Admin account created! Redirecting to admin dashboard...');
        navigate('/dashboard/superadmin');
        // Also insert into system_users table for admin visibility
        try {
          if (signUpData?.user) {
            await supabase.from('system_users').upsert({ id: signUpData.user.id, email, user_metadata: { full_name: fullName, company_name: companyName, phone }, created_at: new Date().toISOString() });
          }
        } catch (err) {
          console.warn('Failed to upsert admin into system_users', err);
        }
        return;
      }

      // Insert basic system_users row so admin dashboard can see this new user (mirror of auth.users)
      try {
        if (signUpData?.user) {
          await supabase.from('system_users').upsert({ id: signUpData.user.id, email, user_metadata: { full_name: fullName, company_name: companyName, phone }, created_at: new Date().toISOString() });
        }
      } catch (err) {
        console.warn('Failed to upsert new user into system_users', err);
      }

      // Create starter plan trial (14 days) if no plan chosen
      try {
        if (signUpData?.user) {
          const now = new Date();
          const expires = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
          await supabase.from('user_subscriptions').insert({
            user_id: signUpData.user.id,
            plan_id: 'starter',
            status: 'active',
            started_at: now.toISOString(),
            expires_at: expires.toISOString()
          });
        }
      } catch (err) {
        console.warn('Failed to create trial subscription', err);
      }

      // Link user to company (create if missing). Make first user admin by default.
      try {
        if (signUpData?.user && companyName) {
          const { id: newUserId } = signUpData.user;
          // Find or create company
          const { data: existing } = await supabase.from('companies').select('id').eq('name', companyName).maybeSingle();
          let companyId = existing?.id as number | undefined;
          if (!companyId) {
            const { data: created, error: cErr } = await supabase.from('companies').insert({ name: companyName }).select('id').single();
            if (!cErr) companyId = created.id;
          }
          if (companyId) {
            // How many users linked to this company?
            const { count } = await supabase.from('company_users').select('id', { count: 'exact', head: true }).eq('company_id', companyId);
            const isFirst = (count || 0) === 0;
            // Set company_users role accordingly
            await supabase.from('company_users').upsert({ company_id: companyId, user_id: newUserId, role: isFirst ? 'owner' : 'member' });
            await supabase.from('system_users').update({ company_id: companyId }).eq('id', newUserId);
            if (isFirst) {
              // Ensure an 'admin' role exists and assign it to the first user
              const { data: adminRole } = await supabase.from('roles').select('id').eq('name', 'admin').maybeSingle();
              let roleId = adminRole?.id as number | undefined;
              if (!roleId) {
                const { data: createdRole } = await supabase.from('roles').insert({ name: 'admin', description: 'Administrator' }).select('id').single();
                roleId = createdRole?.id;
              }
              if (roleId) {
                const { data: existingUR } = await supabase.from('user_roles').select('user_id, role_id').eq('user_id', newUserId).eq('role_id', roleId).maybeSingle();
                if (!existingUR) await supabase.from('user_roles').insert({ user_id: newUserId, role_id: roleId });
              }
            }
          }
        }
      } catch (err) {
        console.warn('Failed to link user to company', err);
      }

      // If a promo/referral code was provided, check if it exists and attach to user_promotions
      if (referralCodeInput && signUpData?.user) {
        try {
          const { data: promoData, error: promoErr } = await supabase.from('promo_codes').select('*').eq('code', referralCodeInput).maybeSingle();
          if (promoErr) console.warn('Promo lookup error', promoErr);
          if (promoData) {
            // record user promotion in user_promotions table
            const { error: upErr } = await supabase.from('user_promotions').insert({
              user_id: signUpData.user.id,
              promo_code_id: promoData.id,
              discount: promoData.discount,
              influencer_name: promoData.name
            });
            if (upErr) console.warn('Failed to attach promo to user:', upErr);
            else toast.success(`Promo code applied: ${promoData.discount}% off`);
          }
        } catch (err) {
          console.warn('Promo lookup failed', err);
        }
      }

      toast.success('Account created! Please check your email to confirm your account.');

      // Show success message
      setCurrentMode('signin');
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" data-page="auth">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BV</span>
              </div>
              <span className="font-bold text-xl">BitVend</span>
            </Link>
            <div className="flex items-center space-x-4">
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
              <Button asChild variant="ghost">
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500/10 via-background to-blue-600/10">
        <div className="container mx-auto px-4 max-w-7xl flex items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <Badge className="mb-6 bg-gradient-to-r from-orange-500/10 to-blue-600/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
                {currentMode === 'signin' && 'Welcome Back'}
                {currentMode === 'signup' && 'Start Your Free Trial'}
                {currentMode === 'forgot' && 'Reset Your Password'}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-foreground">
                  {currentMode === 'signin' && 'Sign In'}
                  {currentMode === 'signup' && 'Join BitVend'}
                  {currentMode === 'forgot' && 'Reset Password'}
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                {currentMode === 'signin' && 'Sign in to access your POS dashboard'}
                {currentMode === 'signup' && '14 days free, no credit card required'}
                {currentMode === 'forgot' && 'Enter your email to reset your password'}
              </p>
            </div>

            <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <Tabs value={currentMode} onValueChange={(value) => setCurrentMode(value as any)}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  {/* Sign In Form */}
                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signin-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white" disabled={isLoading}>
                        {isLoading ? 'Signing In...' : 'Sign In'}
                      </Button>

                      <div className="text-center">
                        <Button
                          type="button"
                          variant="link"
                          className="text-sm"
                          onClick={() => setCurrentMode('forgot')}
                        >
                          Forgot your password?
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

                  {/* Sign Up Form */}
                  <TabsContent value="signup">
                    {referralCodeInput && (
                      <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                        <Gift className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 dark:text-green-200">
                          🎉 Referral code applied! You'll get an extra 30 days free trial.
                        </AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="fullName"
                              placeholder="John Doe"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+254712345678"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          placeholder="Your Business Name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Create password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10 pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="pl-10 pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                        <div className="relative">
                          <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="referralCode"
                            placeholder="Enter referral code"
                            value={referralCodeInput}
                            onChange={(e) => setReferralCodeInput(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        {referralCodeInput && (
                          <p className="text-sm text-green-600">
                            ✨ You'll get an extra 30 days free with this referral!
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="terms"
                          checked={acceptTerms}
                          onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                        />
                        <Label htmlFor="terms" className="text-sm">
                          I agree to the{' '}
                          <a href="/terms" className="text-orange-600 hover:underline">
                            Terms of Service
                          </a>{' '}
                          and{' '}
                          <a href="/privacy" className="text-orange-600 hover:underline">
                            Privacy Policy
                          </a>
                        </Label>
                      </div>

                      <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white" disabled={isLoading || !acceptTerms}>
                        {isLoading ? 'Creating Account...' : 'Start Free Trial'}
                      </Button>

                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            14-day free trial
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            No credit card required
                          </div>
                        </div>
                      </div>
                    </form>
                  </TabsContent>

                  {/* Reset Password Form (after email link) */}
                  <TabsContent value="reset">
                    <form onSubmit={handleCompleteReset} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPw">New Password</Label>
                        <Input id="newPw" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPw2">Confirm New Password</Label>
                        <Input id="newPw2" type="password" value={newPw2} onChange={(e) => setNewPw2(e.target.value)} required />
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white" disabled={isLoading}>
                        Set New Password
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Forgot Password Form */}
                  <TabsContent value="forgot">
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Enter your email address and we'll send you a link to reset your password.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white" disabled={isLoading}>
                        {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
                      </Button>

                      <div className="text-center">
                        <Button
                          type="button"
                          variant="link"
                          className="text-sm"
                          onClick={() => setCurrentMode('signin')}
                        >
                          Back to Sign In
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center mt-8 text-sm text-muted-foreground">
              Need help?{' '}
              <Link to="/contact" className="text-orange-600 hover:underline">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuthPage;
