import React, { useMemo, useState } from "react";
import { FiEye, FiEyeOff, FiUser, FiLock } from "react-icons/fi";
import assets from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const Login = () => {
  const [showPw, setShowPw] = useState(false);

  // Start with empty fields - user must enter credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, authLoading } = useAppContext();

  // No auto-hints - clean login page

  // Attractive dummy users with realistic names - clickable but no action
  const dummyUsers = useMemo(
    () => [
      {
        id: "1",
        name: "Rukshan Perera",
        role: "Super Admin",
        initials: "RP",
        avatar: null,
        color: "bg-blue-600",
      },
      {
        id: "2",
        name: "Sarah Johnson",
        role: "Case Manager",
        initials: "SJ",
        avatar: null,
        color: "bg-emerald-600",
      },
      {
        id: "3",
        name: "Michael Fernando",
        role: "Advocate",
        initials: "MF",
        avatar: null,
        color: "bg-violet-600",
      },
      {
        id: "4",
        name: "Emily Silva",
        role: "Staff",
        initials: "ES",
        avatar: null,
        color: "bg-amber-600",
      },
    ],
    []
  );

  // Click handler - does nothing (just for visual effect)
  const handleUserClick = () => {
    // No action - just visual clickable element
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = (email || "").trim();
    const cleanPassword = (password || "").toString();

    if (!cleanEmail || !cleanPassword) {
      setError("Email and password are required.");
      return;
    }

    const result = await login(cleanEmail, cleanPassword);

    if (result && !result.success) {
      setError(result.message || "Invalid credentials.");
    }
  };

  return (
    <main className="relative min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Desktop Right Image */}
      <div
        className="hidden lg:block absolute inset-y-0 right-0 w-[52%] xl:w-1/2 pointer-events-none"
        aria-hidden
      >
        <img
          src={assets.login_bg}
          alt=""
          role="presentation"
          className="h-full w-full object-cover object-left"
          loading="eager"
        />
      </div>

      {/* Mobile Image */}
      <div className="lg:hidden">
        <picture>
          <source media="(min-width: 640px)" srcSet={assets.login_bg_sm} />
          <img
            src={assets.login_bg_sm}
            alt=""
            role="presentation"
            className="block w-full h-auto select-none pointer-events-none object-contain"
            sizes="100vw"
            loading="eager"
          />
        </picture>
      </div>

      <div className="relative z-10 grid lg:grid-cols-2">
        <section className="px-5 sm:px-10 lg:pl-20 xl:pl-50 pb-14 w-full max-w-3xl mx-auto lg:mx-0 lg:min-h-screen lg:flex lg:flex-col lg:justify-center">
          {/* Brand */}
          <div className="mb-10 flex items-center gap-3">
            <img src={assets.logo} alt="JLS" className="h-8" />
          </div>

          {/* Title */}
          <h1
            className="text-[40px] leading-none sm:text-[54px] font-bold mb-2 text-[#0a2a22]"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Portal Login
          </h1>

          <p className="text-sm text-gray-600 mb-6">
            Sign in using your credentials.
          </p>

          {/* FORM */}
          <form className="max-w-xl" onSubmit={handleSubmit}>
            {/* Email */}
            <label className="block mb-4">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <div className="relative mt-2">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="admin@jls.in"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-primary bg-transparent pl-10 pr-4 py-3 text-base outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-500 shadow-[0_18px_45px_-22px_rgba(0,0,0,0.45)] transition-all"
                />
              </div>
            </label>

            {/* Password */}
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700">
                Password
              </span>
              <div className="relative mt-2">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-primary bg-transparent pl-10 pr-12 py-3 text-base outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-500 shadow-[0_18px_45px_-22px_rgba(0,0,0,0.45)] transition-all"
                />
                <button
                  type="button"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center size-9 rounded-md text-gray-700/85 hover:bg-black/5 transition-colors"
                >
                  {showPw ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </label>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-sm select-none cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="size-4 rounded accent-primary"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-gray-700 hover:underline"
                onClick={() =>
                  setError(
                    "Please contact Super Admin to reset password (demo)."
                  )
                }
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <p className="mb-4 text-sm text-red font-semibold bg-red-50 p-3 rounded-md border border-red-100">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full sm:w-auto min-w-56 rounded-lg bg-primary text-white text-lg font-semibold cursor-pointer py-3 px-8 shadow-[0_24px_48px_-20px_rgba(237,41,37,0.65)] hover:opacity-95 active:scale-[.99] transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {authLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-500">
            <p>
              Copyright © {new Date().getFullYear()}{" "}
              <span className="text-primary font-semibold">JLS</span> All rights
              reserved.
            </p>
            <p className="sm:text-right">
              <a href="#" className="hover:underline">
                Terms & Conditions
              </a>
            </p>
          </div>
        </section>

        <aside className="hidden lg:block" />
      </div>
    </main>
  );
};

export default Login;