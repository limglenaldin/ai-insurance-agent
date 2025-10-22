"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { UserProfile, ProfileModalProps } from "@/lib/types";

// Re-export UserProfile for backward compatibility
export type { UserProfile };
import { vehicleTypes, cities, usageTypes } from "@/lib/constants";

export function ProfileModal({ isOpen, onClose, onSubmit }: ProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    vehicleType: "",
    city: "",
    vehicleYear: new Date().getFullYear(),
    floodRisk: false,
    usageType: "",
  });

  useEffect(() => {
    if (isOpen) {
      const savedProfile = localStorage.getItem("insurai_profile");
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    }
  }, [isOpen]);

  const handleSubmit = () => {
    localStorage.setItem("insurai_profile", JSON.stringify(profile));
    onSubmit(profile);
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  const isFormValid = profile.vehicleType && profile.city && profile.usageType;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Profil Anda</DialogTitle>
          <DialogDescription className="text-sm">
            Isi informasi berikut untuk mendapatkan saran asuransi yang lebih personal dan akurat.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-xs sm:text-sm font-medium">
              Nama (opsional)
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Nama Anda"
              value={profile.name || ""}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="text-sm"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="vehicleType" className="text-xs sm:text-sm font-medium">
              Jenis Kendaraan *
            </label>
            <Select
              value={profile.vehicleType}
              onValueChange={(value) => setProfile({ ...profile, vehicleType: value })}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Pilih jenis kendaraan" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-sm">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="city" className="text-xs sm:text-sm font-medium">
              Kota *
            </label>
            <Select
              value={profile.city}
              onValueChange={(value) => setProfile({ ...profile, city: value })}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Pilih kota" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.value} value={city.value} className="text-sm">
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="vehicleYear" className="text-xs sm:text-sm font-medium">
              Tahun Kendaraan
            </label>
            <Input
              id="vehicleYear"
              type="number"
              min="1990"
              max={new Date().getFullYear() + 1}
              value={profile.vehicleYear}
              onChange={(e) => setProfile({ ...profile, vehicleYear: parseInt(e.target.value) || new Date().getFullYear() })}
              className="text-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="floodRisk"
              checked={profile.floodRisk}
              onCheckedChange={(checked) => setProfile({ ...profile, floodRisk: checked === true })}
            />
            <label htmlFor="floodRisk" className="text-xs sm:text-sm font-medium">
              Area rawan banjir
            </label>
          </div>

          <div className="grid gap-2">
            <label htmlFor="usageType" className="text-xs sm:text-sm font-medium">
              Penggunaan Kendaraan *
            </label>
            <Select
              value={profile.usageType}
              onValueChange={(value) => setProfile({ ...profile, usageType: value })}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Pilih penggunaan kendaraan" />
              </SelectTrigger>
              <SelectContent>
                {usageTypes.map((usage) => (
                  <SelectItem key={usage.value} value={usage.value} className="text-sm">
                    {usage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="my-2 sm:my-0" />

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 sm:justify-between">
          <Button variant="ghost" onClick={handleSkip} className="w-full sm:w-auto text-sm">
            Lewati
          </Button>
          <Button variant="default" onClick={handleSubmit} disabled={!isFormValid} className="w-full sm:w-auto text-sm">
            Simpan Profil
          </Button>
        </div>

        <p className="text-[10px] sm:text-xs text-muted-foreground text-center leading-tight">
          Data Anda disimpan secara lokal dan tidak dibagikan dengan pihak ketiga.
        </p>
      </DialogContent>
    </Dialog>
  );
}