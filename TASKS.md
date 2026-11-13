# TASKS.md — متتبّع تقدّم تنفيذ BH-AEP

**التعليمات:** بعد إنجاز أي بند، غيّر ❌ إلى ✅ وأضف تاريخ اليوم + جملة قصيرة عن أي قرار تنفيذي اتخذته أثناء العمل عليه (لو حصل). لا تحذف بنودًا. لو اكتشفت بند ناقص من الخطة أثناء التنفيذ، أضفه هنا فورًا تحت القسم المناسب بدل تجاهله.

آخر تحديث: 2026-11-13 (تفعيل صفحات الوحدات التجريبية والتحقق من التجاوب)

---

## المرحلة 1: الهيكل الأساسي (Backend)
- ❌ إنشاء .NET Solution (4 Projects)
- ❌ Domain Entities كاملة (شاملة Employees, Notifications, OrgStructureHistory, VehiclePlateHistory, VehicleEngineHistory)
- ❌ AppDbContext + Migration أولى شاملة
- ❌ تفعيل WAL + Retry Policy
- ❌ إعداد Windows Service
- ❌ Hangfire + Hangfire.Storage.SQLite

## المرحلة 2: Application Layer
- ❌ Interfaces لكل Repository
- ❌ Commands/Queries/Handlers: Assets (CRUD)
- ❌ Handler: منح عهدة (فردية / إدارية عامة)
- ❌ Handler: Transfer (منطق Custody جديد + إقفال قديم في Transaction واحدة)
- ❌ Handler: Return-to-Warehouse
- ❌ Handler: Bulk Transfer (استبعاد الأصول الموزّعة)
- ❌ Handler: Consolidate Custody (توحيد العهدة)
- ❌ Validation: منع Custody/Transfer لأصل مُخرَّد/مفقود
- ❌ Validation: تفرد AssetCode/PlateNumber/EngineNumber الدائم (شامل الجداول التاريخية)
- ❌ DTOs + FluentValidation لكل Feature

## المرحلة 3: Infrastructure Layer
- ❌ Repository Implementations
- ❌ File Storage Service
- ❌ QR Code Service
- ❌ PDF Service (Report Export + بطاقة QR)
- ❌ Excel Import Service (يدعم GroupRef/IsPrimary، Continue-on-error، ErrorLog)
- ❌ Backup Service (أسبوعي خميس 10م، DB+مرفقات) + Restore
- ❌ Archival Job (AuditLogs/Notifications بعد سنتين)
- ❌ Notification Engine (فحص لحظي + Job دوري)
- ❌ Serilog Technical Log

## المرحلة 4: Web Layer (API)
- ❌ Auth Controllers + Single Session enforcement + Idle Timeout
- ❌ Authorization (Role-based + TemporaryPermissions)
- ❌ Assets/Custody/Transfer/Vehicles Controllers
- ❌ Inventory/Scrap/Employees/Departments Controllers
- ❌ Reports Controller (Report Builder query engine)
- ❌ Notifications Controller
- ❌ Admin Controllers (Backup/Restore/Import/TemporaryPermissions)
- ❌ Error Handling Middleware (شكل الاستجابة الموحّد)
- ❌ HTTPS + Swagger

## المرحلة 5: Frontend (React)
- ❌ إعداد المشروع (AntD + TanStack Query + Zustand + RTL)
- ❌ Layout + Navigation + Dark/Light + Idle Timeout handler — 2026-11-13: تخطيط RTL والتنقل جاهزان، وتم تهذيب ألوان المظهر وتكبير النصوص وتوحيد الأرقام المعروضة إلى أرقام غربية؛ Idle Timeout لم يُنفّذ لعدم وجود مصادقة بعد.
- ❌ Login + Force Password Change
- ✅ Dashboard (Admin only) — 2026-11-13: لوحة تحكم أولية مرتبطة ببيانات JSON تجريبية.
- ✅ قائمة الأصول + الفلاتر السريعة — 2026-11-13: قائمة قابلة للبحث والتصفية والتصدير؛ التكامل مع API الحقيقي مؤجل.
- ✅ تفاصيل الأصل (شامل قسم العهدة الموزّعة + زرار توحيد العهدة) — 2026-11-13: شاشة مستقلة بتبويبات البيانات والعهدة والسجل والمرفقات وتاريخ المركبة؛ عمليات العهدة والمرفقات وQR ما زالت واجهات تجريبية.
- ✅ إضافة/تعديل أصل (+ قسم المركبة الشرطي) — 2026-11-13: شاشة مستقلة والتحقق من الحقول المطلوبة؛ تغيير اللوحة أو المحرك يتطلب سببًا. الحفظ داخل الجلسة فقط حتى جاهزية API.
- ❌ سجل تعديلات الأصل (Admin)
- ✅ سجل العُهد / نقل فردي / نقل جماعي / إرجاع للمخزن — 2026-11-13: تبويبات وصفحات تفاعلية تجريبية؛ التغييرات داخل الجلسة ولا تنفذ عمليات API.
- ✅ السجل التاريخي للنقل (Admin) — 2026-11-13: شاشة سجل تجريبية؛ الصلاحيات والتدقيق الخلفي غير منفذين.
- ✅ مكتبة المشتملات — 2026-11-13: شاشة وقائمة تجريبية محمّلة من JSON.
- ✅ إدارة حملات الجرد + تنفيذ الجرد (Responsive) + السجل التاريخي (Admin) — 2026-11-13: الشاشات والتبويبات التجريبية متجاوبة؛ المسح ومطابقة الأصول غير متصلين بخدمة.
- ✅ طلب تخريد + السجل التاريخي (Admin) — 2026-11-13: الشاشات والتبويبات التجريبية متاحة؛ الموافقات والتخريد الفعلي غير منفذين.
- ✅ Report Builder — 2026-11-13: فلاتر ومعاينة وتصدير CSV لبيانات العرض التجريبية.
- ✅ شاشة التنبيهات (Admin + تفويض) — 2026-11-13: عرض وتغيير حالة القراءة تجريبيًا؛ التفويض وإرسال التنبيهات غير منفذين.
- ✅ إدارة المستخدمين + التفويض المؤقت — 2026-11-13: تبويبات إدارة تجريبية؛ الحسابات والصلاحيات غير مرتبطة بخدمة مصادقة.
- ✅ إدارة الموظفين والعهدة بالإدارات — 2026-11-13: صفحات الموظفين والإدارات تجريبية ومحملة من JSON.
- ✅ البيانات المرجعية (تاب واحد: فئات/إدارات/مواقع/موردين) — 2026-11-13: تبويبات الفئات والمواقع والموردين ضمن شاشة الإدارة، والإدارات ضمن شاشة الموظفين؛ البيانات تجريبية.
- 🟡 Audit Log + سجل الهيكل التنظيمي — 2026-11-13: تبويب سجل التدقيق وبيانات الإدارات ظاهرة تجريبيًا؛ سجل تغيّر الهيكل التنظيمي غير منفذ.
- 🟡 النسخ الاحتياطي/الاستعادة + استيراد Excel وسجله + الإعدادات — 2026-11-13: تبويبات الواجهة موجودة؛ النسخ والاستعادة ومعالجة ملفات Excel وسجل الاستيراد غير منفذة.
- 🟡 تاب سجل تغييرات اللوحة/الموتور (داخل تفاصيل المركبة، Admin) — 2026-11-13: تاريخ المركبة ظاهر ضمن التفاصيل؛ سجل تغييرات مستقل بصلاحيات Admin غير مكتمل.

## المرحلة 6: النشر
- ❌ Deploy.ps1 (شامل بذر حساب Admin الافتراضي)
- ❌ شهادة SSL self-signed على 5001
- ❌ ServerBaseUrl في appsettings.json
- ❌ أيقونة Desktop (Chrome/Edge App Mode)
- ❌ سكريبت طوارئ استعادة باسورد الادمن
- ❌ فتح المنفذين 5000/5001

## بيانات الإطلاق
- ✅ نموذج استيراد الإكسيل جاهز (`نموذج_استيراد_الاصول.xlsx`)
- ✅ الملف الحقيقي (~4790 صف) رُوجع وجُهّز (`الاصول_جاهز_للاستيراد.xlsx`) — يحتوي GroupRef/IsPrimary لـ 5 مجموعات موزّعة، وبيانات 117 مركبة مستخرجة

## اختبارات القبول النهائية (راجع "خطة التحقق" في implementation_plan.md)
- ❌ كل بنود قسم Manual في implementation_plan.md تم تنفيذها والتأكد منها يدويًا واحدًا واحدًا
