import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ThemeModeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/global.css';

import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

import Dashboard from './pages/Dashboard/Dashboard';
import MembersList from './pages/Members/MembersList';
import MemberProfile from './pages/Members/MemberProfile';
import DonationsList from './pages/Donations/DonationsList';
import DonationForm from './pages/Donations/DonationForm';
import OnlinePayment from './pages/Donations/OnlinePayment';
import CashCollection from './pages/Donations/CashCollection';
import ActivitiesList from './pages/Activities/ActivitiesList';
import SocialInitiatives from './pages/Activities/SocialInitiatives';
import MurtiList from './pages/Murti/MurtiList';
import MurtiForm from './pages/Murti/MurtiForm';
import MurtiDetails from './pages/Murti/MurtiDetails';
import Reports from './pages/Reports/Reports';
import ColonyList from './pages/Colony/ColonyList';
import PaymentHistory from './pages/PaymentHistory/PaymentHistory';
import Notifications from './pages/Notifications/Notifications';
import Settings from './pages/Settings/Settings';
import Receipt from './pages/Receipt/Receipt';
import LoginPage from './pages/Login/LoginPage';
import VolunteerDashboard from './pages/Volunteer/VolunteerDashboard';
import VolunteerList from './pages/Volunteer/VolunteerList';
import EventList from './pages/Volunteer/EventList';
import Attendance from './pages/Volunteer/Attendance';
import VolunteerProfile from './pages/Volunteer/VolunteerProfile';
import ForgotPassword from './pages/Login/ForgotPassword';
import NotFound from './pages/Error/NotFound';

function ProtectedRoute() {
  return <Outlet />;
}

function PublicRoute() {
  return <Outlet />;
}

export default function App() {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout><Outlet /></MainLayout>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/members" element={<MembersList />} />
                <Route path="/members/profile/:id" element={<MemberProfile />} />
                <Route path="/donations" element={<DonationsList />} />
                <Route path="/donations/add" element={<DonationForm />} />
                <Route path="/donations/pay" element={<OnlinePayment />} />
                <Route path="/donations/cash" element={<CashCollection />} />
                <Route path="/activities" element={<ActivitiesList />} />
                <Route path="/activities/initiatives" element={<SocialInitiatives />} />
                <Route path="/murti" element={<MurtiList />} />
                <Route path="/murti/add" element={<MurtiForm />} />
                <Route path="/murti/edit/:id" element={<MurtiForm />} />
                <Route path="/murti/:id" element={<MurtiDetails />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/colony" element={<ColonyList />} />
                <Route path="/payments" element={<PaymentHistory />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/receipt/:donationId" element={<Receipt />} />
                <Route path="/volunteers" element={<VolunteerDashboard />} />
                <Route path="/volunteers/list" element={<VolunteerList />} />
                <Route path="/volunteers/events" element={<EventList />} />
                <Route path="/volunteers/attendance" element={<Attendance />} />
                <Route path="/volunteers/profile/:id" element={<VolunteerProfile />} />
              </Route>
            </Route>

            <Route element={<PublicRoute />}>
              <Route element={<AuthLayout><Outlet /></AuthLayout>}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme="colored" />
      </AuthProvider>
    </ThemeModeProvider>
  );
}
