import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button'; 
import { Phone, Calendar, ChevronRight, Home, Heart, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HelplineChat } from '@/components/chat/helpline-chat';

const CRISIS_HOTLINE = "1-800-273-8255"; // National Suicide Prevention Lifeline

export function SupportPage() {
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
              <span className="text-gray-900">Support</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Heart className="h-7 w-7 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Get Support</h1>
                <p className="text-sm text-gray-600 mt-1">
                  We're here to help. Choose the type of support that works best for you.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <Phone className="w-12 h-12 mx-auto mb-4 text-rose-600" />
              <h2 className="text-xl font-semibold mb-4">Crisis Helpline</h2>
              <p className="text-gray-600 mb-4">
                24/7 immediate phone support for those in crisis.
              </p>
              <a 
                href={`tel:${CRISIS_HOTLINE}`}
                className="block"
              >
                <Button className="w-full bg-rose-600 hover:bg-rose-700">
                  Call {CRISIS_HOTLINE}
                </Button>
              </a>
            </div>

            <div className="md:col-span-2">
              <HelplineChat />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-emerald-600" />
              <h2 className="text-xl font-semibold mb-4">Schedule Session</h2>
              <p className="text-gray-600 mb-4">
                Book a therapy session with a licensed professional.
              </p>
              <Link to="/appointments" className="block">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Schedule Appointment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}