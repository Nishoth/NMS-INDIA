// src/assets/assets.js

// ==================== IMAGES ====================
import logo from "./logo.png";
import logo_dark from "./logo-dark.png";
import logo_mobile from "./logo-mobile.png";
import logo_mobile_dark from "./logo-dark-mobile.png";
import login_bg from "./login_bg.png";
import login_bg_sm from "./login_bg_sm.png";
import profile from "./profile.png";

const assets = {
  logo,
  logo_dark,
  logo_mobile,
  logo_mobile_dark,
  login_bg,
  login_bg_sm,
  profile,
};

export default assets;

// =====================================================
// ==================== ROLE CONSTANTS =================
// =====================================================

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  CASE_MANAGER: "case_manager",
  ADVOCATE: "advocate",
  STAFF: "staff",
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "SUPER ADMIN",
  [ROLES.CASE_MANAGER]: "CASE MANAGER",
  [ROLES.ADVOCATE]: "ADVOCATE",
  [ROLES.STAFF]: "STAFF",
};

// =====================================================
// ==================== PERMISSIONS ====================
// =====================================================
// ✅ Permission Keys (use this everywhere)
export const PERMISSIONS = {
  // Core
  VIEW_DASHBOARD: "VIEW_DASHBOARD",
  VIEW_CASES: "VIEW_CASES",
  VIEW_ALL_CASES: "VIEW_ALL_CASES",

  // Case actions
  EDIT_CASE: "EDIT_CASE",
  ASSIGN_ADVOCATE: "ASSIGN_ADVOCATE",
  CREATE_NOTICE: "CREATE_NOTICE",
  CLOSE_CASE: "CLOSE_CASE",

  // Documents
  VIEW_DOCUMENTS: "VIEW_DOCUMENTS",
  UPLOAD_INTERNAL_DOCUMENTS: "UPLOAD_INTERNAL_DOCUMENTS",

  // Meetings / recordings
  VIEW_MEETINGS: "VIEW_MEETINGS",
  MANAGE_MEETINGS: "MANAGE_MEETINGS",
  VIEW_RECORDINGS: "VIEW_RECORDINGS",

  // Bulk import
  IMPORT_CASES: "IMPORT_CASES",

  // Admin
  MANAGE_USERS: "MANAGE_USERS",
  VIEW_AUDIT_LOGS: "VIEW_AUDIT_LOGS",
  VIEW_REPORTS: "VIEW_REPORTS",
  SYSTEM_SETTINGS: "SYSTEM_SETTINGS",

  // Advocate work
  ADD_CASE_NOTES: "ADD_CASE_NOTES",
  UPDATE_HEARING_STATUS: "UPDATE_HEARING_STATUS",

  // Optional general pages (not required in nav)
  VIEW_PROFILE: "VIEW_PROFILE",
  VIEW_HELP: "VIEW_HELP",
};

// ✅ Role -> default permissions
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ["ALL"],

  [ROLES.CASE_MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ALL_CASES,
    PERMISSIONS.EDIT_CASE,
    PERMISSIONS.ASSIGN_ADVOCATE,
    PERMISSIONS.CREATE_NOTICE,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.UPLOAD_INTERNAL_DOCUMENTS,
    PERMISSIONS.VIEW_MEETINGS,
    PERMISSIONS.MANAGE_MEETINGS,
    PERMISSIONS.VIEW_RECORDINGS,
    PERMISSIONS.IMPORT_CASES,
    PERMISSIONS.CLOSE_CASE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_HELP,
  ],

  [ROLES.ADVOCATE]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CASES, // assigned/limited handled by backend later
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.ADD_CASE_NOTES,
    PERMISSIONS.UPDATE_HEARING_STATUS,
    PERMISSIONS.VIEW_MEETINGS,
    PERMISSIONS.VIEW_RECORDINGS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_HELP,
  ],

  [ROLES.STAFF]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CASES,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.UPLOAD_INTERNAL_DOCUMENTS,
    PERMISSIONS.VIEW_MEETINGS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_HELP,
  ],
};

// =====================================================
// ==================== NAV CONFIG =====================
// =====================================================
// ✅ ONLY NAV PAGES
// ❗ NOT INCLUDED IN NAV (but must exist in routes):
// - /cases/:caseId (Case Detail)
// - /cases/:caseId/* (tabs: timeline, docs, notices, meetings, recordings, activity)
// - /profile
// - /help
export const NAV_CONFIG = [
  {
    title: "Dashboard",
    items: [
      {
        key: "dashboard",
        label: "Dashboard",
        to: "/dashboard",
        icon: "FiGrid",
        permission: PERMISSIONS.VIEW_DASHBOARD,
      },
    ],
  },
  {
    title: "Cases",
    items: [
      {
        key: "cases",
        label: "Case List",
        to: "/cases",
        icon: "FiFileText",
        // VIEW_CASES OR VIEW_ALL_CASES should allow
        permission: PERMISSIONS.VIEW_CASES,
      },
      {
        key: "import",
        label: "Case Import",
        to: "/cases/import",
        icon: "FiUploadCloud",
        permission: PERMISSIONS.IMPORT_CASES,
      },
      {
        key: "notices",
        label: "Notices",
        to: "/notices",
        icon: "FiBell",
        permission: PERMISSIONS.CREATE_NOTICE,
      },
      {
        key: "meetings",
        label: "Meetings",
        to: "/meetings",
        icon: "FiVideo",
        // basic view for staff/advocate, manage for case manager/admin
        permission: PERMISSIONS.VIEW_MEETINGS,
      },
      {
        key: "documents",
        label: "Documents",
        to: "/documents",
        icon: "FiFolder",
        permission: PERMISSIONS.VIEW_DOCUMENTS,
      },
      {
        key: "recordings",
        label: "Recordings",
        to: "/recordings",
        icon: "FiDatabase",
        permission: PERMISSIONS.VIEW_RECORDINGS,
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        key: "users",
        label: "Users & Roles",
        to: "/admin/users",
        icon: "FiUserCheck",
        permission: PERMISSIONS.MANAGE_USERS,
      },
      {
        key: "audit",
        label: "Audit Logs",
        to: "/admin/audit",
        icon: "FiShield",
        permission: PERMISSIONS.VIEW_AUDIT_LOGS,
      },
      {
        key: "reports",
        label: "Reports",
        to: "/admin/reports",
        icon: "FiFileText",
        permission: PERMISSIONS.VIEW_REPORTS,
      },
      {
        key: "settings",
        label: "Settings",
        to: "/admin/settings",
        icon: "FiSettings",
        permission: PERMISSIONS.SYSTEM_SETTINGS,
      },
    ],
  },
];

// =====================================================
// ============ ROUTES THAT MUST EXIST (NO NAV) =========
// =====================================================
// This is for your developer reference + route guards.
// You can use it in App.jsx to generate routes if needed.
export const ROUTES = {
  // Auth
  LOGIN: "/admin/login",

  // Core
  DASHBOARD: "/dashboard",

  // Cases
  CASES: "/cases",
  CASE_IMPORT: "/cases/import",
  CASE_DETAIL: "/cases/:caseId", // ✅ MUST EXIST (no nav)
  CASE_DETAIL_TAB: "/cases/:caseId/:tab", // optional

  // Modules
  NOTICES: "/notices",
  MEETINGS: "/meetings",
  DOCUMENTS: "/documents",
  RECORDINGS: "/recordings",

  // Admin
  USERS: "/admin/users",
  AUDIT: "/admin/audit",
  REPORTS: "/admin/reports",
  SETTINGS: "/admin/settings",

  // Optional
  PROFILE: "/profile", // ✅ recommended (no nav)
  HELP: "/help", // ✅ recommended (no nav)
  UNAUTHORIZED: "/unauthorized",
};

// =====================================================
// ==================== INTERNAL USERS =================
// =====================================================
// ✅ API-like seed users (frontend dummy)
// - In real backend: password is NEVER returned
// - permissions are normalized and consistent with PERMISSIONS/ROLE_PERMISSIONS

export const internalUsers = [
  {
    id: "usr-1001",
    employeeId: "EMP-SA-001",
    avatar: profile,
    username: "superadmin",
    email: "superadmin@bankportal.com",
    phone: "+91-9000000001",
    password: "password",
    role: ROLES.SUPER_ADMIN,
    designation: "System Super Administrator",
    department: "IT & Compliance",
    status: "active",
    permissions: ["ALL"],
    meta: {
      region: "IN",
      branch: "HQ",
      lastPasswordChangeAt: "2026-01-05T09:00:00Z",
    },
    createdAt: "2026-01-10T10:00:00Z",
    lastLogin: "2026-02-20T09:15:00Z",
  },

  {
    id: "usr-1002",
    employeeId: "EMP-CM-001",
    avatar: profile,
    username: "casemanager1",
    email: "casemanager1@bankportal.com",
    phone: "+91-9000000002",
    password: "password",
    role: ROLES.CASE_MANAGER,
    designation: "Senior Case Manager",
    department: "Loan Recovery",
    status: "active",
    permissions: ROLE_PERMISSIONS[ROLES.CASE_MANAGER],
    scope: {
      // if later you want region-based filtering
      canViewAllCases: true,
      branchCodes: ["CHN-001", "CHN-002"],
    },
    createdAt: "2026-01-12T11:30:00Z",
    lastLogin: "2026-02-21T14:10:00Z",
  },

  {
    id: "usr-1003",
    employeeId: "EMP-ADV-001",
    avatar: profile,
    username: "advocate1",
    email: "advocate1@bankportal.com",
    phone: "+91-9000000003",
    password: "password",
    role: ROLES.ADVOCATE,
    designation: "Legal Advocate",
    department: "Legal Department",
    status: "active",
    permissions: ROLE_PERMISSIONS[ROLES.ADVOCATE],
    assignedCases: ["CASE-10001", "CASE-10005"],
    createdAt: "2026-01-15T09:45:00Z",
    lastLogin: "2026-02-19T16:00:00Z",
  },

  {
    id: "usr-1004",
    employeeId: "EMP-ST-001",
    avatar: profile,
    username: "staff1",
    email: "staff1@bankportal.com",
    phone: "+91-9000000004",
    password: "password",
    role: ROLES.STAFF,
    designation: "Operations Executive",
    department: "Back Office",
    status: "active",
    permissions: ROLE_PERMISSIONS[ROLES.STAFF],
    createdAt: "2026-01-18T13:20:00Z",
    lastLogin: "2026-02-18T10:25:00Z",
  },
];

// =====================================================
// ============== API RESPONSE SHAPES (REFERENCE) =======
// =====================================================
// Optional: use these as frontend mocks or backend contracts
export const API_SHAPES = {
  loginSuccess: (user, token = "jwt_token_here") => ({
    success: true,
    message: "Login success",
    token,
    data: {
      user,
    },
  }),
  loginFail: (message = "Invalid email or password") => ({
    success: false,
    message,
  }),
};