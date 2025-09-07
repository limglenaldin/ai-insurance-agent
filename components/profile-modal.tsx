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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profil Anda</DialogTitle>
          <DialogDescription>
            Isi informasi berikut untuk mendapatkan saran asuransi yang lebih personal dan akurat.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nama (opsional)
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Masukkan nama Anda atau kosongkan untuk 'Tamu'"
              value={profile.name || ""}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="vehicleType" className="text-sm font-medium">
              Jenis Kendaraan *
            </label>
            <Select
              value={profile.vehicleType}
              onValueChange={(value) => setProfile({ ...profile, vehicleType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis kendaraan" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="city" className="text-sm font-medium">
              Kota *
            </label>
            <Select
              value={profile.city}
              onValueChange={(value) => setProfile({ ...profile, city: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kota" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="vehicleYear" className="text-sm font-medium">
              Tahun Kendaraan
            </label>
            <Input
              id="vehicleYear"
              type="number"
              min="1990"
              max={new Date().getFullYear() + 1}
              value={profile.vehicleYear}
              onChange={(e) => setProfile({ ...profile, vehicleYear: parseInt(e.target.value) || new Date().getFullYear() })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="floodRisk"
              checked={profile.floodRisk}
              onCheckedChange={(checked) => setProfile({ ...profile, floodRisk: checked === true })}
            />
            <label htmlFor="floodRisk" className="text-sm font-medium">
              Area rawan banjir
            </label>
          </div>

          <div className="grid gap-2">
            <label htmlFor="usageType" className="text-sm font-medium">
              Penggunaan Kendaraan *
            </label>
            <Select
              value={profile.usageType}
              onValueChange={(value) => setProfile({ ...profile, usageType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih penggunaan kendaraan" />
              </SelectTrigger>
              <SelectContent>
                {usageTypes.map((usage) => (
                  <SelectItem key={usage.value} value={usage.value}>
                    {usage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleSkip}>
            Lewati
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid}>
            Simpan Profil
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Data Anda disimpan secara lokal dan tidak dibagikan dengan pihak ketiga.
        </p>
      </DialogContent>
    </Dialog>
  );
}