import { UserAvatarProps } from "@/lib/types";

export function UserAvatar({ profile, size = "md", showName = true, className = "" }: UserAvatarProps) {
  const displayName = profile?.name?.trim() || "Tamu";
  
  // Get initials from name or use 'T' for Tamu
  const getInitials = (name: string) => {
    if (name === "Tamu") return "T";
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const initials = getInitials(displayName);

  // Size configurations
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm", 
    lg: "w-12 h-12 text-base"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`
        ${sizeClasses[size]} 
        bg-blue-600 rounded-full 
        flex items-center justify-center 
        text-white font-semibold
        ${displayName === "Tamu" ? "bg-gray-500" : "bg-blue-600"}
      `}>
        {initials}
      </div>
      {showName && (
        <span className={`font-medium text-gray-900 dark:text-white ${textSizeClasses[size]}`}>
          {displayName}
        </span>
      )}
    </div>
  );
}