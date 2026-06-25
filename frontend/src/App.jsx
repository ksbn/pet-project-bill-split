import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import GroupPage from "./pages/GroupPage";
import JoinPage from "./pages/JoinPage";
 
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/groups/:groupId" element={<GroupPage />} />
        <Route path="/join/:inviteCode" element={<JoinPage />} />
      </Routes>
    </BrowserRouter>
  );
}
