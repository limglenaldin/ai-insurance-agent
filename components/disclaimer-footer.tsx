import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function DisclaimerFooter() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">IA</span>
            </div>
            <span className="font-bold text-lg">InsurAI</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Maya adalah asisten asuransi bertenaga AI yang memberikan informasi berdasarkan dokumen resmi 
            dengan sitasi yang akurat dan perlindungan privasi penuh.
          </p>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            <p>© 2024 Maya by InsurAI.</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-4">
              <Link href="/disclaimer" className="hover:text-blue-600 transition-colors">
                Disclaimer
              </Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">
                Kebijakan Privasi
              </Link>
            </div>
            <div className="hidden md:block">•</div>
            <p className="text-center md:text-left">
              Selalu konsultasikan dengan <strong>profesional asuransi berlisensi</strong>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}