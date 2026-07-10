import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-emerald-100 bg-emerald-50" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-emerald-800 mb-3">سجلني</h3>
            <p className="text-sm text-emerald-600 leading-relaxed">
              المنصة الجزائرية الأولى لعرض وحجز الأكاديميات والمدارس الخاصة
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-emerald-800 mb-3">روابط سريعة</h4>
            <ul className="space-y-2 text-sm text-emerald-600">
              <li><Link href="/" className="hover:text-emerald-800 transition-colors">الرئيسية</Link></li>
              <li><Link href="/schools" className="hover:text-emerald-800 transition-colors">الأكاديميات</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-emerald-800 mb-3">اتصل بنا</h4>
            <p className="text-sm text-emerald-600">support@sajjini.dz</p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-emerald-200 text-center text-sm text-emerald-500">
          © {new Date().getFullYear()} سجلني. جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  )
}
