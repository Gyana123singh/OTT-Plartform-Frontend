import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import LiveStream from './pages/LiveStream';
import VideoChat from './pages/VideoChat';
import MediaChat from './pages/MediaChat';
import Communities from './pages/Communities';
import CommunityDetail from './pages/CommunityDetail';
import News from './pages/News';
import Subscription from './pages/Subscription';
import Profile from './pages/Profile';

import Events from './pages/Events';
import Discovery from './pages/Discovery';
import AdminLayout from './admin/AdminLayout';
import DashboardOverview from './admin/pages/DashboardOverview';
import AdminLogin from './admin/pages/AdminLogin';
import UserManagement from './admin/pages/UserManagement';
import Watch from './pages/Watch';
import Collection from './pages/Collection';
import AdminDashboard from './admin/pages/AdminDashboard';
import CreatorDashboard from './creator/pages/CreatorDashboard';
import CreatorProfile from './creator/pages/CreatorProfile';
import PlanManagement from './admin/pages/PlanManagement';
import StreamMonitor from './admin/pages/StreamMonitor';
import ContentApproval from './admin/pages/ContentApproval';
import PlatformAnalytics from './admin/pages/PlatformAnalytics';
import RevenueSubs from './admin/pages/RevenueSubs';
import SystemSettings from './admin/pages/SystemSettings';





function App() {
  const googleClientId = "334577065767-opi3gfm2nnfr3bd19su5pae2b5l5jboi.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <Routes>


          {/* Protected App Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="live" element={<LiveStream />} />
            <Route path="live/:id" element={<LiveStream />} />
            <Route path="video-chat" element={<VideoChat />} />
            <Route path="media-chat" element={<MediaChat />} />
            <Route path="communities" element={<Communities />} />
            <Route path="communities/:id" element={<CommunityDetail />} />
            <Route path="news" element={<News />} />
            <Route path="events" element={<Events />} />
            <Route path="watch/:id" element={<Watch />} />
            <Route path="discovery" element={<Discovery />} />
            <Route path="collection/:id" element={<Collection />} />
            <Route path="creator/:id" element={<CreatorProfile />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="profile" element={<Profile />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="creator" element={<CreatorDashboard />} />
          </Route>

          {/* Dedicated Admin Panel Section */}
          <Route path="/admin-panel/login" element={<AdminLogin />} />
          <Route path="/admin-panel" element={<AdminLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="plans" element={<PlanManagement />} />
            <Route path="streams" element={<StreamMonitor />} />
            <Route path="content" element={<ContentApproval />} />
            <Route path="analytics" element={<PlatformAnalytics />} />
            <Route path="revenue" element={<RevenueSubs />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
