import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DisclaimerFooter } from "@/components/disclaimer-footer";
import { MessageSquare, BarChart3, Shield, Clock, FileText, Zap, CheckCircle, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="flex-1 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-20">
          {/* Main Hero */}
          <div className="max-w-6xl mx-auto text-center mb-20">
            <div className="mb-8">
              <div className="text-center mb-6">
                <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Miria
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">Asisten AI dari InsurAI</p>
              </div>
              
              <div className="max-w-4xl mx-auto mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Temukan Asuransi yang Tepat dengan Miria! 🎯
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Asisten AI yang ramah dan berpengalaman untuk membantu Anda memahami produk asuransi dengan mudah. 
                  Miria memberikan jawaban yang akurat berdasarkan dokumen resmi RIPLAY.
                </p>
                
                {/* Value Proposition */}
                <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm">
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">100% Gratis</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">Data Aman</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-700 dark:text-gray-300">Respon Instan</span>
                  </div>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/chat">
                  <Button size="lg" className="text-lg px-10 py-6 h-auto w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-300 transform hover:scale-105 transition-all text-white">
                    <MessageSquare className="w-6 h-6 mr-2" />
                    Chat dengan Miria
                  </Button>
                </Link>
                <Link href="/compare">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-6 h-auto w-full sm:w-auto border-2 border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900 transform hover:scale-105 transition-all">
                    <BarChart3 className="w-6 h-6 mr-2" />
                    Bandingkan Produk
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* What Miria Can Do */}
          <div className="max-w-6xl mx-auto mb-20">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Apa yang Bisa Miria Lakukan? 🤔
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Miria siap membantu Anda dengan berbagai kebutuhan asuransi
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center hover:shadow-lg transition-shadow border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur">
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg">Jawab Pertanyaan</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    "Miria, apa itu comprehensive?" <br/>
                    "Bagaimana cara klaim asuransi?"
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur">
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg">Saran Personal</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    Rekomendasi berdasarkan kendaraan, lokasi, dan kebutuhan Anda
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur">
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-lg">Bandingkan Produk</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    Analisis detail perbedaan TLO vs Comprehensive
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur">
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle className="text-lg">Citasi Akurat</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    Setiap jawaban dilengkapi referensi dokumen resmi
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Key Features */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Kenapa Pilih Miria? ✨
              </h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Jawaban Terpercaya
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Semua jawaban Miria berdasarkan dokumen RIPLAY resmi - tanpa spekulasi, hanya fakta yang akurat.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  24/7 Siap Membantu
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Miria tersedia kapan saja Anda butuhkan. Tidak ada antrian, tidak ada jam kerja.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Privasi Terjamin
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Data dan percakapan Anda tetap di perangkat Anda. Privasi 100% terlindungi.
                </p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="max-w-2xl mx-auto text-center mt-20">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-4">
                Siap Bertemu Miria? 🚀
              </h3>
              <p className="mb-6 text-blue-100">
                Mulai percakapan pertama Anda dan rasakan pengalaman memahami asuransi yang berbeda!
              </p>
              <Link href="/chat">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 shadow-lg transform hover:scale-105 transition-all">
                  Mulai Chat Sekarang →
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
              Panduan asuransi bertenaga AI • Selalu verifikasi keputusan penting dengan profesional berlisensi
            </p>
          </div>
        </div>
      </div>
      <DisclaimerFooter />
    </div>
  );
}
