import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateSystemSettings } from '@/lib/api/admin';

export function SystemSettings() {
  const [settings, setSettings] = useState({
    assessmentFrequency: 7,
    crisisThreshold: 15,
    supportTimeout: 30,
    notificationDelay: 24,
    maxRetries: 3,
    autoArchiveDays: 30,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSystemSettings(settings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">System Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="assessmentFrequency">
              Assessment Reminder Frequency (days)
            </Label>
            <Input
              id="assessmentFrequency"
              type="number"
              value={settings.assessmentFrequency}
              onChange={(e) => setSettings({
                ...settings,
                assessmentFrequency: Number(e.target.value)
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crisisThreshold">
              Crisis Alert Threshold Score
            </Label>
            <Input
              id="crisisThreshold"
              type="number"
              value={settings.crisisThreshold}
              onChange={(e) => setSettings({
                ...settings,
                crisisThreshold: Number(e.target.value)
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportTimeout">
              Support Session Timeout (minutes)
            </Label>
            <Input
              id="supportTimeout"
              type="number"
              value={settings.supportTimeout}
              onChange={(e) => setSettings({
                ...settings,
                supportTimeout: Number(e.target.value)
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notificationDelay">
              Notification Delay (hours)
            </Label>
            <Input
              id="notificationDelay"
              type="number"
              value={settings.notificationDelay}
              onChange={(e) => setSettings({
                ...settings,
                notificationDelay: Number(e.target.value)
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxRetries">
              Maximum Retry Attempts
            </Label>
            <Input
              id="maxRetries"
              type="number"
              value={settings.maxRetries}
              onChange={(e) => setSettings({
                ...settings,
                maxRetries: Number(e.target.value)
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="autoArchiveDays">
              Auto-Archive After (days)
            </Label>
            <Input
              id="autoArchiveDays"
              type="number"
              value={settings.autoArchiveDays}
              onChange={(e) => setSettings({
                ...settings,
                autoArchiveDays: Number(e.target.value)
              })}
            />
          </div>
        </div>

        <Button type="submit" className="w-full">
          Save Settings
        </Button>
      </form>
    </Card>
  );
}