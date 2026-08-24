import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import WelcomePage from "./pages/WelcomePage";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SuperAdminDashboard from "./pages/Superadmin/SuperAdminDashboard";
import CommercialAdminDashboard from "./pages/CommercialAdmin/CommercialAdminDashboard";
import ResidentDashboard from "./pages/Resident/ResidentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PayBill from "./pages/PayBill";

function Cursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const move = e => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <>
      <div
        className="custom-cursor"
        style={{ left: pos.x, top: pos.y }}
      />
      <div
        className="cursor-glow"
        style={{ left: pos.x, top: pos.y }}
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Cursor />

      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/resident/pay/:billId" element={<PayBill />} />

        <Route
          path="/super-admin/dashboard"
          element={
            <ProtectedRoute allowedRole="SUPER_ADMIN">
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/commercial/dashboard"
          element={
            <ProtectedRoute allowedRole="COMMERCIAL_ADMIN">
              <CommercialAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resident/dashboard"
          element={
            <ProtectedRoute allowedRole="RESIDENT">
              <ResidentDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <style>{`
        * {
          cursor: none;
        }

        .custom-cursor {
          position: fixed;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #5eead4;
          pointer-events: none;
          z-index: 99999;
          transform: translate(-50%, -50%);
          box-shadow:
            0 0 8px #5eead4,
            0 0 18px #14b8a6,
            0 0 30px rgba(20,184,166,.7);
        }

        .cursor-glow {
          position: fixed;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 99998;
          transform: translate(-50%, -50%);
          background: radial-gradient(
            circle,
            rgba(94,234,212,.22),
            rgba(20,184,166,.08) 45%,
            transparent 70%
          );
          filter: blur(2px);
        }

        button:hover ~ .custom-cursor,
        a:hover ~ .custom-cursor {
          transform: translate(-50%, -50%) scale(1.5);
        }

        @media (max-width: 768px) {
          * {
            cursor: auto;
          }

          .custom-cursor,
          .cursor-glow {
            display: none;
          }
        }
      `}</style>
    </BrowserRouter>
  );
}

export default App;