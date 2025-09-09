import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Database, 
  Bell, 
  Shield, 
  Globe,
  Mail,
  Smartphone,
  Monitor,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

const Application = () => {
  const [appSettings, setAppSettings] = useState({
    appName: 'POS System',
    appVersion: '2.1.0',
    appDescription: 'Advanced Point of Sale Management System',
    maintenanceMode: false,
    debugMode: false,
    apiLogging: true,
    autoBackup: true,
    backupFrequency: 'daily',
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    defaultLanguage: 'en',
    defaultCurrency: 'USD',
    defaultTimezone: 'UTC',
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    supportEmail: 'support@company.com',
    supportPhone: '+1-555-0123'
  });

  const [applicationStats] = useState([
    { name: 'Total Users', value: '0', icon: Monitor, status: 'healthy' },
    { name: 'Active Sessions', value: '0', icon: Activity, status: 'healthy' },
    { name: 'Database Size', value: '0 MB', icon: Database, status: 'healthy' },
    { name: 'API Calls Today', value: '0', icon: Globe, status: 'healthy' },
    { name: 'Uptime', value: '100%', icon: CheckCircle, status: 'healthy' },
    { name: 'Response Time', value: '0ms', icon: Clock, status: 'healthy' }
  ]);

  const [systemLogs] = useState([]);

  const handleSaveSettings = () => {
    toast.success('Application settings saved successfully!');
  };

  const handleRestartApp = () => {
    toast.success('Application restart scheduled!');
  };

  const getLogLevelColor = (level: string) => {
    const colors = {
      INFO: 'text-blue-600',
      WARNING: 'text-yellow-600',
      ERROR: 'text-red-600',
      DEBUG: 'text-gray-600'
    };
    return colors[level as keyof typeof colors] || 'text-gray-600';
  };

  const getLogLevelBadge = (level: string) => {
    const variants: { [key: string]: "default" | "destructive" | "outline" | "secondary" } = {
      INFO: 'default',
      WARNING: 'outline',
      ERROR: 'destructive',
      DEBUG: 'secondary'
    };
    return variants[level] || 'secondary';
  };

  const getStatStatusColor = (status: string) => {
    const colors = {
      healthy: 'text-green-600',
      warning: 'text-yellow-600',
      critical: 'text-red-600'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Application Settings</h1>
          <p className="text-muted-foreground">Configure application settings and monitor system health</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRestartApp} className="bg-secondary hover:bg-secondary-hover text-secondary-foreground">
            <RefreshCw className="w-4 h-4 mr-2" />
            Restart App
          </Button>
          <Button onClick={handleSaveSettings} className="bg-save hover:bg-save-hover text-save-foreground">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      {/* Application Stats */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        {applicationStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    stat.status === 'healthy' ? 'bg-green-100 dark:bg-green-900/20' :
                    stat.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                    'bg-red-100 dark:bg-red-900/20'
                  }`}>
                    <Icon className={`w-4 h-4 ${getStatStatusColor(stat.status)}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground truncate">{stat.name}</p>
                    <p className={`font-bold ${getStatStatusColor(stat.status)}`}>{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="appName">Application Name</Label>
                  <Input
                    id="appName"
                    value={appSettings.appName}
                    onChange={(e) => setAppSettings({ ...appSettings, appName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appVersion">Version</Label>
                  <Input
                    id="appVersion"
                    value={appSettings.appVersion}
                    onChange={(e) => setAppSettings({ ...appSettings, appVersion: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="appDescription">Description</Label>
                <Textarea
                  id="appDescription"
                  value={appSettings.appDescription}
                  onChange={(e) => setAppSettings({ ...appSettings, appDescription: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">Default Language</Label>
                  <Select value={appSettings.defaultLanguage} onValueChange={(value) => setAppSettings({ ...appSettings, defaultLanguage: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultCurrency">Default Currency</Label>
                  <Select value={appSettings.defaultCurrency} onValueChange={(value) => setAppSettings({ ...appSettings, defaultCurrency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultTimezone">Default Timezone</Label>
                  <Select value={appSettings.defaultTimezone} onValueChange={(value) => setAppSettings({ ...appSettings, defaultTimezone: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">EST</SelectItem>
                      <SelectItem value="PST">PST</SelectItem>
                      <SelectItem value="GMT">GMT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Put the application in maintenance mode</p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={appSettings.maintenanceMode}
                    onCheckedChange={(checked) => setAppSettings({ ...appSettings, maintenanceMode: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="debugMode">Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable debug logging and error details</p>
                  </div>
                  <Switch
                    id="debugMode"
                    checked={appSettings.debugMode}
                    onCheckedChange={(checked) => setAppSettings({ ...appSettings, debugMode: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="apiLogging">API Logging</Label>
                    <p className="text-sm text-muted-foreground">Log all API requests and responses</p>
                  </div>
                  <Switch
                    id="apiLogging"
                    checked={appSettings.apiLogging}
                    onCheckedChange={(checked) => setAppSettings({ ...appSettings, apiLogging: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={appSettings.maxLoginAttempts}
                    onChange={(e) => setAppSettings({ ...appSettings, maxLoginAttempts: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={appSettings.sessionTimeout}
                    onChange={(e) => setAppSettings({ ...appSettings, sessionTimeout: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={appSettings.emailNotifications}
                    onCheckedChange={(checked) => setAppSettings({ ...appSettings, emailNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                    </div>
                  </div>
                  <Switch
                    checked={appSettings.smsNotifications}
                    onCheckedChange={(checked) => setAppSettings({ ...appSettings, smsNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send browser push notifications</p>
                    </div>
                  </div>
                  <Switch
                    checked={appSettings.pushNotifications}
                    onCheckedChange={(checked) => setAppSettings({ ...appSettings, pushNotifications: checked })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={appSettings.supportEmail}
                    onChange={(e) => setAppSettings({ ...appSettings, supportEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Support Phone</Label>
                  <Input
                    id="supportPhone"
                    value={appSettings.supportPhone}
                    onChange={(e) => setAppSettings({ ...appSettings, supportPhone: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Backup Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Backup</Label>
                  <p className="text-sm text-muted-foreground">Automatically backup data at scheduled intervals</p>
                </div>
                <Switch
                  checked={appSettings.autoBackup}
                  onCheckedChange={(checked) => setAppSettings({ ...appSettings, autoBackup: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Select value={appSettings.backupFrequency} onValueChange={(value) => setAppSettings({ ...appSettings, backupFrequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No system logs available</p>
                    <p className="text-sm">System activity will appear here</p>
                  </div>
                ) : (
                  systemLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <Badge variant={getLogLevelBadge(log.level)}>
                        {log.level}
                      </Badge>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{log.category}</span>
                          <span className="text-sm text-muted-foreground">{log.timestamp}</span>
                        </div>
                        <p className="text-sm">{log.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Application;