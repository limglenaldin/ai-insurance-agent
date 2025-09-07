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
              Penting untuk dipahami sebelum menggunakan layanan InsurAI
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
                  <strong>InsurAI adalah alat bantu informasi, bukan pengganti konsultasi profesional.</strong> 
                  Informasi yang diberikan berdasarkan dokumen resmi yang tersedia, namun:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>AI dapat membuat kesalahan dalam interpretasi dokumen</li>
                  <li>Produk asuransi memiliki syarat dan ketentuan yang kompleks</li>
                  <li>Keputusan asuransi harus dikonsultasikan dengan agen berlisensi</li>
                  <li>Selalu verifikasi informasi penting dengan dokumen polis asli</li>
                  <li>Premi dan coverage aktual dapat berbeda dari informasi umum</li>
                </ul>
                <p className="font-medium">
                  Gunakan informasi ini sebagai panduan awal, bukan sebagai dasar keputusan final.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Batasan Layanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Akurasi Informasi</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Meskipun InsurAI menggunakan dokumen resmi sebagai sumber, teknologi AI masih dapat 
                    mengalami kesalahan interpretasi. Informasi yang diberikan bersifat umum dan mungkin 
                    tidak mencakup semua detail spesifik dari produk asuransi.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Tidak Menggantikan Konsultasi Profesional</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    InsurAI tidak dapat menggantikan saran dari agen asuransi berlisensi, broker, atau 
                    konsultan keuangan. Untuk keputusan pembelian asuransi, selalu konsultasikan dengan 
                    profesional yang memiliki lisensi resmi.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Variasi Produk dan Premi</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Premi, manfaat, dan syarat ketentuan asuransi dapat bervariasi berdasarkan banyak faktor 
                    seperti usia kendaraan, riwayat klaim, lokasi, dan lainnya. Informasi yang diberikan 
                    InsurAI bersifat umum dan mungkin berbeda dari penawaran aktual.
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
                  <h3 className="font-semibold mb-2">Verifikasi Informasi</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Pengguna bertanggung jawab untuk memverifikasi semua informasi yang diberikan InsurAI 
                    dengan sumber resmi, agen asuransi, atau dokumen polis asli sebelum membuat keputusan.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Keputusan Independen</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Semua keputusan pembelian atau perubahan produk asuransi merupakan tanggung jawab 
                    pengguna sepenuhnya. InsurAI hanya menyediakan informasi untuk membantu proses 
                    pembelajaran dan penelitian awal.
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