"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product, ComparisonResult } from "@/lib/types";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { createLogger } from "@/lib/logger";

const log = createLogger('compare-page');

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductA, setSelectedProductA] = useState<string>("");
  const [selectedProductB, setSelectedProductB] = useState<string>("");
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data.filter((p: Product) => p.isActive !== false));
      } catch (error) {
        log.error({ err: error }, "Failed to load products");
        setProducts([]); // Set empty array on error
      }
    };

    fetchProducts();
  }, []);

  const handleGenerateComparison = async () => {
    if (!selectedProductA || !selectedProductB) return;

    setIsLoading(true);

    try {
      const savedProfile = localStorage.getItem("insurai_profile");
      const userProfile = savedProfile ? JSON.parse(savedProfile) : null;

      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productAId: selectedProductA,
          productBId: selectedProductB,
          profile: userProfile,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle API error response
        throw new Error(data.error || "Failed to generate comparison");
      }

      // Check if response has the expected structure
      if (!data.productA || !data.productB) {
        throw new Error("Invalid response format from comparison API");
      }

      setComparison(data);
    } catch (error) {
      log.error({ err: error }, "Comparison error");

      // Show error message to user instead of fallback
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Gagal membuat perbandingan: ${errorMessage}`);
      setComparison(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredProducts = () => {
    // Only access localStorage on the client-side
    if (typeof window === "undefined") {
      return products; // Return all products during SSR
    }

    const savedProfile = localStorage.getItem("insurai_profile");
    const userProfile = savedProfile ? JSON.parse(savedProfile) : null;

    return userProfile
      ? products.filter(
          (p) =>
            (userProfile.vehicleType === "car" && p.vehicleKind === "car") ||
            (userProfile.vehicleType === "motorcycle" &&
              p.vehicleKind === "motorcycle") ||
            !["car", "motorcycle"].includes(userProfile.vehicleType)
        )
      : products;
  };

  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  // Set client flag when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update filtered products when component mounts (client-side)
  useEffect(() => {
    if (isClient) {
      setFilteredProducts(getFilteredProducts());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, isClient]);

  return (
    <div className="h-screen flex bg-white dark:bg-gray-900">
      <Sidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen}>
        {/* Sidebar Content */}
        <div className="p-4">
          <div className="mb-6">
            <h3 className="text-gray-300 text-sm font-medium mb-3">
              Perbandingan Produk
            </h3>
            <p className="text-gray-400 text-xs mb-4">
              Pilih dua produk asuransi untuk melihat perbandingan fitur dan
              manfaatnya
            </p>
          </div>
        </div>
      </Sidebar>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isSidebarOpen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Bandingkan Produk Asuransi
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Pilih dua produk untuk melihat perbandingan
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-6xl mx-auto">
            {isClient && !localStorage.getItem("insurai_profile") && (
              <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-800">
                    Lengkapi Profil Anda
                  </CardTitle>
                  <CardDescription>
                    Isi profil untuk mendapatkan perbandingan yang lebih
                    personal dan akurat
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-600 text-sm">
                    Klik avatar di sidebar untuk mengatur profil Anda
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Produk Pertama</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selectedProductA}
                    onValueChange={setSelectedProductA}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih produk pertama" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      {filteredProducts.map((product) => (
                        <SelectItem
                          key={product.id}
                          value={product.id.toString()}
                          disabled={selectedProductB === product.id.toString()}
                        >
                          {product.name} ({product.mainCoverage})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Produk Kedua</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selectedProductB}
                    onValueChange={setSelectedProductB}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih produk kedua" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      {filteredProducts.map((product) => (
                        <SelectItem
                          key={product.id}
                          value={product.id.toString()}
                          disabled={selectedProductA === product.id.toString()}
                        >
                          {product.name} ({product.mainCoverage})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mb-8">
              <Button
                size="lg"
                onClick={handleGenerateComparison}
                disabled={!selectedProductA || !selectedProductB || isLoading}
                className="px-8"
              >
                {isLoading
                  ? "Membuat Perbandingan..."
                  : "Generate Perbandingan"}
              </Button>
            </div>

            {comparison && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ringkasan Perbandingan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300">
                      {comparison.summary}
                    </p>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-blue-600">
                        {comparison.productA.name}
                      </CardTitle>
                      <CardDescription>
                        Coverage: {comparison.productA.coverage}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Fitur Utama:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {comparison.productA.features.map(
                            (feature, index) => (
                              <li
                                key={index}
                                className="text-sm text-gray-600 dark:text-gray-400"
                              >
                                {feature}
                              </li>
                            )
                          )}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 text-green-600">
                          Cocok untuk:
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                          {comparison.productA.suitableFor.map(
                            (item, index) => (
                              <li
                                key={index}
                                className="text-sm text-gray-600 dark:text-gray-400"
                              >
                                {item}
                              </li>
                            )
                          )}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 text-orange-600">
                          Keterbatasan:
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                          {comparison.productA.limitations.map(
                            (limit, index) => (
                              <li
                                key={index}
                                className="text-sm text-gray-600 dark:text-gray-400"
                              >
                                {limit}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">
                        {comparison.productB.name}
                      </CardTitle>
                      <CardDescription>
                        Coverage: {comparison.productB.coverage}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Fitur Utama:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {comparison.productB.features.map(
                            (feature, index) => (
                              <li
                                key={index}
                                className="text-sm text-gray-600 dark:text-gray-400"
                              >
                                {feature}
                              </li>
                            )
                          )}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 text-green-600">
                          Cocok untuk:
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                          {comparison.productB.suitableFor.map(
                            (item, index) => (
                              <li
                                key={index}
                                className="text-sm text-gray-600 dark:text-gray-400"
                              >
                                {item}
                              </li>
                            )
                          )}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 text-orange-600">
                          Keterbatasan:
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                          {comparison.productB.limitations.map(
                            (limit, index) => (
                              <li
                                key={index}
                                className="text-sm text-gray-600 dark:text-gray-400"
                              >
                                {limit}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-yellow-50 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="text-yellow-800">
                      ⚠️ Disclaimer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-yellow-700">
                      Perbandingan ini bersifat umum dan berdasarkan informasi
                      produk yang tersedia. Untuk detail lengkap seperti premi,
                      syarat, dan ketentuan spesifik, silakan hubungi agen
                      asuransi atau baca dokumen polis secara detail. Keputusan
                      asuransi sebaiknya dikonsultasikan dengan profesional
                      berlisensi.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
