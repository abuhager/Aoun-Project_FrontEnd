# عون — Aoun

منصة عربية لتنظيم التبرعات العينية: يستطيع المستخدم عرض غرض، أو نشر طلب احتياج، ثم تنسيق الحجز والتسليم بأدوار وصلاحيات وإشعارات ومحادثات مرتبطة بالمعاملة.

- النسخة المنشورة: https://aoun-project-theta.vercel.app/
- مستودع الخلفية: https://github.com/abuhager/Aoun-Project_BackEnd
- الدعم: aoun.help.center@gmail.com

> حالة المشروع: MVP يعمل ويخضع لإطلاق تجريبي محدود. بيانات Demo ونقاط التسليم الظاهرة للاختبار والعرض، ولا تمثل شراكة مؤسسية إلا إذا أُعلن عنها صراحة.

## أبرز الوظائف

- حسابات وتحقق وجلسات آمنة وصلاحيات مستخدم/مشرف.
- نشر الأغراض وتصفحها وحجزها وقائمة انتظار.
- طلبات احتياج وعروض قبول ورفض وسحب.
- تأكيد تسليم من الطرفين وتقييم بعد الإتمام.
- محادثات وإشعارات فورية عبر Socket.IO.
- بلاغات واعتراضات وإشراف وسجل إداري.
- إعدادات تشغيل وصيانة وسياسة نقاط التسليم.
- تصميم عربي متجاوب ودعم وصول أساسي.

## التقنيات

- Next.js 16، React 19، TypeScript، Tailwind CSS.
- Server Components للصفحات العامة، مع Client islands للتفاعل والمصادقة والـSocket.
- `fetch` على السيرفر مع revalidation للبيانات العامة ووقت انتظار محدود.
- Axios، SWR، Socket.IO Client، Firebase.
- Playwright لاختبارات E2E، وNode Test Runner لاختبارات العقود والانحدار.

## التشغيل المحلي

المتطلبات: Node.js 20.19 أو أحدث، وخدمة Backend تعمل محليًا أو عبر HTTPS.

```bash
npm ci
npm run dev
```

ضع القيم المحلية في `.env.local` ولا ترفعها إلى Git:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
BACKEND_URL=http://localhost:5000
SERVER_API_TIMEOUT_MS=5000
```

`BACKEND_URL` هو العنوان الذي تستخدمه Server Components داخل Vercel، بينما
`NEXT_PUBLIC_API_URL` يبقى عنوان الـAPI/Socket الذي تحتاجه الواجهة في المتصفح.
في Vercel يجب أن يشير المتغيران إلى Backend على Render، وليس إلى localhost أو
إلى رابط Vercel نفسه:

```env
NEXT_PUBLIC_API_URL=https://aoun-project-backend.onrender.com
BACKEND_URL=https://aoun-project-backend.onrender.com
SERVER_API_TIMEOUT_MS=5000
```

يمكن إدارة ظهور حسابات Demo من متغيرات بيئة السيرفر. لا تضع كلمات المرور داخل ملفات المصدر أو README.

## التحقق والاختبارات

```bash
npm run verify
npm run build
npx playwright test --workers=1
```

- `verify`: lint ثم typecheck ثم اختبارات العقود والانحدار.
- `build`: يتحقق من بناء نسخة الإنتاج.
- Playwright: يختبر أهم المسارات من المتصفح. الاختبارات التي تغيّر البيانات تحتاج قاعدة اختبار وبيانات Demo مخصصة.

## بنية المشروع

```text
src/app/          صفحات ومسارات Next.js
src/components/   مكونات الواجهة المشتركة
src/context/      المصادقة والإعدادات والـSocket
src/lib/api/      عميل المتصفح وطبقة API العامة الخاصة بالسيرفر
src/types/        أنواع البيانات المشتركة
test/             اختبارات العقود والانحدار
tests/            اختبارات Playwright E2E
docs/             خطط ونتائج QA ومقترح Pilot
```

## الخصوصية والسلامة

- لا يدعم عون جمع التبرعات المالية أو الدفع داخل المنصة.
- الوصول إلى الطلبات والعروض والمحادثات مقيد حسب الطرف والدور.
- لا ينبغي اعتبار نقاط Demo مواقع معتمدة قبل التحقق منها.
- صفحات [سياسة الخصوصية](https://aoun-project-theta.vercel.app/privacy) و[شروط الاستخدام](https://aoun-project-theta.vercel.app/terms) مسودتان تشغيليتان أوليتان وتحتاجان مراجعة قانونية قبل إطلاق مؤسسي واسع.

## تجربة مؤسسية محدودة

يوجد مقترح جاهز في `docs/PILOT-PROPOSAL.md` لتجربة من 4 إلى 6 أسابيع مع 30 إلى 50 مستخدمًا، وقياس عدد الطلبات والتسليمات ورضا المشاركين قبل التوسع.
