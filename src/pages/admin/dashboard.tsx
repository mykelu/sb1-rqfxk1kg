import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { AdminNav } from '@/components/admin/admin-nav';
import { EngagementMetrics } from '@/components/admin/engagement-metrics';
import { SystemSettings } from '@/components/admin/system-settings';
import { UserStats } from '@/components/admin/user-stats';
import { AssessmentStats } from '@/components/admin/assessment-stats';

export function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-teal-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="grid lg:grid-cols-[240px,1fr] gap-8">
          <AdminNav />
          
          <div className="space-y-8">
            <EngagementMetrics />
            <div className="grid md:grid-cols-2 gap-8">
              <UserStats />
              <AssessmentStats />
            </div>
            <SystemSettings />
          </div>
        </div>
      </main>
    </div>
  );
}