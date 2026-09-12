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

منصة عربية لتنظيم **التبرعات العينية** من بداية عرض الغرض أو نشر الاحتياج، مرورًا بالحجز والتواصل، وحتى التسليم والتقييم، ضمن أدوار وصلاحيات وإشراف إداري واضح.

[تجربة المنصة](https://aoun-project-theta.vercel.app/) · [مستودع الخادم](https://github.com/abuhager/Aoun-Project_BackEnd) · [التواصل والدعم](mailto:aoun.help.center@gmail.com)

> **حالة المشروع:** MVP منشور يستهدف تجربة Pilot محدودة. بيانات Demo ونقاط التسليم الظاهرة مخصصة للاختبار والعرض ولا تمثل شراكات مؤسسية حقيقية إلا إذا أُعلن عنها صراحة.

<p align="center">
  <img src="docs/screenshots/hero.webp" alt="Aoun platform home page" width="900" />
</p>

## المشكلة والحل

عندما تتوزع عروض التبرع وطلبات الاحتياج بين منشورات ومحادثات منفصلة، يصبح تتبع توفر الغرض والحجز والتسليم أصعب على المتبرع والمستفيد والجهة المشرفة.

تجمع **عون** هذه الخطوات في رحلة واحدة قابلة للمتابعة: **عرض أو طلب → حجز → تواصل → تسليم → تقييم**. المنصة مخصصة للتبرعات العينية، ولا تجمع تبرعات مالية ولا تنفذ عمليات دفع.

| الطرف | القيمة التي تقدمها عون |
| --- | --- |
| المتبرع | عرض الأغراض ومتابعة الحجز والتواصل حتى التسليم |
| طالب الاحتياج | تصفح الأغراض أو نشر طلب ومتابعة الاستجابة |
| الجهة المشرفة | إدارة البلاغات والإعدادات ومراجعة النشاط من لوحة موحدة |

## رحلة الاستخدام

1. ينشئ المتبرع غرضًا أو ينشر المستفيد طلب احتياج.
2. تتم المطابقة عبر الحجز أو تقديم عرض، مع قائمة انتظار عند الحاجة.
3. يتواصل الطرفان داخل محادثة مرتبطة بالمعاملة وينسقان نقطة التسليم.
4. يؤكد الطرفان التسليم، ثم يصبح التقييم متاحًا وتُحدّث الحالة تلقائيًا.
5. تعالج لوحة الإدارة البلاغات والاعتراضات والسياسات التشغيلية دون تعديل الكود.

## أبرز الوظائف

- حسابات وتحقق وجلسات آمنة وصلاحيات متعددة.
- نشر الأغراض وتصفحها وحجزها وقائمة انتظار.
- طلبات احتياج وعروض قبول ورفض وسحب.
- تأكيد تسليم من الطرفين وتقييم بعد الإتمام.
- محادثات وإشعارات فورية عبر Socket.IO.
- بلاغات واعتراضات وإشراف وسجل إداري.
- إعدادات تشغيل وصيانة وسياسة نقاط التسليم.
- واجهة عربية متجاوبة مع دعم وصول أساسي.

## جولة داخل المنصة

### الحجز وربط المعاملة بالمستخدمين

<p align="center">
  <img src="docs/screenshots/booking.webp" alt="Aoun booking flow" width="900" />
</p>

بعد اختيار الغرض، تنقل عون العملية من مجرد منشور إلى معاملة قابلة للمتابعة، مع حالة واضحة للحجز والتسليم.

### المحادثة وتنسيق التسليم

<p align="center">
  <img src="docs/screenshots/chat.webp" alt="Aoun transaction chat" width="900" />
</p>

المحادثة مرتبطة بالمعاملة نفسها حتى يبقى تنسيق التسليم في سياقه بدل الاعتماد على محادثات خارجية منفصلة.

### طلبات الاحتياج

<p align="center">
  <img src="docs/screenshots/requests.webp" alt="Aoun donation requests" width="900" />
</p>

يمكن للمستخدم نشر احتياجه ومتابعة الاستجابات، بدل اقتصار المنصة على تصفح الأغراض المعروضة فقط.

### الإشراف والإدارة

<p align="center">
  <img src="docs/screenshots/admin-dashboard.webp" alt="Aoun admin dashboard" width="900" />
</p>

توفر لوحة الإدارة نقطة مركزية لمتابعة النشاط والبلاغات والإعدادات والسياسات التشغيلية.

## التقنيات

- **Frontend:** Next.js 16، React 19، TypeScript، Tailwind CSS.
- **Rendering:** Server Components للصفحات المناسبة مع Client islands للتفاعل والمصادقة والـSocket.
- **Data:** `fetch` على السيرفر، Axios وSWR في الواجهة.
- **Realtime:** Socket.IO Client.
- **Testing:** Playwright لاختبارات E2E وNode Test Runner لاختبارات العقود والانحدار.
- **Deployment:** Vercel مع Backend مستقل على Render.

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

في الإنتاج يجب أن يشير `NEXT_PUBLIC_API_URL` و`BACKEND_URL` إلى Backend الفعلي، وليس إلى localhost أو رابط الواجهة نفسها.

## التحقق والاختبارات

```bash
npm run verify
npm run build
npx playwright test --workers=1
```

- `verify`: lint ثم typecheck ثم اختبارات العقود والانحدار.
- `build`: يتحقق من بناء نسخة الإنتاج.
- Playwright: يختبر أهم المسارات من المتصفح؛ الاختبارات التي تغيّر البيانات تحتاج بيئة وبيانات اختبار مخصصة.

نتائج ونطاق آخر تنظيف موثقة في [تقرير التنظيف](docs/CLEANUP-REPORT.md). لا تشغّل اختبارات E2E التي تغيّر البيانات على مستخدمين حقيقيين.

## بنية المشروع

```text
src/app/          صفحات ومسارات Next.js
src/components/   مكونات الواجهة المشتركة
src/context/      المصادقة والإعدادات والـSocket
src/lib/api/      طبقة الاتصال بالـAPI
src/types/        أنواع البيانات المشتركة
test/             اختبارات العقود والانحدار
tests/            اختبارات Playwright E2E
docs/             QA وPilot ولقطات المشروع
```

## الخصوصية والسلامة

- لا يدعم عون جمع التبرعات المالية أو الدفع داخل المنصة.
- الوصول إلى الطلبات والعروض والمحادثات مقيد حسب الطرف والدور.
- لا ينبغي اعتبار نقاط Demo مواقع معتمدة قبل التحقق منها.
- صفحات [سياسة الخصوصية](https://aoun-project-theta.vercel.app/privacy) و[شروط الاستخدام](https://aoun-project-theta.vercel.app/terms) مسودتان تشغيليتان أوليتان وتحتاجان مراجعة قانونية قبل إطلاق مؤسسي واسع.

## تجربة مؤسسية محدودة

يوجد مقترح في `docs/PILOT-PROPOSAL.md` لتجربة من 4 إلى 6 أسابيع مع 30 إلى 50 مستخدمًا، وقياس الطلبات والتسليمات ورضا المشاركين قبل التوسع.

## التطوير والتواصل

طوّر المشروع [أدهم أبو حجر — Adham Abu Hager](https://github.com/abuhager).

للاستفسار عن تجربة المنصة أو التعاون المؤسسي: [aoun.help.center@gmail.com](mailto:aoun.help.center@gmail.com).
