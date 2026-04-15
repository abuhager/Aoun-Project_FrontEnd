export default function Footer() {
  return (
    <footer
      className="bg-[#004d44] text-white py-6 md:py-8 border-t border-white/10 font-body text-center"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-black mb-2 font-headline tracking-wider">عـون</h2>

        <p className="text-xs md:text-sm text-gray-200 mb-5 max-w-2xl mx-auto leading-relaxed">
          منصة خيرية شبابية تهدف إلى تسهيل التبرع العيني وربط المتبرعين
          بالمحتاجين، تعزيزاً للتكافل الاجتماعي ودعماً لجهود الإغاثة لأهلنا في
          غزة والمجتمع المحلي.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 mb-5 text-xs md:text-sm font-bold text-[#96f7e9]">
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=aoun.project.jo@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">mail</span>
            <span dir="ltr">aoun.help.center@gmail.com</span>
          </a>

          {/* ✅ الفاصل مرئي الآن */}
          <span className="text-white/20 hidden md:inline">|</span>

          <a
            href="https://wa.me/962797283384"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">support_agent</span>
            الدعم الفني (واتساب)
          </a>

          <span className="text-white/20 hidden md:inline">|</span>

          <span className="text-gray-300 flex items-center gap-1.5 cursor-default">
            <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
            مبادرة أردنية مستقلة
          </span>
        </div>

        <div className="w-full h-px bg-white/10 mb-4" />

        <p className="text-[10px] md:text-xs text-gray-400 font-bold">
          © {new Date().getFullYear()} منصة عون المجتمعية - جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  );
}