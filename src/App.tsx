import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import About from './pages/About';
import StartHere from './pages/StartHere';
import WriterForum from './pages/WriterForum';
import FeedbackCorner from './pages/FeedbackCorner';
import FeedbackDetail from './pages/FeedbackDetail';
import PublishingHelp from './pages/PublishingHelp';
import FreeResources from './pages/FreeResources';
import WeeklyChallenges from './pages/WeeklyChallenges';
import CommunityRules from './pages/CommunityRules';
import JoinFree from './pages/JoinFree';
import Contact from './pages/Contact';
import Register from './pages/Register';
import Login from './pages/Login';
import MemberArea from './pages/MemberArea';
import ResetPassword from './pages/ResetPassword';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminMembers from './pages/admin/AdminMembers';
import AdminTestimonials from './pages/admin/AdminTestimonials';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/start-here" element={<StartHere />} />
          <Route path="/writer-forum" element={<WriterForum />} />
          <Route path="/feedback-corner" element={<FeedbackCorner />} />
          <Route path="/feedback-corner/:id" element={<FeedbackDetail />} />
          <Route path="/publishing-help" element={<PublishingHelp />} />
          <Route path="/free-resources" element={<FreeResources />} />
          <Route path="/weekly-challenges" element={<WeeklyChallenges />} />
          <Route path="/community-rules" element={<CommunityRules />} />
          <Route path="/join" element={<JoinFree />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/member" element={<MemberArea />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <AdminRoute>
              <AdminApprovals />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/members"
          element={
            <AdminRoute>
              <AdminMembers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/testimonials"
          element={
            <AdminRoute>
              <AdminTestimonials />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
