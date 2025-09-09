import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Layout,
  Palette,
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  Save,
  RotateCcw,
  Sidebar,
  Menu,
  Grid,
  Type,
  Zap,
  Moon,
  Sun
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

const LayoutPage = () => {
  const { theme, setTheme } = useTheme();
  const [layoutSettings, setLayoutSettings] = useState({
    sidebarCollapsed: false,
    sidebarPosition: 'left',
    headerFixed: true,
    footerVisible: true,
    breadcrumbsVisible: true,
    compactMode: false,
    animationsEnabled: true,
    sidebarWidth: 256,
    headerHeight: 64,
    borderRadius: 8,
    spacing: 16,
    fontSize: 14,
    fontFamily: 'Inter',
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    accentColor: '#10b981',
    layout: 'default',
    grid: '12',
    containerWidth: 'full'
  });

  const [previewDevice, setPreviewDevice] = useState('desktop');

  const layoutOptions = [
    { value: 'default', label: 'Default Layout', description: 'Standard sidebar with main content area' },
    { value: 'minimal', label: 'Minimal Layout', description: 'Clean layout with minimal chrome' },
    { value: 'dashboard', label: 'Dashboard Layout', description: 'Optimized for dashboard and analytics' },
    { value: 'content', label: 'Content Layout', description: 'Focused on content with minimal distractions' }
  ];

  const colorThemes = [
    { name: 'Blue', primary: '#3b82f6', secondary: '#64748b', accent: '#10b981' },
    { name: 'Purple', primary: '#8b5cf6', secondary: '#64748b', accent: '#f59e0b' },
    { name: 'Green', primary: '#10b981', secondary: '#64748b', accent: '#3b82f6' },
    { name: 'Red', primary: '#ef4444', secondary: '#64748b', accent: '#10b981' },
    { name: 'Orange', primary: '#f97316', secondary: '#64748b', accent: '#3b82f6' },
    { name: 'Pink', primary: '#ec4899', secondary: '#64748b', accent: '#10b981' }
  ];

  const fontOptions = [
    'Inter',
    'Roboto',
    'Poppins',
    'Montserrat',
    'Open Sans',
    'Lato',
    'Source Sans Pro',
    'Nunito'
  ];

  const handleSaveLayout = () => {
    toast.success('Layout settings saved successfully!');
  };

  const handleResetLayout = () => {
    setLayoutSettings({
      sidebarCollapsed: false,
      sidebarPosition: 'left',
      headerFixed: true,
      footerVisible: true,
      breadcrumbsVisible: true,
      compactMode: false,
      animationsEnabled: true,
      sidebarWidth: 256,
      headerHeight: 64,
      borderRadius: 8,
      spacing: 16,
      fontSize: 14,
      fontFamily: 'Inter',
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      accentColor: '#10b981',
      layout: 'default',
      grid: '12',
      containerWidth: 'full'
    });
    toast.success('Layout settings reset to defaults!');
  };

  const handleColorThemeChange = (theme: any) => {
    setLayoutSettings({
      ...layoutSettings,
      primaryColor: theme.primary,
      secondaryColor: theme.secondary,
      accentColor: theme.accent
    });
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Layout Configuration</h1>
          <p className="text-muted-foreground">Customize the appearance and behavior of your application</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetLayout}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSaveLayout} className="bg-save hover:bg-save-hover text-save-foreground">
            <Save className="w-4 h-4 mr-2" />
            Save Layout
          </Button>
        </div>
      </div>

      {/* Preview Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Preview Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label>Preview Device:</Label>
            <div className="flex gap-2">
              {['desktop', 'tablet', 'mobile'].map((device) => {
                const Icon = getDeviceIcon(device);
                return (
                  <Button
                    key={device}
                    variant={previewDevice === device ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice(device)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {device.charAt(0).toUpperCase() + device.slice(1)}
                  </Button>
                );
              })}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Label>Theme:</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="layout" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="layout" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Layout Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Layout Type</Label>
                  <Select value={layoutSettings.layout} onValueChange={(value) => setLayoutSettings({ ...layoutSettings, layout: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {layoutOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {layoutOptions.find(o => o.value === layoutSettings.layout)?.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sidebar Collapsed</Label>
                      <p className="text-sm text-muted-foreground">Start with collapsed sidebar</p>
                    </div>
                    <Switch
                      checked={layoutSettings.sidebarCollapsed}
                      onCheckedChange={(checked) => setLayoutSettings({ ...layoutSettings, sidebarCollapsed: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Fixed Header</Label>
                      <p className="text-sm text-muted-foreground">Keep header fixed on scroll</p>
                    </div>
                    <Switch
                      checked={layoutSettings.headerFixed}
                      onCheckedChange={(checked) => setLayoutSettings({ ...layoutSettings, headerFixed: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Footer</Label>
                      <p className="text-sm text-muted-foreground">Display footer section</p>
                    </div>
                    <Switch
                      checked={layoutSettings.footerVisible}
                      onCheckedChange={(checked) => setLayoutSettings({ ...layoutSettings, footerVisible: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Breadcrumbs</Label>
                      <p className="text-sm text-muted-foreground">Display navigation breadcrumbs</p>
                    </div>
                    <Switch
                      checked={layoutSettings.breadcrumbsVisible}
                      onCheckedChange={(checked) => setLayoutSettings({ ...layoutSettings, breadcrumbsVisible: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">Reduce spacing and padding</p>
                    </div>
                    <Switch
                      checked={layoutSettings.compactMode}
                      onCheckedChange={(checked) => setLayoutSettings({ ...layoutSettings, compactMode: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid className="w-5 h-5" />
                  Dimensions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Sidebar Width: {layoutSettings.sidebarWidth}px</Label>
                  <Slider
                    value={[layoutSettings.sidebarWidth]}
                    onValueChange={(value) => setLayoutSettings({ ...layoutSettings, sidebarWidth: value[0] })}
                    max={400}
                    min={200}
                    step={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Header Height: {layoutSettings.headerHeight}px</Label>
                  <Slider
                    value={[layoutSettings.headerHeight]}
                    onValueChange={(value) => setLayoutSettings({ ...layoutSettings, headerHeight: value[0] })}
                    max={100}
                    min={48}
                    step={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Border Radius: {layoutSettings.borderRadius}px</Label>
                  <Slider
                    value={[layoutSettings.borderRadius]}
                    onValueChange={(value) => setLayoutSettings({ ...layoutSettings, borderRadius: value[0] })}
                    max={20}
                    min={0}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Spacing: {layoutSettings.spacing}px</Label>
                  <Slider
                    value={[layoutSettings.spacing]}
                    onValueChange={(value) => setLayoutSettings({ ...layoutSettings, spacing: value[0] })}
                    max={32}
                    min={8}
                    step={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Container Width</Label>
                  <Select value={layoutSettings.containerWidth} onValueChange={(value) => setLayoutSettings({ ...layoutSettings, containerWidth: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Width</SelectItem>
                      <SelectItem value="xl">Extra Large (1280px)</SelectItem>
                      <SelectItem value="lg">Large (1024px)</SelectItem>
                      <SelectItem value="md">Medium (768px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Appearance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Animations Enabled</Label>
                  <p className="text-sm text-muted-foreground">Enable smooth transitions and animations</p>
                </div>
                <Switch
                  checked={layoutSettings.animationsEnabled}
                  onCheckedChange={(checked) => setLayoutSettings({ ...layoutSettings, animationsEnabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Sidebar Position</Label>
                <Select value={layoutSettings.sidebarPosition} onValueChange={(value) => setLayoutSettings({ ...layoutSettings, sidebarPosition: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                Typography Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select value={layoutSettings.fontFamily} onValueChange={(value) => setLayoutSettings({ ...layoutSettings, fontFamily: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font} value={font}>{font}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Base Font Size: {layoutSettings.fontSize}px</Label>
                <Slider
                  value={[layoutSettings.fontSize]}
                  onValueChange={(value) => setLayoutSettings({ ...layoutSettings, fontSize: value[0] })}
                  max={18}
                  min={12}
                  step={1}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Color Themes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {colorThemes.map((colorTheme) => (
                  <div
                    key={colorTheme.name}
                    className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleColorThemeChange(colorTheme)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex gap-1">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: colorTheme.primary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: colorTheme.secondary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: colorTheme.accent }}
                        />
                      </div>
                      <span className="font-medium">{colorTheme.name}</span>
                    </div>
                    {layoutSettings.primaryColor === colorTheme.primary && (
                      <Badge variant="default" className="text-xs">Active</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Grid System</Label>
                <Select value={layoutSettings.grid} onValueChange={(value) => setLayoutSettings({ ...layoutSettings, grid: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 Column Grid</SelectItem>
                    <SelectItem value="16">16 Column Grid</SelectItem>
                    <SelectItem value="24">24 Column Grid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Layout Preview</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Current layout: {layoutOptions.find(o => o.value === layoutSettings.layout)?.label}
                </p>
                <div className="bg-background border rounded p-4 min-h-32">
                  <div className="text-center text-muted-foreground">
                    Layout preview will be shown here
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LayoutPage;