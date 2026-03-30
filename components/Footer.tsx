export default function Footer() {
  return (
    <footer
      className="bg-[#004d44] text-white py-6 md:py-8 border-t border-[#003d36] font-body text-center mt-auto"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* الشعار والوصف بمسافات أقل */}
        <h2 className="text-2xl font-black mb-2 font-headline tracking-wider">
          عـون
        </h2>

        <p className="text-xs md:text-sm text-gray-200 mb-5 max-w-2xl mx-auto leading-relaxed">
          منصة خيرية شبابية تهدف إلى تسهيل التبرع العيني وربط المتبرعين
          بالمحتاجين، تعزيزاً للتكافل الاجتماعي ودعماً لجهود الإغاثة لأهلنا في
          غزة والمجتمع المحلي.
        </p>

        {/* الروابط بحجم أنعم وإظهار الإيميل كنص */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 mb-5 text-xs md:text-sm font-bold text-[#96f7e9]">
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=aoun.project.jo@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1.5"
            title="إرسال إيميل عبر Gmail"
          >
            <span className="material-symbols-outlined text-[16px]">mail</span>
            <span dir="ltr">aoun.project.jo@gmail.com</span>
          </a>

          <span className="text-[#003d36] hidden md:inline">|</span>

          <a
            href="https://wa.me/962790000000"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">
              support_agent
            </span>
            الدعم الفني (واتساب)
          </a>

          <span className="text-[#003d36] hidden md:inline">|</span>

          <span className="text-gray-300 flex items-center gap-1.5 cursor-default">
            <span className="material-symbols-outlined text-[16px]">
              volunteer_activism
            </span>
            مبادرة أردنية مستقلة
          </span>
        </div>

        {/* خط فاصل أنحف وأقرب */}
        <div className="w-full h-px bg-[#003d36] mb-4 opacity-70"></div>

        {/* حقوق النشر */}
        <p className="text-[10px] md:text-xs text-gray-400 font-bold">
          © {new Date().getFullYear()} منصة عون المجتمعية - جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  );
}
