import React from 'react';
import { CheckCircle, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';

export const showSuccessToast = (message: string, icon?: React.ReactNode) => {
  toast.success(message, {
    icon: icon || <CheckCircle className="w-4 h-4" />,
    duration: 2000,
    style: {
      background: 'hsl(var(--card))',
      color: 'hsl(var(--card-foreground))',
      border: '1px solid hsl(var(--border))',
    },
  });
};

export const showSaveToast = (message: string = 'Settings saved successfully!') => {
  showSuccessToast(message, <Save className="w-4 h-4 text-green-500" />);
};

export const showUploadToast = (message: string = 'Image uploaded successfully!') => {
  showSuccessToast(message, <Upload className="w-4 h-4 text-blue-500" />);
};

export const showAutoSaveToast = () => {
  toast.success('Auto-saved', {
    icon: <Save className="w-3 h-3 text-green-500" />,
    duration: 1000,
    position: 'bottom-right',
    style: {
      background: 'hsl(var(--card))',
      color: 'hsl(var(--card-foreground))',
      border: '1px solid hsl(var(--border))',
      padding: '8px 12px',
      fontSize: '12px',
    },
  });
};