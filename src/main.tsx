import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth/auth-context'
import { HomePage } from './pages/home'
import { SupportPage } from './pages/support'
import { AdminDashboardPage } from './pages/admin/dashboard'
import { AssessmentLayout } from '@/components/assessment/assessment-layout'
import { ResourcesPage } from './pages/resources'
import { LoginPage } from './pages/login'
import { SignupPage } from './pages/signup'
import { AuthCallbackPage } from './pages/auth/callback'
import { AssessmentsPage } from './pages/assessments'
import { AdminConsentsPage } from './pages/admin/consents'
import { ProfilePage } from './pages/profile'
import { AppointmentsPage } from './pages/appointments'
import { UnauthorizedPage } from './pages/unauthorized'
import { ProtectedRoute } from '@/components/auth/protected-route'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/support',
    element: (
      <ProtectedRoute>
        <SupportPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/appointments',
    element: (
      <ProtectedRoute>
        <AppointmentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/resources',
    element: (
      <ProtectedRoute>
        <ResourcesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/login',
    element: <LoginPage redirectTo="/profile" />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/assessments',
    element: (
      <ProtectedRoute><AssessmentLayout /></ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <AssessmentsPage />
      },
      {
        path: ':type',
        element: <AssessmentsPage />
      }
    ]
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/consents',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminConsentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)