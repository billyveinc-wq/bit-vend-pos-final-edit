import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Database, Eye, Lock, Users, Globe, Cookie, FileText, Settings, Mail, AlertTriangle } from 'lucide-react';

const PrivacyPolicy = () => {
  const [isVisible, setIsVisible] = useState(false);
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500/5 via-background to-purple-600/5" data-page="privacy">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-blue-200/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className={`flex h-16 items-center justify-between transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <span className="text-white font-bold text-sm">BV</span>
              </div>
              <span className="font-bold text-xl logo-gradient animate-gradient-fast bg-clip-text text-transparent">BitVend</span>
            </Link>
            <Button asChild variant="ghost" className="hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-600/10 transition-all duration-300">
              <Link to="/auth">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                Back to Sign Up
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-4xl py-12">
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 mb-6">
            <Eye className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Privacy & Data Protection</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground">Last updated: {currentDate}</p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <Card className={`border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '100ms'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <FileText className="h-5 w-5" />
                </div>
                1. Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                At BitVend, we take your privacy seriously. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our Point of Sale (POS) system and related services.
              </p>
              <p>
                By using BitVend, you consent to the data practices described in this policy. If you do not agree with our practices, please do not use our service.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className={`border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-r from-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '200ms'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <Database className="h-5 w-5" />
                </div>
                2. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">Personal Information</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, phone number, company name</li>
                <li><strong>Business Data:</strong> Product information, sales records, customer data, inventory details</li>
                <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely by third-party providers)</li>
                <li><strong>Profile Information:</strong> User preferences, settings, and customizations</li>
              </ul>
              
              <h4 className="font-semibold">Automatically Collected Information</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Usage Data:</strong> How you interact with our service, features used, time spent</li>
                <li><strong>Device Information:</strong> Browser type, operating system, IP address, device identifiers</li>
                <li><strong>Location Data:</strong> General geographic location (country/region) for service optimization</li>
                <li><strong>Cookies and Tracking:</strong> Session data, preferences, and analytics information</li>
              </ul>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className={`border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '300ms'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <Settings className="h-5 w-5" />
                </div>
                3. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Provide our services:</strong> Enable POS functionality, process transactions, manage inventory</li>
                <li><strong>Account management:</strong> Create and maintain your account, process payments, provide support</li>
                <li><strong>Communication:</strong> Send service updates, security alerts, and customer support responses</li>
                <li><strong>Improvement:</strong> Analyze usage patterns to enhance our service and develop new features</li>
                <li><strong>Security:</strong> Detect fraud, prevent abuse, and protect our service and users</li>
                <li><strong>Legal compliance:</strong> Meet regulatory requirements and respond to legal requests</li>
                <li><strong>Marketing:</strong> Send promotional content (with your consent, and you can opt out anytime)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className={`border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-r from-red-50/50 to-purple-50/50 dark:from-red-950/20 dark:to-purple-950/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '400ms'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
                  <Lock className="h-5 w-5" />
                </div>
                4. Data Security & Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We implement comprehensive security measures to protect your data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                <li><strong>Access Controls:</strong> Role-based access with multi-factor authentication</li>
                <li><strong>Infrastructure:</strong> Secure cloud hosting with regular security audits and penetration testing</li>
                <li><strong>Monitoring:</strong> 24/7 security monitoring and incident response procedures</li>
                <li><strong>Compliance:</strong> SOC 2 Type II, GDPR, and industry-standard security practices</li>
                <li><strong>Data Backup:</strong> Regular automated backups with secure off-site storage</li>
              </ul>
              <div className="mt-4 p-4 border border-red-200 rounded-lg bg-gradient-to-r from-red-50 to-red-100 dark:border-red-800 dark:bg-gradient-to-r dark:from-red-950/50 dark:to-red-900/50 shadow-inner">
                <div className="flex gap-3">
                  <div className="p-1 rounded-full bg-red-500/20">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  </div>
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                    While we use industry-leading security measures, no system is 100% secure. We encourage you to use strong passwords and enable two-factor authentication.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card className={`border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '500ms'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <Users className="h-5 w-5" />
                </div>
                5. Data Sharing & Third Parties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We may share your information in limited circumstances:</p>
              <h4 className="font-semibold">Service Providers</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Payment Processors:</strong> Stripe, PayPal, M-Pesa providers for payment processing</li>
                <li><strong>Cloud Infrastructure:</strong> AWS, Google Cloud for hosting and data storage</li>
                <li><strong>Analytics:</strong> Usage analytics to improve our service (anonymized data only)</li>
                <li><strong>Support Tools:</strong> Customer service platforms to provide better support</li>
              </ul>
              
              <h4 className="font-semibold">Legal Requirements</h4>
              <p>We may disclose information when required by law, court order, or to protect our rights and safety.</p>
              
              <h4 className="font-semibold">Business Transfers</h4>
              <p>In case of merger, acquisition, or sale, your data may be transferred with appropriate notice.</p>
            </CardContent>
          </Card>

          {/* Cookies & Tracking */}
          <Card className={`border-l-4 border-l-yellow-500 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/20 dark:to-orange-950/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '600ms'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                  <Cookie className="h-5 w-5" />
                </div>
                6. Cookies & Tracking Technologies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for basic functionality and security</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and customizations</li>
                <li><strong>Analytics Cookies:</strong> Understand usage patterns and improve our service</li>
                <li><strong>Marketing Cookies:</strong> Provide relevant content and measure campaign effectiveness</li>
              </ul>
              <p>You can control cookie preferences through your browser settings or our cookie preference center.</p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className={`border-l-4 border-l-indigo-500 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/20 dark:to-blue-950/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '700ms'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                  <Shield className="h-5 w-5" />
                </div>
                7. Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Depending on your location, you may have the following rights:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
                <li><strong>Objection:</strong> Object to certain types of processing</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
              <p>To exercise these rights, contact us at privacy@bitvend.com or through your account settings.</p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className={`border-l-4 border-l-teal-500 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-r from-teal-50/50 to-blue-50/50 dark:from-teal-950/20 dark:to-blue-950/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '800ms'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                  <Database className="h-5 w-5" />
                </div>
                8. Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We retain your information for different periods based on the type of data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Data:</strong> As long as your account is active plus 30 days after deletion</li>
                <li><strong>Business Data:</strong> 7 years for financial records, as required by law</li>
                <li><strong>Usage Data:</strong> 2 years for analytics and service improvement</li>
                <li><strong>Marketing Data:</strong> Until you unsubscribe or object</li>
                <li><strong>Security Logs:</strong> 1 year for security and fraud prevention</li>
              </ul>
              <p>Data is securely deleted when no longer needed, except where required by law.</p>
            </CardContent>
          </Card>

          {/* International Transfers */}
          <Card className={`border-l-4 border-l-pink-500 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-r from-pink-50/50 to-purple-50/50 dark:from-pink-950/20 dark:to-purple-950/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '900ms'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                  <Globe className="h-5 w-5" />
                </div>
                9. International Data Transfers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                BitVend operates globally, and your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Standard Contractual Clauses (SCCs) approved by regulatory authorities</li>
                <li>Adequacy decisions where applicable</li>
                <li>Certification schemes and codes of conduct</li>
                <li>Encryption and other technical safeguards</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className={`border-l-4 border-l-violet-500 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-r from-violet-50/50 to-blue-50/50 dark:from-violet-950/20 dark:to-blue-950/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '1000ms'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 text-white">
                  <Mail className="h-5 w-5" />
                </div>
                10. Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> privacy@bitvend.com</li>
                <li><strong>Support Portal:</strong> Available through your dashboard</li>
                <li><strong>Data Protection Officer:</strong> dpo@bitvend.com</li>
                <li><strong>Mailing Address:</strong> BitVend Privacy Team, [Your Address]</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                We will respond to your privacy-related inquiries within 30 days.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className={`text-center mt-16 pt-8 border-t border-gradient-to-r from-blue-200/50 via-purple-200/50 to-blue-200/50 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '1100ms'}}>
          <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-8 mb-8 shadow-lg">
            <p className="text-lg text-muted-foreground mb-6 font-medium">
              Your privacy is important to us. We are committed to protecting your personal information and being transparent about our data practices.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Link to="/auth">Return to Sign Up</Link>
              </Button>
              <Button variant="outline" asChild className="border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 transition-all duration-300 transform hover:scale-105">
                <Link to="/terms">Terms of Service</Link>
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Questions about our privacy practices?</p>
            <Link to="/contact" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-300">
              Contact our privacy team →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
