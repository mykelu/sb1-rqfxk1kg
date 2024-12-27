import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Link } from 'react-router-dom';
import { Home, ChevronRight, Calendar } from 'lucide-react';
import { AppointmentCalendar } from '@/components/appointments/appointment-calendar';
import { AppointmentList } from '@/components/appointments/appointment-list';

export function AppointmentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-teal-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Link to="/" className="hover:text-primary flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900">Appointments</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-7 w-7 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Therapy Sessions</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Schedule and manage your therapy appointments
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr,300px] gap-6">
            <AppointmentCalendar />
            <AppointmentList />
          </div>
        </div>
      </main>
    </div>
  );
}