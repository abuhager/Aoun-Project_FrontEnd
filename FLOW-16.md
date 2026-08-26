# Flow 16 — Cross-Cutting Error Handling & Reusability

## الهدف

توحيد تجربة الفشل في الواجهة ومنع تكرار منطق الأخطاء، مع إبقاء عقود الـ API الحالية متوافقة.

## ما تم تطبيقه في الواجهة

- `src/lib/api/apiError.ts` هو المصدر الوحيد لتطبيع رسالة الخطأ، `code`، `status` و`requestId`.
- `RequestState` يعالج حالات التحميل والخطأ والفراغ، ويقدم زر إعادة المحاولة ورقم تتبع قابل للإرسال للدعم.
- `error.tsx` يعالج أخطاء المسار ويستخدم `reset()` من Next.js.
- `global-error.tsx` هو آخر خط دفاع، ويعمل بتنسيق inline حتى لو فشل الـ Root Layout أو CSS.
- `not-found.tsx` يقدم مخرجاً واضحاً للروابط غير الموجودة.
- صفحة طلبات التبرع تستخدم المكوّن المشترك، وتلغي الطلب السابق عند تغيّر الفلاتر، ولا تحول الإلغاء إلى رسالة خطأ.
- رسائل الاستثناءات التقنية لا تُعرض للمستخدم؛ يظهر فقط نص آمن مع `requestId/digest` عند توفره.

## قواعد إعادة الاستخدام

1. كل استدعاء API يمر من `src/lib/api`.
2. كل `catch` يحتاج رسالة مستخدم يستعمل `normalizeApiError` أو `extractErrorMsg`.
3. القوائم القابلة لإعادة المحاولة تستعمل `RequestState`.
4. لا تخزن Access Token في `localStorage`، ولا تغيّر صفحات المصادقة ضمن هذا التدفق.
5. يحتفظ الـ Backend بالتوافق عبر الحقلين `message` و`msg`.

## التحقق

يشغّل:

```bash
npm test
npm run typecheck
npm run build
```

ويغطي `test/cross-cutting-error-reusability-flow.test.mjs` سلامة الصفحة، المكوّن المشترك، وحدود أخطاء Next.
