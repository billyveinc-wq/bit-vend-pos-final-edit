import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle,
  Headphones,
  Users,
  Building2,
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

const ContactPage = () => {
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      subject: '',
      message: '',
      inquiryType: ''
    });
    
    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email',
      contact: 'support@bitvend.com',
      availability: '24/7 response within 24 hours'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak with our team',
      contact: '+1 (555) 123-4567',
      availability: 'Mon-Fri, 9AM-6PM EST'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Instant help when you need it',
      contact: 'Available in-app',
      availability: 'Mon-Fri, 9AM-6PM EST'
    }
  ];

  const offices = [
    {
      city: 'San Francisco',
      address: '123 Tech Street, Suite 100\nSan Francisco, CA 94105',
      phone: '+1 (555) 123-4567',
      email: 'sf@bitvend.com'
    },
    {
      city: 'Nairobi',
      address: 'Westlands Business Park\nNairobi, Kenya',
      phone: '+254 700 123 456',
      email: 'nairobi@bitvend.com'
    },
    {
      city: 'London',
      address: '456 Business Ave\nLondon, UK EC2A 4DP',
      phone: '+44 20 1234 5678',
      email: 'london@bitvend.com'
    }
  ];

  return (
    <div className="min-h-screen bg-background" data-page="contact">
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
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-orange-500/10 to-blue-600/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
              Contact Us
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-foreground">Get in Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Have questions about BitVend POS? Need help getting started? Our team is here to help you 
              find the perfect solution for your business.
            </p>
          </div>
        </div>
      </section>

      <div className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a Message</CardTitle>
                  <p className="text-muted-foreground">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="john@company.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          placeholder="Your Business Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inquiryType">Inquiry Type</Label>
                      <Select value={formData.inquiryType} onValueChange={(value) => handleInputChange('inquiryType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Sales & Pricing</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="demo">Request Demo</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="billing">Billing & Accounts</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="How can we help you?"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Tell us more about your needs..."
                        className="min-h-[120px]"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white" disabled={isLoading}>
                      {isLoading ? (
                        'Sending Message...'
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Contact Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactMethods.map((method, index) => {
                    const IconComponent = method.icon;
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{method.title}</h3>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                          <p className="text-sm font-medium text-primary">{method.contact}</p>
                          <p className="text-xs text-muted-foreground">{method.availability}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Why Choose BitVend?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">24/7 customer support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">99.9% uptime guarantee</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">14-day free trial</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Setup in under 5 minutes</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Office Locations */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Global Offices
              </h2>
              <p className="text-xl text-muted-foreground">
                We're here to support you wherever you are in the world.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {offices.map((office, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl">{office.city}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {office.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{office.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{office.email}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="text-center bg-gradient-to-br from-orange-500/10 to-blue-600/10 rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Need Immediate Help?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Check out our comprehensive help center or start a live chat for instant support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8">
                Visit Help Center
              </Button>
              <Button variant="outline" size="lg" className="px-8 border-white text-white hover:bg-white hover:text-orange-600">
                Start Live Chat
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;