import React, { useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  FiLogOut,
  FiSearch,
  FiBell,
  FiMenu,
  FiX,
  FiChevronDown,
  FiGrid,
  FiSettings,
  FiHelpCircle,
  FiShield,
  FiUserCheck,
  FiDatabase,
  FiFileText,
} from "react-icons/fi";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import ThemeToggleBtn from "./ThemeToggleBtn";
import assets from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { NAV_CONFIG, ROLE_LABELS, PERMISSIONS } from "../assets/assets";

const spring = { type: "spring", stiffness: 500, damping: 35, mass: 0.5 };

// map icon string → component
const ICONS = {
  FiGrid,
  FiSettings,
  FiHelpCircle,
  FiShield,
  FiUserCheck,
  FiDatabase,
  FiFileText,
  FiBell,
};

// --- SIDEBAR ITEM ---
const SidebarItem = ({ item }) => {
  const { to, label, icon, badge } = item;
  const Icon = ICONS[icon] || FiFileText;

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
          isActive
            ? "text-white"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="active-admin-sidebar"
              transition={spring}
              className="absolute inset-0 bg-primary rounded-xl shadow-md"
            />
          )}

          <div className="relative z-10 flex items-center gap-3">
            <Icon
              className={`w-5 h-5 ${
                isActive ? "text-white" : "text-gray-500 dark:text-gray-400"
              }`}
            />
            <span className="font-medium text-sm">{label}</span>
          </div>

          {badge && (
            <span
              className={`relative z-10 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isActive
                  ? "bg-white text-primary"
                  : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

// --- SIDEBAR ---
const AdminSidebar = ({
  theme,
  mobileOpen,
  setMobileOpen,
  logout,
  groups,
}) => {
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f141a] border-r border-gray-200 dark:border-white/5">
      <div className="px-6 py-6 mb-2">
        <img
          src={theme === "dark" ? assets.logo_dark : assets.logo}
          alt="Portal"
          className="w-32 object-contain"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-6 scrollbar-hide">
        <LayoutGroup id="admin-sidebar-group">
          {groups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <SidebarItem key={item.to} item={item} />
                ))}
              </div>
            </div>
          ))}
        </LayoutGroup>
      </div>

      <div className="p-4 mt-2 border-t border-gray-100 dark:border-white/5">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
        >
          <FiLogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 z-40">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={spring}
              className="fixed left-0 top-0 h-full w-72 z-50 lg:hidden shadow-2xl"
            >
              <div className="relative h-full flex flex-col bg-white dark:bg-[#0f141a]">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  <FiX className="w-5 h-5 dark:text-white" />
                </button>
                <SidebarContent />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// --- HEADER ---
const AdminHeader = ({ user, setMobileOpen, theme, setTheme }) => {
  const firstName = user?.name || user?.firstName || user?.username || "User";
  const lastName = user?.lastName || "";
  const roleLabel = ROLE_LABELS[user?.role] || "USER";
  const avatar = user?.avatar;
  const userInitial = firstName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0f141a]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 px-4 py-3 lg:px-8 lg:py-4 transition-colors duration-300">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center flex-1 gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <FiMenu className="w-6 h-6 dark:text-white" />
          </button>

          <div className="hidden md:flex items-center w-full max-w-md px-4 py-2.5 bg-gray-50 dark:bg-white/5 rounded-full border border-transparent focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <FiSearch className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 bg-transparent border-none outline-none text-sm ml-3 text-gray-900 dark:text-white placeholder-gray-400"
            />
            <span className="text-xs text-gray-400 font-medium bg-gray-200 dark:bg-white/10 px-2 py-1 rounded-md">
              ⌘ K
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggleBtn theme={theme} setTheme={setTheme} />

          <button className="relative p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <FiBell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#0f141a]" />
          </button>

          <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-1 hidden sm:block" />

          <div className="flex items-center gap-3 pl-2 cursor-pointer group">
            <div className="relative w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
              {avatar ? (
                <img src={avatar} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <span>{userInitial}</span>
              )}
            </div>

            <div className="hidden lg:block text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                {firstName} {lastName}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">
                {roleLabel}
              </p>
            </div>

            <FiChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
};

// --- MAIN LAYOUT ---
const AdminLayout = ({ theme, setTheme }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { userData, logout, hasPermission } = useAppContext();

  // ✅ Generate sidebar groups from NAV_CONFIG
  const groups = useMemo(() => {
    const canSee = (item) => {
      const perm = item.permission;

      // If Super Admin has ALL
      if (userData?.permissions?.includes("ALL")) return true;

      // Special case: allow VIEW_CASES if user has VIEW_ALL_CASES
      if (perm === PERMISSIONS.VIEW_CASES) {
        return hasPermission(PERMISSIONS.VIEW_CASES) || hasPermission(PERMISSIONS.VIEW_ALL_CASES);
      }

      return hasPermission(perm);
    };

    return NAV_CONFIG.map((group) => ({
      ...group,
      items: group.items.filter(canSee),
    })).filter((group) => group.items.length > 0);
  }, [userData, hasPermission]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f141a] text-gray-900 dark:text-white transition-colors duration-300">
      <AdminSidebar
        theme={theme}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        logout={logout}
        groups={groups}
      />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <AdminHeader
          user={userData}
          setMobileOpen={setMobileOpen}
          theme={theme}
          setTheme={setTheme}
        />

        <main className="bg-[#F6F6F6] dark:bg-[#1B1F25] flex-1 p-4 lg:p-8">
          <div className="mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;