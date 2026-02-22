// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import InboxLogin from "./pages/inbox/Login";
import Inbox from "./pages/Inbox";
import ParentDashboard from "./pages/ParentDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Courses from "./pages/Courses";
import BlocksHome from "./pages/blocks/BlocksHome";
import BlocksPlayground from "./pages/blocks/BlocksPlayground";
import PublicPreview from "./pages/blocks/PublicPreview";
import FractionLevelsPage from "./pages/fractions/FractionLevelsPage";
import FractionPlayPage from "./pages/fractions/FractionPlayPage";
import RoundSessionsPage from "./pages/RoundSessionsPage";
import { RoundStudentsPage } from "./pages/RoundStudentsPage";
import ParentProfile from "./pages/ProfileSettings";
import ParentHeader from "./pages/admin/components/ParentHeader";
import { useState } from "react";
import AdminHeader from "./pages/admin/components/AdminHeader";
import ProtectedRoute from "./routes/ProtectedRoute";
import { BlockHeader } from "./components/blocks/BlockHeader";
import InstructorDashboard from "./pages/InstructorDashboard";
// import { EmailVerificationPage } from "./pages/EmailVerification";

function App() {
  const [searchValue, setSearchValue] = useState("")
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    photoUrl: "",
    campusCode: "",
    children: [{
      name: "",
      age: 0
    }]
  });
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      {/* <Route path="/verify-email" element={<EmailVerificationPage />} /> */}
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/inbox/login" element={<InboxLogin />} />
      <Route element={<ParentHeader data={userData} />
      }>
        <Route path="/parent" element={<ParentDashboard parent={userData} setParent={setUserData} />} />
        <Route path="/parent/profile" element={<ParentProfile userData={userData} setUserData={setUserData} />} />
      </Route>

      <Route element={<AdminHeader searchValue={searchValue} setSearchValue={setSearchValue} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/round/:roundId" element={<RoundSessionsPage />} />
        <Route path="/admin/round/:roundId/students" element={<RoundStudentsPage searchValue={searchValue} />} />
        <Route path="/admin/inbox" element={<Inbox />} />
      </Route>
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="*" element={<NotFound />} />
      <Route element={<ProtectedRoute allowedRole={["admin", "agent"]} redirectTo="/inbox/login" />}>
        <Route path="/inbox" element={<Inbox />} />
      </Route>
      <Route element={<ProtectedRoute allowedRole={"instructor"} redirectTo="/login" />}>
        <Route path="/instructor" element={<InstructorDashboard />} />
      </Route>
      <Route element={<ProtectedRoute allowedRole={"parent"} />} >
        <Route path="/blocks" element={<BlocksHome />} />
        <Route path="/blocks/play" element={<BlocksPlayground />} />
      </Route>

      <Route path="/blocks/share/:id" element={<PublicPreview />} />

      <Route path="/fractions" element={<FractionLevelsPage />} />
      <Route path="/fractions/:levelId" element={<FractionPlayPage />} />

    </Routes>
  );
}

export default App;
