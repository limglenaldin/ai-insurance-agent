import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { vehicleTypes, cities, usageTypes } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper Functions for Labels
export function getVehicleTypeLabel(type: string): string {
  const vehicleType = vehicleTypes.find(v => v.value === type);
  return vehicleType?.label || type;
}

export function getCityLabel(city: string): string {
  const cityData = cities.find(c => c.value === city);
  return cityData?.label || city;
}

export function getUsageTypeLabel(type: string): string {
  const usageType = usageTypes.find(u => u.value === type);
  return usageType?.label || type;
}
