import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import App from './App';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Bookings from './pages/Bookings';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CoursePlayer from './pages/CoursePlayer';
import Programmes from './pages/Programmes';
import ProgrammeDetail from './pages/ProgrammeDetail';
import CoachingServices from './pages/CoachingServices';
import CoachingServiceDetail from './pages/CoachingServiceDetail';
import ClientPortal from './pages/ClientPortal';
import Requests from './pages/Requests';
import FeeStatement from './pages/FeeStatement';
import Timetable from './pages/Timetable';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <ClientPortal />
          </ProtectedRoute>
        ),
        children: [
          { path: 'requests', element: <Requests /> },
          { path: 'fee-statement', element: <FeeStatement /> },
          { path: 'timetable', element: <Timetable /> },
          { path: 'profile', element: <Profile /> },
        ],
      },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'products', element: <Products /> },
      {
        path: 'bookings',
        element: (
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        ),
      },
      { path: 'courses', element: <Courses /> },
      {
        path: 'courses/:id',
        element: (
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        ),
      },
      { path: 'programmes', element: <Programmes /> },
      {
        path: 'programmes/:id',
        element: (
          <ProtectedRoute>
            <ProgrammeDetail />
          </ProtectedRoute>
        ),
      },
      { path: 'coaching-services', element: <CoachingServices /> },
      {
        path: 'coaching-services/:id',
        element: (
          <ProtectedRoute>
            <CoachingServiceDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'lessons/:id',
        element: (
          <ProtectedRoute>
            <CoursePlayer />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute>
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'checkout/success',
        element: (
          <ProtectedRoute>
            <CheckoutSuccess />
          </ProtectedRoute>
        ),
      },
      { path: 'checkout/cancel', element: <CheckoutCancel /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);