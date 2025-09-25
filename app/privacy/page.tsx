import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
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
              Kebijakan Privasi
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Komitmen kami untuk melindungi privasi dan data Anda dengan Miria
              AI Assistant
            </p>
          </div>

          <div className="space-y-6">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center">
                  🔒 Komitmen Privasi
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-700 dark:text-blue-300 space-y-4">
                <p>
                  <strong>Kami menghormati privasi Anda sepenuhnya:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Profil dan riwayat chat Miria hanya tersimpan di perangkat
                    Anda
                  </li>
                  <li>
                    Tidak ada server yang menyimpan data pribadi atau
                    conversation history
                  </li>
                  <li>
                    Query ke AI hanya berisi pertanyaan dan profil umum, tanpa
                    identitas
                  </li>
                  <li>
                    Anda dapat menghapus semua data kapan saja (Clear Chat
                    button)
                  </li>
                  <li>
                    Tidak ada pelacakan aktivitas, analytics, atau cookies
                    tracking
                  </li>
                  <li>
                    Teknologi RAG bekerja dengan dokumen umum, bukan data
                    personal
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Penyimpanan Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Local Storage</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Semua data pribadi Anda (profil pengguna, riwayat chat,
                    preferensi) disimpan secara lokal di browser perangkat Anda
                    menggunakan Local Storage. Data ini tidak pernah dikirim ke
                    server eksternal atau cloud.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">
                    Arsitektur Multi-Service Privacy
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    InsurAI menggunakan arsitektur multi-service (Next.js +
                    FastAPI Python) namun tetap tidak menyimpan informasi
                    pribadi pengguna di server manapun. Database PostgreSQL
                    hanya berisi metadata produk asuransi umum, bukan data
                    personal. Aplikasi dirancang dengan prinsip &quot;privacy by
                    design&quot; dimana data pribadi tidak pernah meninggalkan
                    perangkat Anda.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">
                    Kontrol Penuh oleh Pengguna
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Anda memiliki kontrol penuh terhadap data Anda. Kapan saja
                    Anda dapat:
                  </p>
                  <ul className="list-disc list-inside mt-2 ml-4 text-gray-600 dark:text-gray-400">
                    <li>Menghapus profil dan riwayat chat</li>
                    <li>Mengekspor data untuk backup pribadi</li>
                    <li>Mengimpor data dari backup sebelumnya</li>
                    <li>Mengatur ulang aplikasi ke kondisi awal</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Komunikasi dengan AI</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">
                    Data yang Dikirim ke Miria AI
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ketika Anda chat dengan Miria, hanya teks pertanyaan dan
                    informasi profil umum (jenis kendaraan, kota, tahun
                    kendaraan, tipe penggunaan, flood risk) yang dikirim ke
                    layanan AI (Groq/Llama) melalui FastAPI Python service.
                    Tidak ada informasi identitas pribadi seperti nama, alamat,
                    atau nomor telepon yang dikirim.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">
                    Conversation Memory yang Aman
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Meskipun Miria memiliki conversation memory untuk memberikan
                    respons kontekstual, memori ini hanya tersimpan di
                    localStorage browser Anda. Server AI (Groq/Llama) dan
                    FastAPI Python service tidak menyimpan riwayat percakapan
                    atau dapat mengidentifikasi pengguna individual antar sesi.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Keamanan Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Enkripsi Multi-Layer</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Semua komunikasi antara browser ↔ Next.js ↔ FastAPI Python
                    service ↔ Groq AI menggunakan HTTPS/TLS untuk memastikan
                    data terenkripsi selama transmisi. Vector database dan RAG
                    processing juga dilindungi dalam network yang aman. Meskipun
                    demikian, data pribadi tidak dikirim ke server, hanya
                    pertanyaan dan informasi profil umum.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Keamanan Browser</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Data yang disimpan di Local Storage mengikuti kebijakan
                    keamanan browser. Data hanya dapat diakses oleh aplikasi
                    InsurAI dari domain yang sama dan tidak dapat diakses oleh
                    website atau aplikasi lain.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tidak Ada Pelacakan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Tanpa Analytics</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    InsurAI tidak menggunakan Google Analytics, Facebook Pixel,
                    atau layanan pelacakan lainnya. Tidak ada data penggunaan
                    yang dikumpulkan atau dikirim ke pihak ketiga untuk tujuan
                    analisis atau marketing.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">
                    Tanpa Cookies Pelacakan
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Aplikasi tidak menggunakan cookies untuk pelacakan atau
                    profiling. Cookies yang mungkin ada hanya untuk
                    fungsionalitas dasar aplikasi web dan tidak berisi informasi
                    pribadi.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pembaruan Kebijakan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Kebijakan privasi ini dapat diperbarui dari waktu ke waktu
                  untuk mencerminkan perubahan dalam aplikasi atau peraturan
                  yang berlaku. Perubahan signifikan akan diinformasikan melalui
                  aplikasi atau website.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-700 dark:text-green-300 font-medium">
                    <strong>Komitmen Kami:</strong> InsurAI dengan Miria AI
                    Assistant akan selalu mengutamakan privasi pengguna dan
                    tidak akan pernah menjual, menyewakan, atau membagikan data
                    pribadi Anda kepada pihak ketiga. Teknologi RAG,
                    conversation memory, dan personalization dirancang untuk
                    bekerja tanpa mengompromikan privasi Anda.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
