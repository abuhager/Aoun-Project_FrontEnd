# QA04 Playwright

ضع هذه الملفات في جذر `aoun-frontend`.

شغّل Backend وFrontend أولاً، ثم أضف بيانات Demo إلى جلسة PowerShell الحالية:

```powershell
$env:DEMO_STUDENT_EMAIL="ضع-الإيميل-هنا"
$env:DEMO_STUDENT_PASSWORD="ضع-كلمة-المرور-هنا"
```

لتشغيل الاختبارات الأساسية:

```bash
npx playwright test
```

دورة التبرع الكاملة تغيّر قاعدة البيانات وتستهلك كوتا الطالب، لذلك تُتخطى افتراضيًا.
لا تشغّلها على حساب Demo المعتاد. استخدم حسابات اختبار مخصصة وكوتا متاحة، ثم عرّف:

```powershell
$env:DEMO_DONOR_EMAIL="إيميل المتبرع"
$env:DEMO_DONOR_PASSWORD="كلمة مرور المتبرع"
$env:E2E_RUN_MUTATING="true"
npx playwright test
```

الأفضل لاحقًا تشغيلها على قاعدة اختبار منفصلة مع Seed وCleanup تلقائيين.

لرؤية التقرير:

```bash
npx playwright show-report
```

لا تُحفظ كلمات المرور داخل الملفات أو GitHub. إذا لم تُعرّف المتغيرات، سيتخطى الاختبار بدل إعطاء نجاح زائف.
