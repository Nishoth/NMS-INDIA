import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import CaseImport from "./pages/CaseImport";
import CaseDetail from "./pages/CaseDetail";
import Notices from "./pages/Notices";
import NoticeDetail from "./pages/NoticeDetail";
import Meetings from "./pages/Meetings";
import MeetingDetail from "./pages/MeetingDetail";
import MeetingRoom from "./pages/MeetingRoom";
import Documents from "./pages/Documents";
import DocumentDetail from "./pages/DocumentDetail";
import Recordings from "./pages/Recordings";
import RecordingDetail from "./pages/RecordingDetail";
import Users from "./pages/Users";
import Audit from "./pages/Audit";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import PortalAuth from "./pages/PortalAuth";
import PortalCaseView from "./pages/PortalCaseView";
import RequireAuth from "./components/RequireAuth";
import RequirePermission from "./components/RequirePermission";
import { PERMISSIONS } from "./assets/assets";

const Unauthorized = () => (
  <div className="p-6 bg-white rounded-xl">
    <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Unauthorized</h2>
    <p className="text-gray-600 dark:text-gray-400">You do not have permission to view this page.</p>
  </div>
);

const getInitialTheme = () => {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
};

const App = () => {
  const [theme, setTheme] = useState(getInitialTheme());

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* External Victim Portal Routes */}
      <Route path="/portal/:token" element={<PortalAuth />} />
      <Route path="/portal/case" element={<PortalCaseView />} />

      {/* Direct link for Meetings */}
      <Route path="/meeting/:meetingId" element={<MeetingRoom />} />

      {/* Internal Admin Portal Routes */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <AdminLayout theme={theme} setTheme={setTheme} />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard */}
        <Route path="dashboard" element={<RequirePermission permission={PERMISSIONS.VIEW_DASHBOARD}><Dashboard /></RequirePermission>} />

        {/* Case Management */}
        <Route path="cases" element={<RequirePermission permission={PERMISSIONS.VIEW_CASES}><Cases /></RequirePermission>} />
        <Route path="cases/import" element={<RequirePermission permission={PERMISSIONS.IMPORT_CASES}><CaseImport /></RequirePermission>} />
        <Route path="cases/:caseId" element={<RequirePermission permission={PERMISSIONS.VIEW_CASES}><CaseDetail /></RequirePermission>} />

        {/* Processing & Actions */}
        <Route path="notices" element={<RequirePermission permission={PERMISSIONS.VIEW_NOTICES}><Notices /></RequirePermission>} />
        <Route path="notices/:id" element={<RequirePermission permission={PERMISSIONS.VIEW_NOTICES}><NoticeDetail /></RequirePermission>} />
        <Route path="meetings" element={<RequirePermission permission={PERMISSIONS.VIEW_MEETINGS}><Meetings /></RequirePermission>} />
        <Route path="meetings/:id" element={<RequirePermission permission={PERMISSIONS.VIEW_MEETINGS}><MeetingDetail /></RequirePermission>} />
        <Route path="documents" element={<RequirePermission permission={PERMISSIONS.VIEW_DOCUMENTS}><Documents /></RequirePermission>} />
        <Route path="documents/:id" element={<RequirePermission permission={PERMISSIONS.VIEW_DOCUMENTS}><DocumentDetail /></RequirePermission>} />
        <Route path="recordings" element={<RequirePermission permission={PERMISSIONS.VIEW_RECORDINGS}><Recordings /></RequirePermission>} />
        <Route path="recordings/:id" element={<RequirePermission permission={PERMISSIONS.VIEW_RECORDINGS}><RecordingDetail /></RequirePermission>} />

        {/* Admin Center */}
        <Route path="admin/users" element={<RequirePermission permission={PERMISSIONS.MANAGE_USERS}><Users /></RequirePermission>} />
        <Route path="admin/audit" element={<RequirePermission permission={PERMISSIONS.VIEW_AUDIT}><Audit /></RequirePermission>} />
        <Route path="admin/reports" element={<RequirePermission permission={PERMISSIONS.VIEW_REPORTS}><Reports /></RequirePermission>} />
        <Route path="admin/settings" element={<RequirePermission permission={PERMISSIONS.MANAGE_SYSTEM}><Settings /></RequirePermission>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default App;