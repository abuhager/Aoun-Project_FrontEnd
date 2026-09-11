# عون — Aoun Frontend

**واجهة منصة عون لطلب وتنسيق التبرعات العينية**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-149ECA?style=for-the-badge&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

[![Frontend CI](https://github.com/abuhager/Aoun-Project_FrontEnd/actions/workflows/ci.yml/badge.svg)](https://github.com/abuhager/Aoun-Project_FrontEnd/actions/workflows/ci.yml)

منصة عربية لتنظيم التبرعات العينية: يستطيع المستخدم عرض غرض، أو نشر طلب احتياج، ثم تنسيق الحجز والتسليم بأدوار وصلاحيات وإشعارات ومحادثات مرتبطة بالمعاملة.

[تجربة المنصة](https://aoun-project-theta.vercel.app/) · [مستودع الخادم](https://github.com/abuhager/Aoun-Project_BackEnd) · [التواصل والدعم](mailto:aoun.help.center@gmail.com)

> حالة المشروع: MVP منشور يستهدف تجربة Pilot محدودة. تعرض شارة CI أعلاه حالة سير العمل؛ وتبقى اختبارات المتصفح والتحقق التشغيلي جزءًا من تجهيز التجربة. بيانات Demo ونقاط التسليم الظاهرة للاختبار والعرض، ولا تمثل شراكة مؤسسية إلا إذا أُعلن عنها صراحة.

## المشكلة والحل

عندما تتوزع عروض التبرع وطلبات الاحتياج بين منشورات ومحادثات منفصلة، يصبح تتبع توفر الغرض والحجز والتسليم أصعب على الأطراف والجهات المشرفة.

تجمع **عون** هذه الخطوات في رحلة واحدة: عرض أو طلب، ثم حجز وتواصل وتسليم وتقييم، مع صلاحيات واضحة وإشراف إداري. تركز المنصة على **التبرعات العينية**، ولا تجمع تبرعات مالية أو تنفذ عمليات دفع.

| الطرف | القيمة التي تقدمها عون |
| --- | --- |
| المتبرع | عرض الأغراض ومتابعة الحجز والتواصل حتى التسليم |
| طالب الاحتياج | تصفح الأغراض أو نشر طلب ومتابعة الاستجابة |
| الجهة المشرفة | إدارة البلاغات والإعدادات ومراجعة النشاط من لوحة موحدة |

## رحلة الاستخدام

1. ينشئ المتبرع غرضًا أو ينشر المستفيد طلب احتياج.
2. تتم المطابقة عبر الحجز أو تقديم عرض، مع قائمة انتظار عند الحاجة.
3. يتواصل الطرفان داخل محادثة مرتبطة بالمعاملة وينسقان نقطة التسليم.
4. يؤكد الطرفان التسليم، ثم يصبح التقييم متاحًا وتُحدّث حالة الطلب تلقائيًا.
5. تعالج لوحة الإدارة البلاغات والاعتراضات والسياسات التشغيلية دون تعديل الكود.

## أبرز الوظائف

- حسابات وتحقق وجلسات آمنة وصلاحيات مستخدم/مشرف.
- نشر الأغراض وتصفحها وحجزها وقائمة انتظار.
- طلبات احتياج وعروض قبول ورفض وسحب.
- تأكيد تسليم من الطرفين وتقييم بعد الإتمام.
- محادثات وإشعارات فورية عبر Socket.IO.
- بلاغات واعتراضات وإشراف وسجل إداري.
- إعدادات تشغيل وصيانة وسياسة نقاط التسليم.
- تصميم عربي متجاوب ودعم وصول أساسي.

## لقطات الشاشة

مساحة جاهزة لإضافة صور فعلية من بيئة العرض. أضف الصور إلى `docs/screenshots/` في هذا المستودع، أو استبدل المسارات بروابط الصور.

| اللقطة | ما الذي توضحه؟ | المسار المقترح |
| --- | --- | --- |
| استكشاف الأغراض | التصفح والبحث والتصفية | `docs/screenshots/browse.png` |
| تفاصيل الغرض والحجز | حالة الغرض وإجراء الحجز | `docs/screenshots/booking.png` |
| المحادثة | تنسيق التسليم بين الطرفين | `docs/screenshots/chat.png` |
| لوحة المتبرع | متابعة الأغراض والحجوزات | `docs/screenshots/donor-dashboard.png` |
| لوحة الإدارة | الإشراف والبلاغات والإعدادات | `docs/screenshots/admin-dashboard.png` |

<!--
بعد رفع الصور، أخرج أسطر الصور المطلوبة من هذا التعليق لتظهر في GitHub.
استخدم بيانات عرض خالية من معلومات المستخدمين الشخصية.

![استكشاف الأغراض في منصة عون](docs/screenshots/browse.png)
![تفاصيل الغرض والحجز](docs/screenshots/booking.png)
![محادثة لتنسيق التسليم](docs/screenshots/chat.png)
![لوحة المتبرع ومتابعة الحجوزات](docs/screenshots/donor-dashboard.png)
![لوحة الإدارة والإشراف](docs/screenshots/admin-dashboard.png)
-->

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

نتائج ونطاق آخر تنظيف موثقة في [تقرير التنظيف](docs/CLEANUP-REPORT.md). نجاح `verify` لا يعني تشغيل Playwright؛ اختبارات دورة التبرع تحتاج `E2E_RUN_MUTATING=true` وحسابات اختبار لها كوتا متاحة. لا تشغّلها على بيانات مستخدمين حقيقيين.

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

## التطوير والتواصل

طوّر المشروع [أدهم أبو حجر — Adham Abu Hager](https://github.com/abuhager). للاستفسار عن تجربة المنصة أو التعاون المؤسسي: [aoun.help.center@gmail.com](mailto:aoun.help.center@gmail.com).
