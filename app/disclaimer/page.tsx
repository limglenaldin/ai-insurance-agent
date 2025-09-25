import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/">
              <Button variant="outline" className="mb-4">
                ← Kembali ke Beranda
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Disclaimer
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Penting untuk dipahami sebelum menggunakan Miria AI Assistant dan layanan InsurAI
            </p>
          </div>

          <div className="space-y-6">
            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <CardTitle className="text-yellow-800 dark:text-yellow-200 flex items-center">
                  ⚠️ Disclaimer Penting
                </CardTitle>
              </CardHeader>
              <CardContent className="text-yellow-700 dark:text-yellow-300 space-y-4">
                <p>
                  <strong>Miria AI Assistant dan InsurAI adalah alat bantu informasi, bukan pengganti konsultasi profesional.</strong> 
                  Meskipun Miria menggunakan teknologi RAG (Retrieval-Augmented Generation) dengan dokumen resmi RIPLAY, namun:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>AI dapat membuat kesalahan dalam interpretasi dokumen meski menggunakan citasi</li>
                  <li>Produk asuransi memiliki syarat dan ketentuan yang sangat kompleks</li>
                  <li>Keputusan asuransi harus dikonsultasikan dengan agen berlisensi</li>
                  <li>Selalu verifikasi informasi penting dengan dokumen polis asli</li>
                  <li>Premi dan coverage aktual dapat berbeda dari informasi umum Miria</li>
                  <li>Anti-hallucination validation tidak menjamin 100% akurasi informasi</li>
                </ul>
                <p className="font-medium">
                  Gunakan Miria sebagai konsultan awal untuk pembelajaran, bukan sebagai dasar keputusan final.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Batasan Layanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Teknologi RAG dan Citasi</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Meskipun Miria menggunakan teknologi RAG dengan 92 chunk dokumen resmi RIPLAY dan 
                    menyediakan citasi untuk setiap respons, teknologi AI masih dapat mengalami kesalahan 
                    interpretasi. Sistem anti-hallucination validation dan semantic search tidak menjamin 
                    100% akurasi informasi.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Tidak Menggantikan Konsultasi Profesional</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Miria AI Assistant tidak dapat menggantikan saran dari agen asuransi berlisensi, broker, 
                    atau konsultan keuangan. Meskipun Miria memiliki conversation memory dan personalized responses, 
                    untuk keputusan pembelian asuransi tetap harus dikonsultasikan dengan profesional berlisensi.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Personalisasi dan Variasi Produk</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Meskipun Miria menggunakan profile-based personalization dan query enhancement 
                    (seperti Jakarta + flood risk), premi, manfaat, dan syarat ketentuan asuransi dapat 
                    bervariasi berdasarkan banyak faktor seperti usia kendaraan, riwayat klaim, lokasi 
                    spesifik, dan lainnya. Informasi Miria bersifat umum dan mungkin berbeda dari penawaran aktual.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tanggung Jawab Pengguna</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Verifikasi Citasi dan Informasi</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Meskipun Miria menyediakan citasi dari dokumen resmi RIPLAY, pengguna bertanggung jawab 
                    untuk memverifikasi semua informasi dengan sumber resmi, agen asuransi, atau dokumen 
                    polis asli sebelum membuat keputusan. Citasi yang diberikan Miria bisa saja tidak 
                    mencerminkan konteks lengkap dari dokumen asli.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Keputusan Independen</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Semua keputusan pembelian atau perubahan produk asuransi merupakan tanggung jawab 
                    pengguna sepenuhnya. Miria AI Assistant dan fitur comparison hanya menyediakan informasi 
                    untuk membantu proses pembelajaran dan penelitian awal, bukan sebagai advice finansial resmi.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kontak dan Dukungan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Jika Anda menemukan informasi yang tidak akurat atau memiliki pertanyaan tentang 
                  layanan InsurAI, silakan hubungi kami. Namun, untuk pertanyaan spesifik tentang 
                  produk asuransi, disarankan untuk menghubungi agen atau perusahaan asuransi terkait.
                </p>
                <p className="font-medium">
                  Selalu utamakan konsultasi dengan profesional berlisensi untuk keputusan asuransi yang penting.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}