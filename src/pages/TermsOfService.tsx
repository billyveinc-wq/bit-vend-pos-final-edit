import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, AlertTriangle, CreditCard, Users, Database, FileText } from 'lucide-react';

const TermsOfService = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BV</span>
              </div>
              <span className="font-bold text-xl logo-gradient animate-gradient-fast bg-clip-text text-transparent">BitVend</span>
            </Link>
            <Button asChild variant="ghost">
              <Link to="/auth">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign Up
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-4xl py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {currentDate}</p>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                1. Introduction and Acceptance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Welcome to BitVend, a comprehensive Point of Sale (POS) and business management system. These Terms of Service ("Terms") govern your use of our web-based POS software, including all features, tools, and services provided by BitVend ("we," "us," or "our").
              </p>
              <p>
                By creating an account, accessing, or using BitVend, you agree to be bound by these Terms. If you do not agree to these Terms, do not use our service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                2. Service Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                BitVend provides a cloud-based Point of Sale system that includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Sales Management:</strong> Complete checkout process, sales tracking, receipts, quotations, and sales returns</li>
                <li><strong>Inventory Control:</strong> Product management, stock tracking, transfers, adjustments, low-stock alerts, and barcode generation</li>
                <li><strong>Financial Management:</strong> Expense tracking, income recording, financial reports, balance sheets, and cash flow statements</li>
                <li><strong>Customer & Supplier Management:</strong> Contact management, transaction history, and relationship tracking</li>
                <li><strong>Multi-User Access:</strong> Role-based permissions, employee management, and attendance tracking</li>
                <li><strong>Payment Processing:</strong> Integration with multiple payment providers including M-Pesa, PayPal, card payments, and cash transactions</li>
                <li><strong>Reporting & Analytics:</strong> Comprehensive sales reports, stock reports, financial statements, and business analytics</li>
                <li><strong>Data Management:</strong> Secure cloud storage, backup services, and data export capabilities</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                3. User Responsibilities and Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You are responsible for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Maintaining the security and confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Ensuring accurate product information, pricing, and inventory data</li>
                <li>Compliance with all applicable laws and regulations in your jurisdiction</li>
                <li>Proper handling of customer data and payment information</li>
                <li>Regular backup of your business data (while we provide backup services, you should maintain your own records)</li>
                <li>Training your employees on proper system usage and security practices</li>
              </ul>
              <div className="mt-4 p-4 border border-orange-200 rounded-lg bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                <div className="flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    You must immediately notify us of any unauthorized access or security breaches of your account.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                4. Payment Terms and Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">Subscription Plans</h4>
              <p>
                BitVend offers various subscription plans with different features and limits. All subscription fees are billed in advance on a monthly or annual basis.
              </p>
              
              <h4 className="font-semibold">Free Trial</h4>
              <p>
                New users receive a 14-day free trial with full access to the system. No credit card is required for the trial period. The trial automatically expires after 14 days.
              </p>
              
              <h4 className="font-semibold">Payment Processing</h4>
              <p>
                For payment processing services (M-Pesa, PayPal, card payments), additional fees may apply as charged by the respective payment providers. These fees are separate from your BitVend subscription.
              </p>
              
              <h4 className="font-semibold">Refund Policy</h4>
              <p>
                Subscription fees are non-refundable except as required by law. You may cancel your subscription at any time, and the cancellation will take effect at the end of your current billing period.
              </p>
            </CardContent>
          </Card>

          {/* Data and Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                5. Data Ownership and Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">Your Data</h4>
              <p>
                You retain ownership of all business data you input into BitVend, including customer information, sales data, inventory records, and financial information.
              </p>
              
              <h4 className="font-semibold">Data Security</h4>
              <p>
                We implement industry-standard security measures to protect your data, including encryption, secure data centers, and regular security audits. However, no system is 100% secure, and you acknowledge the inherent risks of internet-based services.
              </p>
              
              <h4 className="font-semibold">Data Backup and Recovery</h4>
              <p>
                We provide automated daily backups of your data. In the event of data loss, we will make commercially reasonable efforts to restore your data from our most recent backup.
              </p>
              
              <h4 className="font-semibold">Data Export</h4>
              <p>
                You can export your data at any time through our export features. Upon account termination, you have 30 days to export your data before it may be permanently deleted.
              </p>
            </CardContent>
          </Card>

          {/* Prohibited Uses */}
          <Card>
            <CardHeader>
              <CardTitle>6. Prohibited Uses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You may not use BitVend for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Any illegal activities or to facilitate illegal transactions</li>
                <li>Processing payments for prohibited goods or services</li>
                <li>Violating any applicable laws, regulations, or third-party rights</li>
                <li>Transmitting malware, viruses, or harmful code</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Reverse engineering, decompiling, or attempting to extract source code</li>
                <li>Reselling or redistributing the service without written permission</li>
                <li>Using the service to compete with BitVend</li>
              </ul>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle>7. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, BITVEND SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL.
              </p>
              <p>
                Our total liability for any claims related to the service shall not exceed the amount you paid us in the twelve months preceding the claim.
              </p>
              <p>
                We are not responsible for any issues arising from third-party payment processors, internet connectivity problems, or force majeure events.
              </p>
            </CardContent>
          </Card>

          {/* Service Availability */}
          <Card>
            <CardHeader>
              <CardTitle>8. Service Availability and Modifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance will be announced in advance when possible.
              </p>
              <p>
                We reserve the right to modify, suspend, or discontinue the service at any time with reasonable notice. We may also update these Terms from time to time, and continued use constitutes acceptance of the updated Terms.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>9. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Either party may terminate the service agreement at any time. You can cancel your subscription through your account settings or by contacting support.
              </p>
              <p>
                We may suspend or terminate your account immediately if you violate these Terms or engage in fraudulent activity.
              </p>
              <p>
                Upon termination, your access to the service will cease, and your data will be retained for 30 days before permanent deletion.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>10. Governing Law and Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                These Terms are governed by the laws of the jurisdiction where BitVend is incorporated. Any disputes will be resolved through binding arbitration or in the courts of competent jurisdiction.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>11. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have questions about these Terms or need support, please contact us:
              </p>
              <ul className="list-none space-y-2">
                <li>Email: support@bitvend.com</li>
                <li>Support Portal: Available through your dashboard</li>
                <li>Business Hours: Monday-Friday, 9 AM - 6 PM</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-muted-foreground mb-4">
            By using BitVend, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link to="/auth">Return to Sign Up</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/privacy">Privacy Policy</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
