"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileModal } from "@/components/profile-modal";
import { UserAvatar } from "@/components/user-avatar";
import { UserProfile } from "@/lib/types";
import { X, User, MessageSquare, BarChart3, Trash2 } from "lucide-react";

export interface SidebarProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  children?: ReactNode;
  className?: string;
}

export function Sidebar({
  isOpen,
  onToggle,
  children,
  className = "",
}: SidebarProps) {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem("insurai_profile");
    const hasShownWelcome = localStorage.getItem("insurai_welcome_shown");

    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    } else if (!hasShownWelcome && pathname === "/chat") {
      // Show profile modal on first visit to chat page when no profile exists
      setTimeout(() => {
        setShowProfileModal(true);
        localStorage.setItem("insurai_welcome_shown", "true");
      }, 500); // Small delay to ensure page is loaded
    }
  }, [pathname]);

  // Auto-close sidebar on mobile when navigating between pages
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      onToggle(false);
    }
  }, [pathname, onToggle]);

  const handleProfileSubmit = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem("insurai_profile", JSON.stringify(profile));
  };

  const clearProfile = () => {
    localStorage.removeItem("insurai_profile");
    localStorage.removeItem("insurai_welcome_shown"); // Reset welcome flag so modal shows again
    setUserProfile(null);
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`${isOpen ? "w-full sm:w-80 md:w-64" : "w-0"} ${
          isOpen ? "md:relative fixed" : ""
        } md:relative absolute top-0 left-0 h-full z-50 transition-all duration-300 overflow-hidden bg-gray-900 flex flex-col ${className}`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IA</span>
              </div>
              <span className="font-bold text-lg text-white">InsurAI</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(false)}
              className="text-gray-400 hover:text-white p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-4 border-b border-gray-700">
          <div className="space-y-2">
            <Link href="/chat">
              {pathname === "/chat" ? (
                <div className="flex items-center gap-2 text-blue-400 bg-gray-800 rounded px-3 py-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">Chat</span>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </Button>
              )}
            </Link>
            <Link href="/compare">
              {pathname === "/compare" ? (
                <div className="flex items-center gap-2 text-blue-400 bg-gray-800 rounded px-3 py-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Bandingkan Produk</span>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Bandingkan Produk
                </Button>
              )}
            </Link>
          </div>
        </div>

        {/* Custom Content Area */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-700">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start p-2 h-auto hover:bg-gray-800"
              >
                <UserAvatar
                  profile={userProfile}
                  size="sm"
                  showName={true}
                  className="text-white [&_span]:text-white"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start" side="top">
              <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
                <User className="w-4 h-4 mr-2" />
                {userProfile ? "Edit Profil" : "Atur Profil"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearProfile} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Profil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => onToggle(false)}
        />
      )}

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSubmit={handleProfileSubmit}
      />
    </>
  );
}
