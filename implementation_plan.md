# BH Assets Enterprise Platform (BH-AEP) v2.2 — خطة التنفيذ النهائية

## نظرة عامة

منظومة إدارة أصول ثابتة تعمل كـ Windows Service على شبكة LAN الداخلية، مبنية بـ ASP.NET Core 8 + React + SQLite، مع واجهة عربية RTL كاملة. **v2.2 نسخة معتمدة بعد مراجعة معمارية شاملة عبر عدة جولات نقاش ومراجعة كاملة للبيانات التاريخية الحقيقية**، وتصحّح فجوات جوهرية في v1.4 (أهمها: فصل مستخدمي النظام عن حاملي العهدة، وجعل الإدارات شجرية، وربط النقل بالعهدة تلقائيًا)، وتضيف على v2.1 ميزة **تتبع تغيير رقم اللوحة ورقم الموتور** التي طلعت من واقع تشغيل المركبات الفعلي.

---

## ملخص القرارات النهائية (محدّث بالكامل — v2.0)

| العنصر | القرار |
|--------|--------|
| **Backend Architecture** | Clean Architecture: 4 Projects (Domain / Application / Infrastructure / Web) |
| **Frontend** | React + TypeScript داخل `ClientApp/` |
| **State Management** | TanStack Query (Server State) + Zustand (Client State) |
| **UI Components** | Ant Design (AntD) — RTL + Enterprise |
| **Charts** | Recharts |
| **Authentication** | JWT في localStorage — صلاحية 60 دقيقة + Refresh Token؛ **جلسة واحدة فقط لكل مستخدم** (دخول من جهاز جديد يقفل القديمة تلقائيًا)؛ Idle Timeout 30 دقيقة |
| **Transport Security** | HTTPS إجباري (شهادة self-signed محلية، بورت 5001) + إعادة توجيه تلقائي من HTTP؛ تحذير المتصفح يُقبل كما هو بدون توزيع/تثبيت الشهادة على الأجهزة |
| **Asset Code Format** | `AST-000001` (تسلسل 6 خانات) — **Prefix اتغير من BH إلى AST**؛ الكود يُحرق نهائيًا بعد أي Soft Delete ولا يُعاد استخدامه |
| **QR Code Content** | رابط بعنوان السيرفر الفعلي، قابل للتهيئة عبر `appsettings.json`؛ زر العرض/الطباعة جزء من شاشة تفاصيل الأصل مباشرة (لا شاشة مستقلة) |
| **Attachments Schema** | جداول منفصلة: AssetImages / AssetInvoices / AssetDocuments |
| **Print / PDF** | طباعة مباشرة من المتصفح + Export PDF من الخادم (QuestPDF) — نطاق v1.0: تصدير Report Builder + بطاقة QR فقط |
| **Max Attachment Size** | 20MB لكل ملف |
| **Log Rotation Job** | Hangfire (Cron شهري) |
| **Background Jobs Storage** | Hangfire.Storage.SQLite |
| **Dashboard** | شاشة واحدة **حصرية للادمن فقط** — إحصائيات احترافية + Pie Chart للحالات + آخر العمليات؛ مسؤول الأصول/المشاهد صفحتهم الرئيسية هي قائمة الأصول مباشرة |
| **Search** | فلاتر سريعة: الكود / الاسم / الفئة / الإدارة / الموقع / الحالة / العهدة الحالية / السيريال / رقم اللوحة؛ + **Report Builder مرن كامل** (اختيار أعمدة + فلاتر + تصدير) |
| **Language** | عربية فقط — RTL؛ التقويم ميلادي فقط |
| **Theme** | Light + Dark Mode مع زر تبديل |
| **Migrations** | Migration أولى واحدة تُنشئ كل الجداول دفعة واحدة |
| **Audit Log** | كل العمليات + Before/After؛ **أرشفة/حذف تلقائي بعد سنتين** |
| **Technical Log** | ملف Log يومي منفصل (Serilog) للأخطاء التقنية، بمعزل عن Audit Log |
| **Delete Policy** | 3 حالات مستقلة للأصل: نشط / **مُخرَّد** (منفصل تمامًا عن الأصول النشطة) / **Soft Deleted فعليًا** (IsDeleted، لتصحيح أخطاء الإدخال) |
| **Backup** | **أسبوعي كل خميس 10 مساءً** (قاعدة البيانات + مجلد المرفقات معًا) + زر يدوي + **زر Restore** — احتفاظ 30 يوم |
| **Password Policy** | حد أدنى 8 حروف |
| **Account Lockout** | 5 محاولات خاطئة → قفل 15 دقيقة |
| **أول تشغيل** | حساب Admin افتراضي جاهز (username/password مؤقتة) + إجبار تغيير الباسورد أول دخول |
| **طوارئ نسيان الباسورد** | سكريبت طوارئ يشتغل من على السيرفر مباشرة (مش من المتصفح) لعمل Reset لباسورد أول Admin |
| **Unit Tests** | لا في v1.0 |
| **Asset Statuses** | نشط / تحت الصيانة / مخزن / مُخرَّد / مفقود / مُعلَّق |
| **Vehicle Data** | جدول `VehicleDetails` منفصل، `ChassisNumber` بـ UNIQUE ثابت مدى العمر؛ `PlateNumber`/`EngineNumber` قابلان للتغيير مع تتبع تاريخي كامل (راجع قسم "تتبع تغيير رقم اللوحة والموتور") + حقل حالة استلام (جديد/تعمل) |
| **Employees (جديد)** | جدول منفصل تمامًا عن `Users` لحاملي العهدة الفعليين (مئات الموظفين، بدون حساب دخول) |
| **Departments (معدّل)** | شجرية (قطاع ← إدارة فرعية)، مرنة (يمكن نقل إدارة بين قطاعات) |
| **Categories (معدّل)** | شجرية بمستويين: تصنيف رئيسي ← تصنيف فرعي؛ **10 تصنيفات رئيسية معتمدة** (شاملة "معدات أمن وسلامة" كتصنيف مستقل بجانب "أنظمة المراقبة والأمان") |
| **العهدة الموزّعة (جديد)** | أصل بكود واحد يمكن أن يكون له أكثر من سجل Custody نشط في نفس الوقت (موزّع على أكتر من إدارة و/أو أكتر من موظف)؛ راجع قسم "العهدة الموزّعة" أدناه |
| **Execution Order** | Backend أولاً (Domain→Application→Infrastructure→Web)، ثم Frontend |

---

## هيكل المشروع

```
BH-AEP\
├── BH-AEP.sln
├── src/
│   ├── BH-AEP.Domain/          ← Entities, Enums, Value Objects, Domain Events
│   ├── BH-AEP.Application/     ← Interfaces, DTOs, Commands, Queries, Handlers
│   ├── BH-AEP.Infrastructure/  ← EF Core, Repositories, SQLite, File Storage, Hangfire
│   └── BH-AEP.Web/             ← ASP.NET Core 8, Controllers, Middleware, ClientApp/
│       └── ClientApp/          ← React + TypeScript + AntD + TanStack Query + Zustand
├── Deploy.ps1
├── tools/
│   └── ResetAdminPassword/     ← سكريبت الطوارئ (يشتغل على السيرفر مباشرة)
└── README.md
```

---

## قاعدة البيانات — ERD الكامل (v2.0)

### Users (حسابات دخول المنصة — 3-5 حسابات فقط)
| العمود | النوع | ملاحظات |
|--------|-------|---------|
| Id | INTEGER PK | |
| Username | TEXT UNIQUE | |
| PasswordHash | TEXT | bcrypt |
| Role | TEXT | Admin / AssetManager / Viewer |
| ForcePasswordChange | INTEGER | 0/1 |
| IsLocked | INTEGER | 0/1 |
| FailedLoginAttempts | INTEGER | |
| LockedUntil | TEXT | |
| CurrentSessionToken | TEXT | لتطبيق سياسة الجلسة الواحدة |
| IsDeleted | INTEGER | |
| CreatedAt | TEXT | |

### TemporaryPermissions
| العمود | النوع |
|--------|-------|
| Id | INTEGER PK |
| UserId | FK → Users |
| Permission | TEXT |
| GrantedBy | FK → Users |
| StartsAt | TEXT |
| EndsAt | TEXT |
| IsRevoked | INTEGER |

### Employees (جديد — حاملو العهدة الفعليون، بدون حساب دخول)
| العمود | النوع | ملاحظات |
|--------|-------|---------|
| Id | INTEGER PK | |
| FullName | TEXT | |
| NationalId | TEXT UNIQUE | |
| JobTitle | TEXT | |
| DepartmentId | FK → Departments | |
| IsDeleted | INTEGER | Soft Delete/إيقاف عند ترك الشركة |
| CreatedAt | TEXT | |

### Departments (معدّل — شجرية، قطاع ← إدارة)
| العمود | النوع |
|--------|-------|
| Id | INTEGER PK |
| Name | TEXT |
| ParentId | FK (self) — nullable لمستوى القطاع الرئيسي |
| IsDeleted | INTEGER |

### Categories (معدّل — رئيسي ← فرعي)
| العمود | النوع |
|--------|-------|
| Id | INTEGER PK |
| Name | TEXT |
| ParentId | FK (self) |
| IsDeleted | INTEGER |

### Locations (شجرية — بدون تغيير)
| العمود | النوع |
|--------|-------|
| Id | INTEGER PK |
| Name | TEXT |
| ParentId | FK (self) |
| IsDeleted | INTEGER |

### Suppliers
| العمود | النوع |
|--------|-------|
| Id | INTEGER PK |
| Name | TEXT |
| ContactInfo | TEXT |
| IsDeleted | INTEGER |

### Assets (الجدول الرئيسي — معدّل بالكامل)
| العمود | النوع | ملاحظات |
|--------|-------|---------|
| Id | INTEGER PK | |
| AssetCode | TEXT UNIQUE | `AST-000001`، يُحرق نهائيًا بعد Soft Delete |
| Name | TEXT | اسم تفصيلي حر (بجانب التصنيف الفرعي) |
| CategoryId | FK → Categories | تصنيف فرعي |
| Brand | TEXT | |
| Model | TEXT | |
| SerialNumber | TEXT | |
| PurchaseDate | TEXT | |
| PurchaseValue | REAL | مخفية عن دور "مشاهد" في Report Builder إلا بتفويض |
| SupplierId | FK → Suppliers | |
| LocationId | FK → Locations | مستوى الورقة الأخيرة؛ **NULL لو الأصل موزّع على أكتر من موقع** |
| DepartmentId | FK → Departments | مستوى الورقة الأخيرة (إدارة فرعية) — **مُشتق تلقائيًا من آخر Transfer، أو NULL لو فيه أكتر من سجل Custody نشط في نفس الوقت (أصل موزّع)** |
| CustodianId | FK → Employees (nullable) | **مُشتق تلقائيًا (Read-only) من آخر سجل مفتوح في Custodies، أو NULL لو الأصل موزّع** |
| CustodyType | TEXT | Individual (فردي) / DepartmentGeneral (إداري عام) |
| Status | TEXT | نشط/تحت الصيانة/مخزن/مُخرَّد/مفقود/مُعلَّق — مستقلة تمامًا عن IsDeleted |
| Notes | TEXT | |
| InspectionNumber | TEXT | |
| InspectionDate | TEXT | |
| IsDeleted | INTEGER | Soft Delete (لتصحيح أخطاء الإدخال فقط، منفصل عن Status=مُخرَّد) |
| CreatedAt | TEXT | |
| UpdatedAt | TEXT | |
| IsVehicle | INTEGER | 0/1 |

> **Validation إلزامي:** ممنوع تسجيل Custody أو Transfer جديد لأصل حالته `مُخرَّد` أو `مفقود`.
> **Validation إلزامي:** الأصول بحالة `مُخرَّد` تُستبعد تلقائيًا من كل الاستعلامات الافتراضية (القوائم، الداشبورد، Report Builder) وتظهر فقط في سجل التخريد التاريخي.
> **الأصل الموزّع:** يظهر في قائمة الأصول لكل الإدارات المشاركة فيه (مش الإدارة الأساسية بس)، ويُستثنى تلقائيًا من تنبيه "بيانات ناقصة" (إدارة غير محددة) ومن شاشة النقل الجماعي. عدد الأصول لكل تصنيف (COUNT) يُحتسب على مستوى الأصل/الكود نفسه دائمًا، وليس على عدد القطع الفيزيائية داخل الأصل الموزّع. حالة الأصل (`Status`) تبقى على مستوى الأصل ككل فقط (لا تُجزّأ لكل قطعة).

### VehicleDetails
| العمود | النوع | ملاحظات |
|--------|-------|---------|
| Id | INTEGER PK | |
| AssetId | FK → Assets UNIQUE | |
| PlateNumber | TEXT UNIQUE | قابل للتغيير — راجع `VehiclePlateHistory` |
| ChassisNumber | TEXT UNIQUE | ثابت مدى عمر المركبة، بدون تتبع تاريخي |
| EngineNumber | TEXT UNIQUE | قابل للتغيير — راجع `VehicleEngineHistory` |
| ManufactureYear | INTEGER | |
| Color | TEXT | |
| FuelType | TEXT | |
| LicenseExpiryDate | TEXT | مصدر تنبيه انتهاء الرخصة (فترتين: مبكر + إلحاح) |
| ConditionOnReceipt | TEXT | جديد / تعمل — منفصل عن Status العام |

### VehiclePlateHistory (جديد)
| العمود | النوع | ملاحظات |
|--------|-------|---------|
| Id | INTEGER PK | |
| VehicleDetailsId | FK → VehicleDetails | |
| OldPlateNumber | TEXT | |
| NewPlateNumber | TEXT | |
| Reason | TEXT **NOT NULL** | إلزامي دائمًا (يُكتب فقط عند تغيّر القيمة فعليًا) |
| ChangedBy | FK → Users | |
| ChangedAt | TEXT | |

### VehicleEngineHistory (جديد — نفس بنية VehiclePlateHistory بالضبط)
| العمود | النوع | ملاحظات |
|--------|-------|---------|
| Id | INTEGER PK | |
| VehicleDetailsId | FK → VehicleDetails | |
| OldEngineNumber | TEXT | |
| NewEngineNumber | TEXT | |
| Reason | TEXT **NOT NULL** | |
| ChangedBy | FK → Users | |
| ChangedAt | TEXT | |

> **قواعد مشتركة لكلا الجدولين (تسري بنفس المنطق على اللوحة والموتور):**
> - **صلاحية التعديل:** مسؤول الأصول (صلاحية عادية ضمن تعديل بيانات المركبة، بدون تفويض خاص). **مراجعة السجل التاريخي:** حصرية للادمن فقط.
> - **الفورم:** حقل `Reason` يظهر إلزاميًا فقط لو القيمة الفعلية اتغيّرت عن الأصل وقت الحفظ (Validation ذكي، مش إجباري على كل حفظ).
> - **التفرد الدائم:** أي قيمة (حالية في `VehicleDetails` أو تاريخية في جدول الـ History) لا يمكن إعادة استخدامها لمركبة **مختلفة** أبدًا، حتى بعد تخريدها فعليًا. الاستثناء الوحيد: الرجوع لقيمة قديمة **لنفس المركبة** (تصحيح خطأ كتابة) — الـ Validation يستثني سجلات نفس `VehicleDetailsId` من فحص التكرار.
> - **حرق القيمة نهائيًا:** فقط عند التخريد الفعلي (`Assets.Status = مُخرَّد`). أما Soft Delete بسبب خطأ إدخال (`IsDeleted=1` بدون تخريد حقيقي) فتُعاد القيمة متاحة فورًا لمركبة أخرى.
> - **بداية السجل:** أول قيمة عند إنشاء المركبة (يدويًا أو من الاستيراد التاريخي) تُسجَّل مباشرة في `VehicleDetails` بدون أي سجل في جدول الـ History؛ السجل التاريخي يبدأ فقط من أول تغيير فعلي لاحق.
> - لا تنبيه (Notification) إضافي عند التغيير — السجل التاريخي كافٍ.

### AssetImages / AssetInvoices / AssetDocuments
| العمود | النوع |
|--------|-------|
| Id | INTEGER PK |
| AssetId | FK → Assets |
| OriginalName | TEXT |
| StoredName | TEXT UNIQUE |
| MimeType | TEXT |
| FileSize | INTEGER |
| Sha256 | TEXT |
| UploadedAt | TEXT |
| UploadedBy | FK → Users |

### Accessories (المشتملات)
| العمود | النوع |
|--------|-------|
| Id | INTEGER PK |
| Name | TEXT |
| IsLibraryItem | INTEGER |

### AssetAccessories
| العمود | النوع |
|--------|-------|
| Id | INTEGER PK |
| AssetId | FK → Assets |
| AccessoryId | FK → Accessories |
| Quantity | INTEGER |
| Notes | TEXT |

### Custodies (العهد — معدّل: CustodianId → Employees + يدعم العهدة الموزّعة)
| العمود | النوع | ملاحظات |
|--------|-------|---------|
| Id | INTEGER PK | |
| AssetId | FK → Assets | |
| CustodianId | FK → Employees (nullable) | فاضي لو CustodyType=DepartmentGeneral |
| DepartmentId | FK → Departments | إدارة هذا السجل تحديدًا (قد تختلف عن سجلات أخرى لنفس الأصل) |
| PieceDescription | TEXT (nullable) | وصف حر للجزء/القطعة المشمولة بهذا السجل (زي "الكنبة + 2 كرسي")، يُستخدم فقط في حالة العهدة الموزّعة |
| IsPrimary | INTEGER | يُحدَّد تلقائيًا لأول سجل نشط عند إنشاء عهدة موزّعة؛ لو اتقفل السجل صاحب IsPrimary وفيه سجلات نشطة تانية، الادمن يحدد يدويًا مين ياخد IsPrimary الجديد (مش تلقائي) |
| HandoverDate | TEXT | |
| ReturnDate | TEXT | يُملأ تلقائيًا عند نقل/إرجاع الأصل |
| Notes | TEXT | |
| CreatedBy | FK → Users | مستخدم النظام اللي سجّل العملية |

> حقول الإقرار القانوني (رقم قومي/توقيع/اعتماد مدير) **مؤجلة للمستقبل** — لا تُضاف في v1.0.
> **قاعدة العهدة الموزّعة:** النظام يسمح عادةً بسجل Custody نشط واحد فقط لكل أصل. الاستثناء الوحيد هو "الأصل الموزّع" — عندما يكون الأصل (كود واحد) عبارة عن مجموعة/طقم وصل كوحدة شراء واحدة لكنه موزّع فعليًا بين أكتر من إدارة و/أو أكتر من موظف (حتى لو في نفس الإدارة) في نفس الوقت. في هذه الحالة يُسمح بعدة سجلات Custody نشطة للأصل نفسه، كل سجل بإدارته/موظفه/وصف قطعته الخاصة.
> **القيمة المالية:** تُحتسب مرة واحدة فقط على سجل الـ Custody صاحب `IsPrimary=true` في التقارير المجمّعة بالإدارة، وتظهر كملاحظة إشارة (بدون احتساب مكرر) في باقي سجلات الإدارات المشاركة.
> **توحيد العهدة:** زرار صريح في شاشة تفاصيل الأصل الموزّع يقفل كل السجلات النشطة ماعدا واحد يختاره الادمن، فيرجع الأصل لوضعه الطبيعي (إدارة واحدة، DepartmentId/CustodianId يُشتقان تلقائيًا من جديد).
> **الجرد:** لأصل موزّع مستهدف بحملة جرد على إدارة معينة، التحقق (IsFound) يكون على مستوى سجل الـ Custody الخاص بتلك الإدارة فقط، وليس على الأصل بالكامل.

### Transfers (النقل — معدّل)
| العمود | النوع |
|--------|-------|
| Id | INTEGER PK |
| AssetId | FK → Assets |
| FromDepartmentId | FK → Departments |
| ToDepartmentId | FK → Departments |
| FromLocationId | FK → Locations |
| ToLocationId | FK → Locations |
| TransferDate | TEXT |
| Reason | TEXT |
| CreatedBy | FK → Users |
| IsBulk | INTEGER | يفرّق النقل الجماعي عن الفردي في السجل التاريخي |

> **منطق إلزامي:** كل عملية Transfer تُنشئ سجل Custody جديد تلقائيًا (فردي أو إداري عام حسب نوع الأصل) وتُقفل سجل Custody القديم (`ReturnDate` = تاريخ النقل) في نفس المعاملة (Transaction).
> **عملية منفصلة "إرجاع للمخزن":** تُقفل Custody الحالي فقط بدون فتح جديد، وتضع `Status = مخزن` و`CustodianId = NULL`.

### InventoryCampaigns (الجرد — معدّل: نطاق بالإدارة)
| العمود | النوع |
|--------|-------|
| Id | INTEGER PK |
| Name | TEXT |
| DepartmentId | FK → Departments (nullable لجرد شامل) |
| StartDate | TEXT |
| EndDate | TEXT | مرن — يمكن الإنهاء قبل الموعد |
| Status | TEXT |
| CreatedBy | FK → Users |

### InventoryItems
| العمود | النوع |
|--------|-------|
| Id | INTEGER PK |
| CampaignId | FK → InventoryCampaigns |
| AssetId | FK → Assets |
| IsFound | INTEGER | false → يفتح تنبيه Notification |
| Notes | TEXT |
| RecordedBy | FK → Users |
| RecordedAt | TEXT |

### ScrapRequests (التخريد — معدّل: بدون بيانات اللجنة)
| العمود | النوع |
|--------|-------|
| Id | INTEGER PK |
| AssetId | FK → Assets |
| Reason | TEXT |
| Decision | TEXT |
| ApprovedBy | FK → Users |
| ApprovedAt | TEXT |
| Status | TEXT |
| CreatedBy | FK → Users |

> حقول `CommitteeHead`/`CommitteeMembers`/`CommitteeProcedures` **أُزيلت** — اللجنة تفضل ورقية بالكامل خارج قاعدة البيانات في v1.0.

### Notifications (جديد)
| العمود | النوع | ملاحظات |
|--------|-------|---------|
| Id | INTEGER PK | |
| Type | TEXT | VehicleLicenseExpiry / InventoryDeadline / FailedLogin / MissingData / InventoryMismatch / ... |
| RelatedEntityType | TEXT | Asset / Vehicle / Campaign / ... |
| RelatedEntityId | INTEGER | |
| Message | TEXT | |
| Status | TEXT | Open / Resolved |
| CreatedAt | TEXT | |
| ResolvedBy | FK → Users (nullable) | |
| ResolvedAt | TEXT (nullable) | |

### OrgStructureHistory (جديد — سجل تغييرات الهيكل التنظيمي)
| العمود | النوع |
|--------|-------|
| Id | INTEGER PK |
| DepartmentId | FK → Departments |
| OldParentId | FK → Departments (nullable) |
| NewParentId | FK → Departments (nullable) |
| ChangedBy | FK → Users |
| ChangedAt | TEXT |

### AuditLogs
| العمود | النوع |
|--------|-------|
| Id | INTEGER PK |
| UserId | FK → Users |
| Action | TEXT |
| EntityType | TEXT |
| EntityId | INTEGER |
| BeforeData | TEXT (JSON) |
| AfterData | TEXT (JSON) |
| Timestamp | TEXT |
| IpAddress | TEXT |

> **سياسة أرشفة:** حذف/أرشفة تلقائي (Hangfire) للسجلات الأقدم من سنتين.

### BackupLogs
| العمود | النوع |
|--------|-------|
| Id | INTEGER PK |
| FileName | TEXT |
| FilePath | TEXT |
| IsSuccess | INTEGER |
| ErrorMessage | TEXT |
| CreatedAt | TEXT |
| CreatedBy | FK → Users (nullable) |
| IsAutomatic | INTEGER |

### ImportBatches (استيراد Excel — لمرة واحدة)
| العمود | النوع |
|--------|-------|
| Id | INTEGER PK |
| FileName | TEXT |
| TotalRows | INTEGER |
| SuccessRows | INTEGER |
| FailedRows | INTEGER |
| ErrorLog | TEXT (JSON) |
| ImportedAt | TEXT |
| ImportedBy | FK → Users |

---

## الأدوار والصلاحيات — تفصيل

- **Admin:** كل الصلاحيات + شاشات حصرية (الداشبورد، إدارة المستخدمين، كل السجلات التاريخية، التنبيهات، إدارة الموظفين، البيانات المرجعية، الاستيراد، النسخ الاحتياطي/الاستعادة، النقل الجماعي).
- **AssetManager (مسؤول أصول):** كل عمليات الأصول اليومية (إضافة/تعديل/نقل/عهدة/جرد/تخريد)، بالإضافة لأي شاشة حصرية يفوّضها الادمن مؤقتًا (TemporaryPermissions بمدة زمنية محددة).
- **Viewer (مشاهد):** عرض فقط، بدون أي تعديل، وبدون رؤية القيمة المالية في Report Builder إلا بتفويض.

---

## الشاشات (26 شاشة)

### الدخول (2)
1. تسجيل الدخول
2. تغيير كلمة المرور الإجباري

### الداشبورد (1 — حصري للادمن)
3. لوحة التحكم الرئيسية

### الأصول (5)
4. قائمة الأصول (بحث/فلترة/ترتيب) — الأصل الموزّع يظهر في قائمة كل الإدارات المشاركة فيه
5. تفاصيل الأصل (شامل QR) — للأصل الموزّع: يعرض كل سجلات العهدة النشطة (إدارة/موظف/وصف القطعة) + زرار "توحيد العهدة"
6. إضافة أصل جديد (+ بيانات المركبة تلقائيًا لو IsVehicle)
7. تعديل أصل / تعديل بيانات المركبة (شامل تغيير رقم اللوحة/الموتور بصلاحية مسؤول الأصول العادية، مع سبب إلزامي عند التغيير الفعلي) — تاب "سجل تغييرات اللوحة والموتور" داخل تفاصيل المركبة حصري للادمن
8. سجل تعديلات الأصل — حصري للادمن

### العهدة والنقل (4)
9. سجل العُهد
10. نقل أصل (فردي) — لأصل موزّع: النقل يتم على مستوى سجل عهدة/قطعة واحدة فقط، من شاشة تفاصيل الأصل
11. نقل جماعي (Bulk Transfer) — حصري للادمن (تفويض متاح)؛ **يستثني الأصول الموزّعة تلقائيًا من قوائم الاختيار**
12. إرجاع أصول للمخزن
13. السجل التاريخي للنقل — حصري للادمن

### المشتملات (1)
14. مكتبة المشتملات

### الجرد (3)
15. إدارة حملات الجرد
16. تنفيذ الجرد (Responsive للموبايل)
17. السجل التاريخي للجرد — حصري للادمن

### التخريد (2)
18. طلب تخريد أصل
19. السجل التاريخي للتخريد — حصري للادمن

### التقارير (1)
20. Report Builder

### التنبيهات (1)
21. التنبيهات — حصري للادمن (تفويض متاح)

### الإدارة (7 — حصري للادمن، تفويض جزئي متاح)
22. إدارة المستخدمين + تفويض الصلاحيات المؤقتة
23. إدارة الموظفين والعهدة بالإدارات
24. البيانات المرجعية (فئات/إدارات/مواقع/موردين — تاب واحد)
25. Audit Log العام + سجل الهيكل التنظيمي
26. النسخ الاحتياطي والاستعادة + استيراد Excel وسجله + الإعدادات العامة

---

## مراحل التنفيذ

### المرحلة 1: الهيكل الأساسي (Backend)
1. إنشاء .NET Solution مع 4 Projects
2. تعريف جميع Domain Entities والـ Enums (شاملة Employees، Notifications، OrgStructureHistory، CustodyType)
3. إعداد AppDbContext + Migration أولى شاملة
4. تفعيل WAL + Retry Policy
5. إعداد Windows Service
6. إعداد Hangfire مع Hangfire.Storage.SQLite

### المرحلة 2: Application Layer
1. تعريف Interfaces (IAssetRepository, IEmployeeRepository, INotificationRepository, ...)
2. Commands/Queries/Handlers لكل Feature — بما فيها منطق:
   - تحديث `Assets.CustodianId`/`DepartmentId`/`LocationId` تلقائيًا (Domain Event عند تسجيل Custody/Transfer)
   - Validation منع Custody/Transfer لأصل مُخرَّد أو مفقود
   - عملية النقل المركّبة (Transfer + Custody جديد + إقفال Custody قديم في معاملة واحدة)
3. DTOs و Validators (FluentValidation)
4. قاعدة عمل: منع الحذف الفعلي لسجلات Lookup المرتبطة بأصول

### المرحلة 3: Infrastructure Layer
1. Repository Implementations
2. File Storage Service (مرفقات)
3. QR Code Service (QRCoder)
4. PDF Service (QuestPDF) — نطاق v1.0: Report Builder Export + بطاقة QR
5. Excel Import Service (EPPlus) — Continue-on-error + ErrorLog JSON
6. Backup Service (أسبوعي خميس 10م، DB + مرفقات) + Restore Service
7. Log Rotation Job + Archival Job (AuditLogs/Notifications بعد سنتين)
8. Notification Engine: فحص لحظي (وقت حفظ الأصل) + Job دوري (Hangfire) لفحص شامل

### المرحلة 4: Web Layer (API)
1. Controllers لكل Feature
2. Authentication Middleware (JWT + Refresh Token + Single Session enforcement)
3. Authorization (Role-based + TemporaryPermissions check)
4. Error Handling Middleware
5. Swagger/OpenAPI
6. HTTPS Middleware
7. Serilog للـ Technical Log اليومي

### المرحلة 5: Frontend (React)
1. إعداد React + TypeScript + AntD + TanStack Query + Zustand
2. تهيئة RTL + i18n
3. Layout + Navigation + Dark/Light Mode + Idle Timeout handler
4. شاشة تسجيل الدخول + Force Password Change
5. Silent Refresh للتوكن
6. Dashboard (حصري للادمن)
7. شاشات الأصول (5 شاشات)
8. شاشات العهدة والنقل (4 شاشات، شاملة النقل الجماعي وإرجاع المخزن)
9. شاشة المشتملات
10. شاشات الجرد (3 شاشات، شاشة التنفيذ Responsive)
11. شاشات التخريد (2 شاشة)
12. Report Builder
13. شاشة التنبيهات
14. شاشات الإدارة (7 شاشات: مستخدمين/موظفين/مرجعية/Audit/نسخ احتياطي/استيراد)
15. استيراد Excel (Upload + Preview + Mapping + Error Report)

### المرحلة 6: النشر
1. Deploy.ps1 الكامل (شامل بذر حساب Admin الافتراضي)
2. توليد/تثبيت شهادة SSL محلية (self-signed) على منفذ 5001
3. ضبط ServerBaseUrl في appsettings.json
4. أيقونة Desktop (Chrome/Edge App Mode) — للسيرفر ولباقي أجهزة الشركة
5. سكريبت الطوارئ لاستعادة باسورد الادمن (يعمل من السيرفر مباشرة)
6. فتح المنفذين 5000 (Redirect) و5001 (HTTPS)

---

## نموذج استيراد البيانات التاريخية

ملف `نموذج_استيراد_الاصول.xlsx` (منفصل) جاهز ويحتوي:
- شيت تعليمات
- شيت قوائم مرجعية (10 تصنيفات رئيسية × تصنيفاتها الفرعية المعتمدة، الحالات، نعم/لا)
- شيت بيانات الأصول (مع Data Validation Dropdowns) — بالإضافة لعمودين للعهدة الموزّعة:
  - **GroupRef**: رقم تجميع مشترك لكل الصفوف التي تمثل نفس الأصل الموزّع (مثال: `GRP-001`)؛ فارغ للأصول العادية غير الموزّعة
  - **IsPrimary**: "نعم" لأول صف في المجموعة (الإدارة الأساسية التي تُحتسب عليها القيمة المالية)، "لا" للباقي
  - صفوف بنفس GroupRef تتحول وقت الاستيراد إلى: سجل Asset واحد + عدة سجلات Custody (واحد لكل صف)
- شيت بيانات المركبات (مربوط بالرقم المسلسل/كود الأصل)، ويُملأ تلقائيًا حيث أمكن استخراج رقم اللوحة من اسم الصنف

تم تطبيق هذه الآلية بنجاح على الملف الحقيقي الكامل (~4790 صف): 5 مجموعات عهدة موزّعة (`GRP-001` إلى `GRP-005`)، و117 من 119 مركبة تم استخراج رقم لوحتها تلقائيًا (استثناءان بلا رقم لوحة أُبقيا تحت تصنيف "المركبات" كما هما بقرار من صاحب المشروع).

---

## نقاط مفتوحة (Backlog مستقبلي — لا تحتاج إجابة الآن)

> [!NOTE]
> شعار الشركة (Logo) placeholder احترافي في v1.0، قابل للاستبدال لاحقًا.

> [!NOTE]
> الإهلاك، الضمان، محرّك القوالب، طباعة النماذج الرسمية رقميًا، تنبيه النقل بدون اعتماد، العمل أوفلاين، طباعة ملصقات QR — كلها ميزات مؤجلة رسميًا لمرحلة لاحقة بعد فترة تجربة المنصة (راجع `PRD.md` قسم 7 للتفاصيل).

---

## خطة التحقق

### Automated
- `dotnet build` للتأكد من نجاح البناء
- `dotnet ef database update` للتأكد من Migration

### Manual
- تسجيل الدخول وصلاحيات الأدوار الثلاثة + التفويض المؤقت
- Force Password Change + Account Lockout (5 محاولات)
- جلسة واحدة فقط (تسجيل دخول من جهاز ثاني يقفل الأول)
- Idle Timeout بعد 30 دقيقة
- رفع المرفقات وتوليد QR من موبايل فعلي على نفس الشبكة
- عملية نقل أصل → التأكد من إقفال Custody القديم وفتح جديد تلقائيًا
- عملية "إرجاع للمخزن" → التأكد من إقفال Custody بدون فتح جديد
- منع Custody/Transfer لأصل مُخرَّد أو مفقود
- نقل جماعي: التفرقة بين العهدة الفردية والإدارية العامة
- استيراد Excel: صف به خطأ لا يوقف باقي الاستيراد، ويظهر في ErrorLog
- Backup (أسبوعي + يدوي) و Restore
- RTL و Dark/Light Mode
- HTTPS والتوجيه من HTTP
- حذف تصنيف/قسم/موقع/موظف مرتبط بأصل → رفض الحذف الفعلي (Soft Delete فقط)
- تنبيه بيانات ناقصة (فحص لحظي + دوري) — لا يُثار للأصول الموزّعة بسبب DepartmentId=NULL
- شاشة تنفيذ الجرد على شاشة موبايل فعلية (Responsive)
- عهدة موزّعة: إنشاء أكتر من سجل Custody نشط لنفس الأصل، ظهوره في قوائم كل الإدارات المشاركة، استثناؤه من النقل الجماعي وتنبيه البيانات الناقصة، زرار "توحيد العهدة"، احتساب القيمة المالية على IsPrimary فقط
- استيراد صفوف بنفس GroupRef → تتحول لسجل Asset واحد + عدة سجلات Custody صحيحة
- تغيير رقم لوحة/موتور مركبة: يسجّل في History الصحيح تلقائيًا، يمنع التكرار مع أي مركبة أخرى (حالية أو تاريخية)، يسمح بالرجوع لقيمة قديمة لنفس المركبة، ويطلب Reason إلزاميًا فقط عند التغيير الفعلي
- Soft Delete مركبة بسبب خطأ إدخال → رقم اللوحة/الموتور يرجع متاح؛ تخريد فعلي (Status=مُخرَّد) → يُحرق نهائيًا
