import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MessageSquare,
  BarChart3,
  Shield,
  Clock,
  CheckCircle,
  Users,
  BookOpen,
} from "lucide-react";
import { ImageWithFallback } from "@/components/ImageWithFallback";

export default function Home() {
  const features = [
    {
      icon: MessageSquare,
      title: "Jawab Pertanyaan",
      description: '"Comprehensive itu apa?" · "Gimana proses klaim?"',
    },
    {
      icon: Users,
      title: "Saran Personal",
      description: "Rekomendasi sesuai kendaraan, lokasi, dan kebutuhan kamu.",
    },
    {
      icon: BarChart3,
      title: "Bandingkan Produk",
      description:
        "TLO vs Comprehensive dijelaskan jelas—plus kelebihan & batasannya.",
    },
    {
      icon: BookOpen,
      title: "Rujukan Sumber",
      description:
        "Tautan cepat ke bagian dokumen RIPLAY yang relevan biar kamu bisa cek sendiri.",
    },
  ];

  const benefits = [
    {
      icon: CheckCircle,
      title: "Jawaban Terpercaya",
      description:
        "Informasi bersumber dari dokumen RIPLAY—tanpa spekulasi, hanya fakta.",
    },
    {
      icon: Clock,
      title: "Siaga 24/7",
      description:
        "Tersedia kapan pun kamu butuhkan. Tanpa antrian, tanpa jam kerja.",
    },
    {
      icon: Shield,
      title: "Privasi Terjaga",
      description:
        "Data dan percakapan Anda tetap di perangkat Anda—privasi adalah prioritas.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <span className="text-2xl text-blue-600">InsurAI</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-gray-900">
              Bingung soal asuransi? Kenali pilihan terbaik bareng Miria 🎯
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-600">
              Miria adalah asisten AI yang ramah dan berpengalaman. Ia bantu
              kamu memahami asuransi dengan bahasa sederhana, mengacu pada
              dokumen resmi RIPLAY—jawaban akurat, tepercaya, dan mudah
              dipahami.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 md:p-4">
              <p className="text-[10px] md:text-xs text-amber-800">
                <strong>Disclaimer!</strong> Miria memberi informasi umum dari
                dokumen RIPLAY—bukan pengganti saran profesional. Selalu
                verifikasi keputusan dengan tenaga berlisensi.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Chat dengan Miria
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <BarChart3 className="mr-2 h-5 w-5" />
                Bandingkan Produk
              </Button>
            </div>
          </div>
          <div className="relative mt-8 lg:mt-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-2xl transform rotate-3 opacity-20"></div>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80"
              alt="Miria AI Assistant"
              className="relative rounded-2xl shadow-2xl w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl text-gray-900 mb-4">
            Apa yang Bisa Miria Bantu? 🤔
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Belajar, bandingkan, lalu putuskan dengan percaya diri.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-gray-200 hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex flex-col md:flex-row gap-4 md:items-start">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl text-gray-900 mb-4">
            Kenapa Pilih Miria? ✨
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl mb-4">
            Penasaran? Coba tanya Miria sekarang 🚀
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Mulai percakapan pertamamu dan rasakan betapa gampangnya paham
            asuransi.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Mulai Chat Sekarang →
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-600">
          <p>&copy; 2025 Miria by InsurAI</p>
          <p className="text-sm">
            Selalu konsultasikan dengan profesional asuransi berlisensi
          </p>
        </div>
      </footer>
    </div>
  );
}
