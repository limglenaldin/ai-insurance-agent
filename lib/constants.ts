// Storage Constants
export const STORAGE_KEYS = {
  PROFILE: "insurai_profile",
  CHAT_HISTORY: "insurai_chat_history",
} as const;

// Dropdown Options
export const vehicleTypes = [
  { value: "car", label: "Mobil" },
  { value: "motorcycle", label: "Motor" },
  { value: "truck", label: "Truk" },
  { value: "bus", label: "Bus" },
];

export const cities = [
  { value: "jakarta", label: "Jakarta" },
  { value: "surabaya", label: "Surabaya" },
  { value: "bandung", label: "Bandung" },
  { value: "medan", label: "Medan" },
  { value: "semarang", label: "Semarang" },
  { value: "makassar", label: "Makassar" },
  { value: "palembang", label: "Palembang" },
  { value: "tangerang", label: "Tangerang" },
  { value: "bekasi", label: "Bekasi" },
  { value: "depok", label: "Depok" },
];

export const usageTypes = [
  { value: "personal", label: "Pribadi" },
  { value: "commercial", label: "Komersial" },
  { value: "rideshare", label: "Ojek Online/Taksi Online" },
  { value: "delivery", label: "Kurir/Delivery" },
];

// Quick Templates for Chat with Miria
export const quickTemplates = [
  "Halo Miria, saya baru mau beli asuransi mobil. Bisa jelaskan produk yang cocok untuk saya?",
  "Miria, apa saja perlindungan yang ada dalam asuransi comprehensive?",
  "Miria, kalau mobil saya kena banjir, bagaimana cara klaimnya?",
  "Bisa tolong jelaskan perbedaan antara TLO dan Comprehensive, Miria?",
  "Miria, berapa lama biasanya proses klaim asuransi kendaraan?",
  "Untuk area Jakarta yang sering banjir, asuransi mana yang paling cocok Miria?",
  "Miria, bagaimana cara menghitung premi asuransi untuk mobil tahun 2020?",
  "Miria, apa saja manfaat tambahan dari asuransi kendaraan bermotor?",
];