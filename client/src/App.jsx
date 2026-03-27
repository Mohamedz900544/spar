// src/App.jsx
import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import ParentHeader from "./pages/admin/components/ParentHeader";
import AdminHeader from "./pages/admin/components/AdminHeader";
import ProtectedRoute from "./routes/ProtectedRoute";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import { useTranslation } from "react-i18next";

/* ── Full-page loader shown on every route change ── */
function PageTransitionLoader() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;

    const showTimer = setTimeout(() => setVisible(true), 0);
    const hideTimer = setTimeout(() => setVisible(false), 600);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-[#FBBF24] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/* ── Fallback for Suspense lazy loads ── */
function SuspenseFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#FBBF24] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const Landing = lazy(() => import("./pages/Landing"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Login = lazy(() => import("./pages/Login"));
const ParentDashboard = lazy(() => import("./pages/ParentDashboard"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OurStory = lazy(() => import("./pages/OurStory"));
const Contact = lazy(() => import("./pages/Contact"));
const Courses = lazy(() => import("./pages/Courses"));
const Pricing = lazy(() => import("./pages/Pricing"));
const BlocksHome = lazy(() => import("./pages/blocks/BlocksHome"));
const BlocksPlayground = lazy(() => import("./pages/blocks/BlocksPlayground"));
const PublicPreview = lazy(() => import("./pages/blocks/PublicPreview"));
const FractionLevelsPage = lazy(() => import("./pages/fractions/FractionLevelsPage"));
const FractionPlayPage = lazy(() => import("./pages/fractions/FractionPlayPage"));
const RoundSessionsPage = lazy(() => import("./pages/RoundSessionsPage"));
const RoundStudentsPage = lazy(() => import("./pages/RoundStudentsPage").then(m => ({ default: m.RoundStudentsPage })));
const ParentProfile = lazy(() => import("./pages/ProfileSettings"));
const InstructorDashboard = lazy(() => import("./pages/InstructorDashboard"));
// import { EmailVerificationPage } from "./pages/EmailVerification";

function App() {
  const [searchValue, setSearchValue] = useState("");
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

  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const isDashboard = location.pathname.startsWith('/parent') ||
      location.pathname.startsWith('/admin') ||
      location.pathname.startsWith('/instructor') ||
      location.pathname.startsWith('/blocks');

    if (isDashboard) {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = "en";
    } else {
      document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language, location.pathname]);

  return (
    <>
      <PageTransitionLoader />
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          {/* <Route path="/verify-email" element={<EmailVerificationPage />} /> */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ParentHeader data={userData} />
          }>
            <Route path="/parent" element={<ParentDashboard parent={userData} setParent={setUserData} />} />
            <Route path="/parent/profile" element={<ParentProfile userData={userData} setUserData={setUserData} />} />
          </Route>

          <Route element={<AdminHeader searchValue={searchValue} setSearchValue={setSearchValue} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/round/:roundId" element={<RoundSessionsPage />} />
            <Route path="/admin/round/:roundId/students" element={<RoundStudentsPage searchValue={searchValue} />} />
          </Route>
          <Route path="/our-story" element={<OurStory />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="*" element={<NotFound />} />
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
      </Suspense>
      {!location.pathname.startsWith('/parent') &&
       !location.pathname.startsWith('/admin') &&
       !location.pathname.startsWith('/instructor') && <FloatingWhatsApp />}
    </>
  );
}

export default App;
