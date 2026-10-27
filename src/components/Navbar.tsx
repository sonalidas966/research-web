import React from 'react';
import {
  BookOpen,
  LogIn,
  LogOut,
  Menu,
  ShieldCheck,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import type { ActiveTab } from '../types/index.ts';

interface NavbarProps {
  onToggleSidebar: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, setActiveTab }) => {
  const { currentUser, userProfile, signInWithGoogle, signOut, loading, authError } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger & Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-lg tracking-tight text-slate-900 font-serif">
                    Aura Research
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                    AI Guide
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Your Personal Research Guide
                </p>
              </div>
            </button>
          </div>

          {/* Right: Security info & Auth */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Private & Evidence-Grounded</span>
            </div>

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
            ) : currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-6 h-6 rounded-full object-cover border border-slate-300"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                      {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                    </div>
                  )}
                  <span className="text-xs font-medium text-slate-700 max-w-[120px] truncate hidden sm:inline">
                    {userProfile?.displayName || currentUser.displayName || currentUser.email}
                  </span>
                </div>

                <button
                  onClick={() => signOut()}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-all shadow-sm hover:shadow"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Google Sign-In</span>
              </button>
            )}
          </div>
        </div>

        {authError && (
          <div className="py-1.5 px-3 mb-2 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{authError}</span>
          </div>
        )}
      </div>
    </header>
  );
};
