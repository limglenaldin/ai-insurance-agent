// User Profile Types
export interface UserProfile {
  name?: string;
  vehicleType: string;
  city: string;
  vehicleYear: number;
  floodRisk: boolean;
  usageType: string;
}

// Chat and Message Types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: Date;
}

export interface Citation {
  docTitle: string;
  section: string;
  snippet: string;
}

// Product Types (Database Schema)
export interface Product {
  id: number;
  tenantId: number;
  name: string;
  category: string;
  vehicleKind: string | null; // nullable as per your diagram
  mainCoverage: string | null; // nullable as per your diagram
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null; // nullable as per your diagram
}

export interface ProductDocument {
  id: number;
  productId: number;
  title: string;
  type: string;
  url: string;
  version: string | null; // nullable as per your diagram
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null; // nullable as per your diagram
}

// Tenant Types
export interface Tenant {
  id: number;
  planId: number | null; // nullable as per your diagram
  name: string;
  slug: string;
  logoUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null; // nullable as per your diagram
}

// Comparison Types
export interface ProductComparison {
  name: string;
  coverage: string;
  features: string[];
  suitableFor: string[];
  limitations: string[];
}

export interface ComparisonResult {
  productA: ProductComparison;
  productB: ProductComparison;
  summary: string;
}

// Document Processing Types
export interface DocumentSnippet {
  content: string;
  docTitle: string;
  section: string;
  source: string;
}

// Component Props Types
export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (profile: UserProfile) => void;
}

export interface UserAvatarProps {
  profile: UserProfile | null;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}