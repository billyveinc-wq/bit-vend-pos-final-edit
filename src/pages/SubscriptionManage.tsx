import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import SubscriptionManager from '@/components/SubscriptionManager';

const SubscriptionManage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center gap-4 animate-slideInLeft">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/subscription')}
          onClick={() => navigate('/dashboard/subscription')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Plans
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Subscription</h1>
          <p className="text-muted-foreground">Control your subscription, billing, and payment methods</p>
        </div>
      </div>

      {/* Subscription Manager Component */}
      <div className="animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
        <SubscriptionManager />
      </div>
    </div>
  );
};

export default SubscriptionManage;