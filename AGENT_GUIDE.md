# دليل الوكيل (AGENT_GUIDE.md) — BH-AEP

**يجب قراءة هذا الملف بالكامل + `TASKS.md` قبل كتابة أي كود.**
هذا الملف مرجع تنفيذي يكمّل `PRD.md` و`implementation_plan.md` (اللي بيجاوبوا على "إيه المطلوب") بإجابة على "إزاي نبنيه بشكل متسق عبر جلسات/وكلاء متعددين".

---

## 0. ترتيب القراءة الإلزامي لأي وكيل جديد يبدأ شغل

1. `PRD.md` — فهم المنتج والنطاق.
2. `implementation_plan.md` — الـ ERD الكامل والمعمارية.
3. `TASKS.md` — إيه اللي خلص فعليًا وإيه لسه، وابدأ من أول بند غير مكتمل بالترتيب.
4. هذا الملف (`AGENT_GUIDE.md`) — القواعد اللي تحكم إزاي تُكتب كل حاجة.

**بعد الانتهاء من أي بند، حدّث `TASKS.md` فورًا** (علّم البند ✅ واكتب تاريخ/ملاحظة مختصرة). لا تنتقل لبند تالٍ قبل ما تحدّث الملف — هذا هو العقد الوحيد اللي بيخلي جلسة تانية (أو وكيل تاني) يعرف يكمل من غير ما يكرر شغل أو يتعارض معاه.

---

## 1. قواعد كود ثابتة (Conventions)

### التسمية
- **Entities/Classes (C#):** PascalCase — `AssetTransferService`.
- **API Routes:** kebab-case بالإنجليزية تحت `/api/v1/` — `/api/v1/assets`, `/api/v1/assets/{id}/transfers`.
- **React Components:** PascalCase مطابق لاسم الملف — `AssetDetailsPage.tsx`.
- **DB Columns:** PascalCase مطابق تمامًا لأسماء الـ ERD في `implementation_plan.md` — لا يُغيَّر أي اسم عمود عن الموثّق هناك بدون تحديث الخطة أولًا.

### شكل استجابة الـ API (موحّد لكل الـ Endpoints)
```json
// نجاح
{ "success": true, "data": { ... }, "meta": { "page": 1, "pageSize": 20, "total": 137 } }

// خطأ
{ "success": false, "error": { "code": "ASSET_NOT_FOUND", "message": "الأصل غير موجود", "details": null } }
```
- أكواد الأخطاء بالإنجليزية (SCREAMING_SNAKE_CASE)، أما `message` فبالعربية (تُعرض مباشرة في الواجهة).
- Pagination: query params `page` (افتراضي 1) و`pageSize` (افتراضي 20، أقصى 100).

### التعامل مع الحذف والحالات
- لا تُنفَّذ أي عملية `DELETE` فعلية على Lookup tables أو Assets — دائمًا Soft Delete (`IsDeleted=1`) عبر `PATCH`.
- أي Query افتراضي (بدون فلتر صريح) يستبعد `IsDeleted=1` وكذلك `Status=مُخرَّد` للأصول (راجع قسم "3 حالات مستقلة" في `implementation_plan.md`).

### الـ Transactions
- أي عملية تلمس أكتر من جدول في خطوة منطقية واحدة (مثال: Transfer يقفل Custody قديم ويفتح جديد ويحدّث Asset) **يجب** أن تكون داخل SQLite Transaction واحدة — لا يُسمح بنجاح جزئي.

### الاختبار اليدوي بدل Unit Tests
بما إن `implementation_plan.md` بيحدد "لا Unit Tests في v1.0"، كل Feature لازم يترفق بخطوات اختبار يدوي مختصرة (2-4 خطوات) في الـ commit message أو في `TASKS.md` نفسه، بدل الاعتماد على الذاكرة.

---

## 2. عقد الـ API (Endpoints الأساسية)

هذه القائمة **إلزامية الأسماء** — أي Endpoint جديد غير مذكور هنا يُضاف هنا فور إنشائه (حتى يبقى الملف مرجعًا حيًا).

### Auth
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/change-password`

### Assets
- `GET /api/v1/assets` (فلاتر: code, name, categoryId, departmentId, locationId, status, custodianId, serialNumber, plateNumber)
- `GET /api/v1/assets/{id}`
- `POST /api/v1/assets`
- `PATCH /api/v1/assets/{id}`
- `GET /api/v1/assets/{id}/history` — سجل التعديلات (Admin فقط)
- `POST /api/v1/assets/{id}/scrap`

### Custody & Transfers
- `POST /api/v1/assets/{id}/custody` — منح عهدة جديدة (فردية أو إدارية عامة)
- `POST /api/v1/assets/{id}/return-to-warehouse` — إرجاع للمخزن
- `POST /api/v1/assets/{id}/transfer` — نقل فردي (يُنشئ Custody جديد ويقفل القديم تلقائيًا)
- `POST /api/v1/assets/bulk-transfer` — نقل جماعي (يستبعد الأصول الموزّعة تلقائيًا من نتيجة الاختيار)
- `POST /api/v1/assets/{id}/consolidate-custody` — "توحيد العهدة" للأصل الموزّع

### Vehicles
- `PATCH /api/v1/vehicles/{id}` — تعديل بيانات المركبة (يُفعِّل منطق `VehiclePlateHistory`/`VehicleEngineHistory` تلقائيًا عند تغيّر القيمة)
- `GET /api/v1/vehicles/{id}/plate-history` (Admin فقط)
- `GET /api/v1/vehicles/{id}/engine-history` (Admin فقط)

### Inventory
- `POST /api/v1/inventory-campaigns`
- `POST /api/v1/inventory-campaigns/{id}/items/{assetId}/check` — تسجيل موجود/غير موجود

### Employees & Org Structure
- `GET/POST/PATCH /api/v1/employees`
- `POST /api/v1/employees/{id}/deactivate` — يطلب `replacementEmployeeId` لنقل العهدة
- `GET/POST/PATCH /api/v1/departments` (شجرية)

### Reports & Notifications
- `POST /api/v1/reports/query` — Report Builder (body: أعمدة + فلاتر + تجميع)
- `GET /api/v1/notifications` (فلتر Status=Open/Resolved)
- `POST /api/v1/notifications/{id}/resolve`

### Admin
- `POST /api/v1/admin/backup/run` / `POST /api/v1/admin/backup/restore`
- `POST /api/v1/admin/import/assets` — استيراد Excel (يفهم أعمدة GroupRef/IsPrimary)
- `POST/DELETE /api/v1/admin/temporary-permissions`

---

## 3. مواصفات الشاشات على مستوى الحقول (نموذج + أمثلة)

استخدم نفس الشكل ده لأي شاشة جديدة قبل بناء الـ UI بتاعها، واحفظه في `TASKS.md` أو كتعليق فوق الكومبوننت.

**الشكل القياسي:** `الحقل | النوع | إلزامي؟ | مصدره/ملاحظة`

### مثال 1: فورم "إضافة أصل جديد"
| الحقل | النوع | إلزامي | ملاحظة |
|---|---|:-:|---|
| التصنيف الرئيسي | Select (شجري) | ✅ | من Categories |
| التصنيف الفرعي | Select (يعتمد على الرئيسي) | ✅ | |
| اسم الصنف | Text | ✅ | حر، وصف تفصيلي |
| الماركة/الموديل | Text | ❌ | |
| الرقم المسلسل | Text | ❌ | |
| تاريخ الشراء | Date | ✅ | |
| قيمة الشراء | Number | ✅ | |
| المورد | Select + "إضافة جديد" | ❌ | |
| الإدارة الفرعية | Select (شجري، ورقة أخيرة فقط) | ✅ | |
| مكان التواجد | Select (شجري) | ✅ | |
| رقم/تاريخ الفحص | Text/Date | ❌ | |
| هل مركبة؟ | Toggle | ✅ | لو نعم → يفتح قسم بيانات المركبة |
| — بيانات المركبة (لو IsVehicle) — | | | |
| رقم اللوحة | Text | ✅ | Validation تفرد فوري (Async) |
| رقم الشاسيه | Text | ✅ | Validation تفرد فوري |
| رقم الموتور | Text | ❌ | Validation تفرد فوري |
| صورة الأصل / فاتورة | File Upload | ❌ | حتى 20MB |

### مثال 2: شاشة "تفاصيل الأصل" — الأقسام المطلوبة
1. رأس الصفحة: كود الأصل (AST-XXXXXX) + الحالة (Badge ملوّن) + زرار طباعة QR
2. بيانات أساسية (كل حقول الإضافة أعلاه، Read-only ما لم يُضغط "تعديل")
3. **قسم العهدة:** لو عهدة عادية → إدارة/موظف واحد. **لو أصل موزّع** → جدول: (الإدارة | الموظف | وصف القطعة | IsPrimary) + زرار "توحيد العهدة"
4. المرفقات (تابات: صور / فواتير / مستندات)
5. المشتملات (جدول + إضافة من المكتبة)
6. تاريخ العمليات على هذا الأصل تحديدًا (نقل/عهدة/جرد) — مرئي للجميع؛ "سجل التعديلات الكامل" (Before/After) رابط منفصل Admin فقط

### باقي الشاشات
طبّق نفس المنهجية (جدول حقول + قائمة أقسام) لكل شاشة من الـ 26 قبل بنائها، واحفظها كملاحظة في `TASKS.md` بجانب البند.

---

## 4. تنبيهات معمارية لا يجب تجاوزها (ملخص تنفيذي سريع)

هذه القواعد اتكشفت بعد نقاش طويل ومكلفة لو اتنسيت — راجعها دايمًا قبل تنفيذ الموديول المرتبط:

- `Assets.CustodianId`/`DepartmentId`/`LocationId` **لا تُكتب مباشرة أبدًا** — تُشتق فقط من آخر Custody/Transfer، أو تبقى NULL لو الأصل موزّع.
- عملية Transfer الفردية = Custody جديد + إقفال القديم، **في نفس الـ Transaction**.
- Custody يُسمح بتعدد السجلات النشطة **فقط** في حالة الأصل الموزّع — أي حالة تانية يجب أن يكون عندها سجل نشط واحد بالضبط.
- Validation منع Custody/Transfer لأصل `مُخرَّد` أو `مفقود` — يُنفَّذ على مستوى الـ Command Handler، مش على الـ UI بس.
- `AssetCode`/`PlateNumber`/`EngineNumber` بعد الحرق (Soft Delete حقيقي أو تخريد) **لا تُعاد أبدًا** لكيان مختلف — تحقق التفرد يشمل الجداول التاريخية.
- Employees منفصل تمامًا عن Users — لا تربط أي FK عهدة بجدول Users بالغلط.
- Categories وDepartments شجريتين (ParentId) — لا تُنشأ كحقل TEXT مسطّح.
