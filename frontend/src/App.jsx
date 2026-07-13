import { BrowserRouter, Routes, Route } from "react-router-dom";
import  HomePage  from "./pages/HomePage";
import GroupPage from "./pages/GroupPage";
import JoinPage from "./pages/JoinPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Navbar from "./components/Navbar"; 
import GroupViewPage from "./pages/GroupViewPage";
import MyGroupsPage from "./pages/MyGroupsPage";
import DonationsPage from './pages/DonationsPage';
 
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="app-container">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/groups/:groupId" element={<GroupPage />} />
        <Route path="/join/:inviteCode" element={<GroupViewPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/my-groups" element={<MyGroupsPage />} />
        <Route path="/donations" element={<DonationsPage />} />
      </Routes>
      </main>
    </BrowserRouter>
  );
}
