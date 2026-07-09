import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import About from './pages/About';
import StartHere from './pages/StartHere';
import WriterForum from './pages/WriterForum';
import FeedbackCorner from './pages/FeedbackCorner';
import PublishingHelp from './pages/PublishingHelp';
import FreeResources from './pages/FreeResources';
import WeeklyChallenges from './pages/WeeklyChallenges';
import CommunityRules from './pages/CommunityRules';
import JoinFree from './pages/JoinFree';
import Contact from './pages/Contact';
import Register from './pages/Register';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

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
          <Route path="/publishing-help" element={<PublishingHelp />} />
          <Route path="/free-resources" element={<FreeResources />} />
          <Route path="/weekly-challenges" element={<WeeklyChallenges />} />
          <Route path="/community-rules" element={<CommunityRules />} />
          <Route path="/join" element={<JoinFree />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />
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
      </Routes>
    </BrowserRouter>
  );
}
