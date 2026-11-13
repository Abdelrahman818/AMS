"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import WorkspaceModulePage from "./workspace-modules";
import { dateFormatter, normalizeDisplayData, numberFormatter, toWesternDigits } from "./number-format";

const EMPTY_DASHBOARD = {
  summary: { totalAssets: 0, activeAssets: 0, assignedAssets: 0, needsAttention: 0 },
  statuses: [],
  categories: [],
  activity: [],
  recentActivity: [],
  alerts: [],
};

const EMPTY_ASSETS = [];
const EMPTY_MODULES = {};

const navigation = [
  {
    title: "الرئيسية",
    items: [{ id: "dashboard", label: "لوحة التحكم", icon: "grid" }],
  },
  {
    title: "إدارة الأصول",
    items: [
      { id: "assets", label: "قائمة الأصول", icon: "box", count: null },
      { id: "custody", label: "العهد والنقل", icon: "arrows" },
      { id: "inventory", label: "الجرد", icon: "scan" },
      { id: "scrap", label: "التخريد", icon: "archive" },
      { id: "accessories", label: "المشتملات", icon: "layers" },
    ],
  },
  {
    title: "التحليلات",
    items: [
      { id: "reports", label: "التقارير", icon: "chart" },
      { id: "notifications", label: "التنبيهات", icon: "bell", count: "3" },
    ],
  },
  {
    title: "إعدادات النظام",
    items: [
      { id: "employees", label: "الموظفون", icon: "users" },
      { id: "settings", label: "الإعدادات", icon: "settings" },
    ],
  },
];

const statusClass = {
  نشط: "status-active",
  مخزن: "status-warehouse",
  "تحت الصيانة": "status-maintenance",
  مفقود: "status-missing",
  "مُعلَّق": "status-paused",
};

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
    box: <><path d="m12 3 8.5 4.5v9L12 21l-8.5-4.5v-9L12 3Z" /><path d="m3.7 7.7 8.3 4.5 8.3-4.5M12 12.2V21" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    moon: <path d="M20.8 14.2A8.8 8.8 0 0 1 9.8 3.2 8.8 8.8 0 1 0 20.8 14.2Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow: <><path d="M7 7h13v13" /><path d="m20 7-9 9-4-4-4 4" /></>,
    arrows: <><path d="M7 7h13v13" /><path d="m20 7-9 9-4-4-4 4" /><path d="M4 4v5h5" /></>,
    scan: <><path d="M4 8V5a1 1 0 0 1 1-1h3m8 0h3a1 1 0 0 1 1 1v3m0 8v3a1 1 0 0 1-1 1h-3m-8 0H5a1 1 0 0 1-1-1v-3M8 12h8" /></>,
    archive: <><path d="M3 4h18v4H3zM5 8v12h14V8m-9 4h4" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    chart: <><path d="M4 19V5m0 14h17" /><path d="m7 15 4-4 3 2 6-7" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.9Z" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5M12 15V3" /></>,
    filter: <><path d="M4 7h16M7 12h10m-7 5h4" /><circle cx="8" cy="7" r="1.5" /><circle cx="15" cy="12" r="1.5" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 9h18m-5 5h2" /><path d="M6 5V3h12v2" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name] || paths.box}
    </svg>
  );
}

function getAssetResponse(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.success === true && Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.assets)) return payload.data.assets;
  return null;
}

function subscribeTheme(onStoreChange) {
  window.addEventListener("ams-theme-change", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener("ams-theme-change", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getThemeSnapshot() {
  return window.localStorage.getItem("ams-theme") === "dark";
}

function subscribeDate(onStoreChange) {
  const timer = window.setInterval(onStoreChange, 60_000);
  window.addEventListener("focus", onStoreChange);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("focus", onStoreChange);
  };
}

function getDateSnapshot() {
  return dateFormatter.format(new Date());
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`تعذر تحميل البيانات (${response.status})`);
  return normalizeDisplayData(await response.json());
}

export default function Home() {
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [assets, setAssets] = useState(EMPTY_ASSETS);
  const [modules, setModules] = useState(EMPTY_MODULES);
  const [dataSource, setDataSource] = useState("loading");
  const [warning, setWarning] = useState("");
  const [activePage, setActivePage] = useState("dashboard");
  const isDark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => false);
  const today = useSyncExternalStore(subscribeDate, getDateSnapshot, () => "");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [departmentFilter, setDepartmentFilter] = useState("الكل");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [dashboardData, mockAssets, moduleData] = await Promise.all([
          fetchJson("/mock-data/dashboard.json"),
          fetchJson("/mock-data/assets.json"),
          fetchJson("/mock-data/modules.json"),
        ]);
        if (!active) return;
        setDashboard(dashboardData || EMPTY_DASHBOARD);
        setModules(moduleData || EMPTY_MODULES);
        const localAssets = getAssetResponse(mockAssets);

        if (process.env.NEXT_PUBLIC_API_BASE_URL) {
          try {
            const apiResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "")}/api/v1/assets`,
              { cache: "no-store" },
            );
            if (!apiResponse.ok) throw new Error(`HTTP ${apiResponse.status}`);
            const apiPayload = normalizeDisplayData(await apiResponse.json());
            const apiAssets = getAssetResponse(apiPayload);
            if (!apiAssets) throw new Error("استجابة الأصول فارغة أو غير صالحة");
            if (!active) return;
            setAssets(apiAssets);
            setDataSource("api");
          } catch {
            if (!active) return;
            setAssets(localAssets || EMPTY_ASSETS);
            setDataSource("demo");
            setWarning("تعذر الاتصال بالخادم؛ تُعرض بيانات تجريبية من ملفات JSON.");
          }
          return;
        }

        if (!active) return;
        setAssets(localAssets || EMPTY_ASSETS);
        setDataSource("demo");
      } catch {
        if (!active) return;
        setDashboard(EMPTY_DASHBOARD);
        setAssets(EMPTY_ASSETS);
        setDataSource("empty");
        setWarning("تعذر تحميل البيانات. تحقق من ملفات البيانات ثم أعد تحميل الصفحة.");
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const departments = useMemo(
    () => [...new Set(assets.map((asset) => asset.department).filter(Boolean))],
    [assets],
  );
  const categories = useMemo(
    () => [...new Set(assets.map((asset) => asset.category).filter(Boolean))],
    [assets],
  );

  const filteredAssets = useMemo(() => {
    const query = toWesternDigits(search.trim()).toLocaleLowerCase("ar");
    return assets.filter((asset) => {
      const matchesQuery =
        !query ||
        [asset.code, asset.name, asset.category, asset.department, asset.custodian, asset.serialNumber]
          .filter(Boolean)
          .some((value) => value.toLocaleLowerCase("ar").includes(query));
      const matchesStatus = statusFilter === "الكل" || asset.status === statusFilter;
      const matchesDepartment = departmentFilter === "الكل" || asset.department === departmentFilter;
      return matchesQuery && matchesStatus && matchesDepartment;
    });
  }, [assets, departmentFilter, search, statusFilter]);

  function toggleTheme() {
    window.localStorage.setItem("ams-theme", isDark ? "light" : "dark");
    window.dispatchEvent(new Event("ams-theme-change"));
  }

  function notify(message) {
    setToast(message);
  }

  function updateModuleRows(moduleId, tabId, rows) {
    setModules((currentModules) => {
      const moduleConfig = currentModules[moduleId];
      const dataset = moduleConfig?.datasets?.[tabId];
      if (!dataset) return currentModules;

      return {
        ...currentModules,
        [moduleId]: {
          ...moduleConfig,
          datasets: {
            ...moduleConfig.datasets,
            [tabId]: { ...dataset, rows },
          },
        },
      };
    });
  }

  function exportAssets() {
    const headers = ["كود الأصل", "اسم الأصل", "الفئة", "الإدارة", "الموقع", "الحالة", "المسؤول"];
    const rows = filteredAssets.map((asset) => [
      asset.code,
      asset.name,
      asset.category,
      asset.department,
      asset.location,
      asset.status,
      asset.custodian || "عهدة إدارية",
    ]);
    const content = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "سجل-الأصول.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("تم تنزيل سجل الأصول بصيغة CSV");
  }

  function openAssetDetails(asset) {
    setSelectedAsset(asset);
    setActivePage("asset-details");
    setMobileMenuOpen(false);
  }

  function saveAsset(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const text = (name) => toWesternDigits(String(formData.get(name) || "").trim());
    const isEditing = activePage === "asset-edit" && selectedAsset;
    const previousAsset = selectedAsset || {};
    const isVehicle = formData.get("isVehicle") === "on";
    const nextPlateNumber = text("plateNumber");
    const nextEngineNumber = text("engineNumber");
    const changedAt = dateFormatter.format(new Date());
    const savedAsset = {
      ...previousAsset,
      id: isEditing ? previousAsset.id : `draft-${Date.now()}`,
      code: isEditing ? previousAsset.code : "مسودة جديدة",
      name: text("name"),
      category: text("category"),
      department: text("department"),
      location: text("location"),
      custodian: previousAsset.custodian || "عهدة إدارية",
      status: text("status"),
      condition: text("condition"),
      serialNumber: text("serialNumber"),
      brandModel: text("brandModel"),
      description: text("description"),
      purchaseDate: text("purchaseDate"),
      purchaseValue: text("purchaseValue") ? Number(text("purchaseValue")) : null,
      supplier: text("supplier"),
      isVehicle,
      plateNumber: nextPlateNumber,
      chassisNumber: text("chassisNumber"),
      engineNumber: nextEngineNumber,
      vehicleReceiptStatus: text("vehicleReceiptStatus"),
      vehiclePlateHistory: [
        ...(previousAsset.vehiclePlateHistory || []),
        ...(isEditing && isVehicle && previousAsset.plateNumber !== nextPlateNumber
          ? [{ oldValue: previousAsset.plateNumber, newValue: nextPlateNumber, reason: text("plateChangeReason"), changedAt }]
          : []),
      ],
      vehicleEngineHistory: [
        ...(previousAsset.vehicleEngineHistory || []),
        ...(isEditing && isVehicle && previousAsset.engineNumber !== nextEngineNumber
          ? [{ oldValue: previousAsset.engineNumber, newValue: nextEngineNumber, reason: text("engineChangeReason"), changedAt }]
          : []),
      ],
      updatedAt: changedAt,
    };
    setAssets((currentAssets) => isEditing
      ? currentAssets.map((asset) => asset.id === savedAsset.id ? savedAsset : asset)
      : [savedAsset, ...currentAssets]);
    setSelectedAsset(savedAsset);
    setActivePage("asset-details");
    notify(isEditing ? "تم تحديث بيانات الأصل في هذه الجلسة التجريبية" : "تمت إضافة الأصل إلى هذه الجلسة التجريبية");
  }

  const pageTitles = {
    dashboard: "لوحة التحكم",
    assets: "قائمة الأصول",
    "asset-details": selectedAsset?.name || "تفاصيل الأصل",
    "asset-new": "إضافة أصل جديد",
    "asset-edit": "تعديل بيانات الأصل",
    custody: "العهد والنقل",
    inventory: "الجرد",
    scrap: "التخريد",
    accessories: "المشتملات",
    reports: "التقارير",
    notifications: "التنبيهات",
    employees: "الموظفون",
    settings: "الإعدادات",
  };
  const title = modules[activePage]?.title || pageTitles[activePage] || null;

  return (
    <div className={`workspace${isDark ? " theme-dark" : ""}`} dir="rtl">
      {mobileMenuOpen && <button aria-label="إغلاق القائمة" className="mobile-backdrop" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`sidebar${mobileMenuOpen ? " sidebar-open" : ""}`}>
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setActivePage("dashboard"); }}>
          <span className="brand-mark"><Icon name="box" size={23} /></span>
          <span className="brand-copy"><strong>أصول</strong><small>إدارة الأصول المؤسسية</small></span>
        </a>

        <div className="workspace-switcher">
          <span className="workspace-avatar">ب</span>
          <span className="workspace-name"><strong>شركة البناء الحديثة</strong><small>المقر الرئيسي</small></span>
          <span className="switch-chevron">⌄</span>
        </div>

        <nav className="side-navigation" aria-label="التنقل الرئيسي">
          {navigation.map((group) => (
            <section className="nav-group" key={group.title}>
              <h2>{group.title}</h2>
              {group.items.map((item) => {
                const isActive = item.id === activePage || (item.id === "assets" && activePage.startsWith("asset-"));
                return (
                  <button
                    className={`nav-item${isActive ? " nav-item-active" : ""}`}
                    key={item.id}
                    onClick={() => {
                      setActivePage(item.id);
                      setSelectedAsset(null);
                      setMobileMenuOpen(false);
                    }}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon name={item.icon} size={19} />
                    <span>{item.label}</span>
                    {item.count && <span className="nav-count">{item.count}</span>}
                  </button>
                );
              })}
            </section>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon">?</span>
            <strong>تحتاج إلى مساعدة؟</strong>
            <span>تواصل مع فريق الدعم</span>
            <button onClick={() => notify("سيُتاح مركز المساعدة قريبًا.")}>مركز المساعدة <Icon name="chevron" size={14} /></button>
          </div>
          <button className="profile-card" onClick={() => notify("مسجل الدخول بصفة مدير النظام")}>
            <span className="profile-avatar">م</span>
            <span className="profile-info"><strong>محمد عبدالله</strong><small>مدير النظام</small></span>
            <span className="profile-dots">•••</span>
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu-button icon-button" aria-label="فتح القائمة" onClick={() => setMobileMenuOpen(true)}><Icon name="menu" /></button>
          <div className="breadcrumbs"><span>الرئيسية</span><Icon name="chevron" size={14} /><strong>{title || "قريبًا"}</strong></div>
          <div className="topbar-actions">
            <span className="today-date"><Icon name="clock" size={16} />{today}</span>
            <button className="icon-button theme-button" aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"} title="تغيير المظهر" onClick={toggleTheme}><Icon name={isDark ? "sun" : "moon"} /></button>
            <div className="notification-wrap">
              <button className="icon-button notification-button" aria-label="التنبيهات" onClick={() => setShowNotifications((shown) => !shown)}><Icon name="bell" /><span className="notification-dot" /></button>
              {showNotifications && (
                <div className="notification-popover">
                  <div className="popover-heading"><strong>التنبيهات</strong><span>آخر المستجدات</span></div>
                  {(dashboard.alerts || []).slice(0, 3).map((alert) => <div className="popover-alert" key={alert.id}><span className={`alert-dot ${alert.tone || "blue"}`} /><span><strong>{alert.title}</strong><small>{alert.description}</small></span></div>)}
                  {!dashboard.alerts?.length && <p className="empty-popover">لا توجد تنبيهات جديدة</p>}
                </div>
              )}
            </div>
            <span className="topbar-divider" />
            <span className="topbar-user"><span className="topbar-avatar">م</span><span>محمد عبدالله</span></span>
          </div>
        </header>

        <div className="page-content">
          {warning && <div className="data-notice" role="status"><span>ⓘ</span>{warning}</div>}
          {dataSource === "loading" && <div className="loading-strip" role="status">جاري تحميل بيانات مساحة العمل...</div>}
          {dataSource !== "loading" && dataSource !== "empty" && <div className="demo-strip"><span className="demo-indicator" />{dataSource === "api" ? "مؤشرات لوحة التحكم تجريبية؛ سجل الأصول متصل بواجهة API." : "بيانات تجريبية — لن تُحفظ التغييرات بعد مغادرة الصفحة"}</div>}
          {title ? (
            activePage === "dashboard" ? (
              <Dashboard dashboard={dashboard} assets={assets} onNavigate={setActivePage} onSelectAsset={openAssetDetails} />
            ) : activePage === "assets" ? (
              <AssetsPage
                assets={filteredAssets}
                allAssets={assets}
                departments={departments}
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                departmentFilter={departmentFilter}
                setDepartmentFilter={setDepartmentFilter}
                onAdd={() => { setSelectedAsset(null); setActivePage("asset-new"); }}
                onExport={exportAssets}
                onSelectAsset={openAssetDetails}
              />
            ) : activePage === "asset-details" && selectedAsset ? (
              <AssetDetailsPage
                asset={assets.find((asset) => asset.id === selectedAsset.id) || selectedAsset}
                onBack={() => setActivePage("assets")}
                onEdit={() => setActivePage("asset-edit")}
                onNotify={notify}
              />
            ) : activePage === "asset-new" || (activePage === "asset-edit" && selectedAsset) ? (
              <AssetFormPage
                key={`${activePage}-${selectedAsset?.id || "new"}`}
                asset={activePage === "asset-edit" ? selectedAsset : null}
                categories={categories}
                departments={departments}
                onCancel={() => setActivePage(selectedAsset ? "asset-details" : "assets")}
                onSubmit={saveAsset}
              />
            ) : modules[activePage] ? (
              <WorkspaceModulePage
                key={activePage}
                moduleId={activePage}
                config={modules[activePage]}
                Icon={Icon}
                onNotify={notify}
                onUpdateRows={updateModuleRows}
              />
            ) : <ComingSoon onNavigate={setActivePage} />
          ) : (
            <ComingSoon onNavigate={setActivePage} />
          )}
        </div>
        <footer className="page-footer"><span>© 2026 أصول — نظام إدارة الأصول المؤسسية</span><span><i /> جميع الأنظمة تعمل بشكل طبيعي</span></footer>
      </main>

      {toast && <div className="toast-message" role="status"><Icon name="check" size={17} />{toast}</div>}
    </div>
  );
}

function Dashboard({ dashboard, assets, onNavigate, onSelectAsset }) {
  const summary = dashboard.summary || EMPTY_DASHBOARD.summary;
  const statuses = dashboard.statuses || [];
  const categories = dashboard.categories || [];
  const activity = dashboard.activity || [];
  const recentActivity = dashboard.recentActivity || [];
  const maxActivity = Math.max(...activity.map((day) => day.count || 0), 1);
  const statCards = [
    { title: "إجمالي الأصول", value: summary.totalAssets, change: summary.totalChange, icon: "box", tone: "blue", suffix: "أصل مسجل" },
    { title: "الأصول النشطة", value: summary.activeAssets, change: summary.activeChange, icon: "check", tone: "green", suffix: "من إجمالي الأصول" },
    { title: "الأصول بعهدة", value: summary.assignedAssets, change: summary.assignedChange, icon: "users", tone: "purple", suffix: "تحت المسؤولية" },
    { title: "تحتاج إلى متابعة", value: summary.needsAttention, change: null, icon: "bell", tone: "orange", suffix: "تتطلب إجراءً" },
  ];

  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">نظرة عامة على أصول مؤسستك</p><h1>مرحبًا، محمد <span className="wave">👋</span></h1><p className="heading-subtitle">إليك ملخص حالة الأصول والأنشطة الأخيرة اليوم.</p></div>
        <button className="primary-button" onClick={() => onNavigate("assets")}><Icon name="box" size={18} />استعراض الأصول</button>
      </div>

      <section className="stats-grid" aria-label="ملخص الأصول">
        {statCards.map((card) => (
          <article className="stat-card" key={card.title}>
            <div className="stat-card-top"><span className={`stat-icon ${card.tone}`}><Icon name={card.icon} size={19} /></span><span className="stat-period">آخر 30 يومًا</span></div>
            <p className="stat-title">{card.title}</p>
            <div className="stat-value-line"><strong>{numberFormatter.format(card.value || 0)}</strong>{card.change && <span className="stat-change"><Icon name="arrow" size={13} />{card.change}</span>}</div>
            <span className="stat-footnote">{card.suffix}</span>
          </article>
        ))}
      </section>

      <section className="insights-grid">
        <article className="panel activity-panel">
          <div className="panel-heading"><div><h2>حركة الأصول</h2><p>نظرة على نشاط الأصول خلال الأسبوع</p></div><button className="select-button" onClick={() => onNavigate("assets")}>هذا الأسبوع <span>⌄</span></button></div>
          {activity.length ? (
            <div className="activity-chart">
              <div className="chart-y-labels"><span>30</span><span>20</span><span>10</span><span>0</span></div>
              <div className="chart-area">
                <div className="chart-grid-lines"><i /><i /><i /><i /></div>
                <div className="chart-bars">
                  {activity.map((day, index) => <div className="chart-column" key={`${day.label}-${index}`}><div className="bar-stack"><span className="bar bar-transfers" style={{ height: `${Math.max((day.transfers / maxActivity) * 100, day.transfers ? 8 : 0)}%` }} /><span className="bar bar-additions" style={{ height: `${Math.max((day.additions / maxActivity) * 100, day.additions ? 8 : 0)}%` }} /></div><small>{day.label}</small></div>)}
                </div>
              </div>
            </div>
          ) : <EmptyState title="لا توجد بيانات نشاط" description="ستظهر حركة الأصول هنا عند توفر البيانات." />}
          <div className="chart-legend"><span><i className="legend-blue" />أصول مضافة</span><span><i className="legend-mint" />عمليات نقل</span></div>
        </article>

        <article className="panel status-panel">
          <div className="panel-heading"><div><h2>حالة الأصول</h2><p>توزيع الأصول حسب الحالة</p></div><button className="subtle-menu" aria-label="المزيد">•••</button></div>
          {statuses.length ? (
            <div className="status-content">
              <div className="donut-wrap"><div className="donut-chart" style={{ background: getStatusGradient(statuses) }}><div className="donut-center"><strong>{numberFormatter.format(summary.totalAssets || 0)}</strong><span>إجمالي الأصول</span></div></div></div>
              <div className="status-legend">{statuses.map((status) => <div key={status.name}><span><i style={{ backgroundColor: status.color }} />{status.name}</span><strong>{numberFormatter.format(status.count || 0)}</strong></div>)}</div>
            </div>
          ) : <EmptyState title="لا توجد بيانات حالة" description="توزيع الحالات سيظهر عند توفر بيانات الأصول." />}
        </article>
      </section>

      <section className="lower-grid">
        <article className="panel recent-panel">
          <div className="panel-heading"><div><h2>الأصول المضافة مؤخرًا</h2><p>آخر الأصول المسجلة في النظام</p></div><button className="text-button" onClick={() => onNavigate("assets")}>عرض كل الأصول <Icon name="chevron" size={15} /></button></div>
          {assets.length ? <div className="mini-asset-list">{assets.slice(0, 4).map((asset) => <button className="mini-asset-row" key={asset.id} onClick={() => onSelectAsset(asset)}><span className="mini-asset-icon"><Icon name="box" size={18} /></span><span className="mini-asset-copy"><strong>{asset.name}</strong><small>{asset.code} · {asset.category}</small></span><span className={`status-pill ${statusClass[asset.status] || "status-paused"}`}>{asset.status}</span><span className="mini-asset-date">{asset.updatedAt || "—"}</span><Icon name="chevron" size={15} /></button>)}</div> : <EmptyState title="لا توجد أصول بعد" description="ابدأ بإضافة أول أصل إلى سجل المؤسسة." action={<button className="text-button" onClick={() => onNavigate("assets")}>فتح قائمة الأصول</button>} /> }
        </article>

        <article className="panel categories-panel">
          <div className="panel-heading"><div><h2>الأصول حسب الفئة</h2><p>أكثر الفئات استخدامًا</p></div><button className="subtle-menu" aria-label="المزيد">•••</button></div>
          {categories.length ? <div className="category-list">{categories.slice(0, 5).map((category, index) => <div className="category-row" key={category.name}><span className={`category-icon category-${index % 5}`}><Icon name={category.icon || "box"} size={17} /></span><span className="category-copy"><strong>{category.name}</strong><small>{numberFormatter.format(category.count || 0)} أصل</small></span><div className="category-track"><i style={{ width: `${Math.min(category.percentage || 0, 100)}%` }} /></div><span className="category-percent">{numberFormatter.format(category.percentage || 0)}%</span></div>)}</div> : <EmptyState title="لا توجد فئات" description="ستظهر الفئات بعد إضافة الأصول." />}
        </article>
      </section>

      <section className="panel recent-activity-panel">
        <div className="panel-heading"><div><h2>آخر العمليات</h2><p>أحدث التحديثات على سجل الأصول</p></div><button className="text-button" onClick={() => onNavigate("assets")}>عرض سجل الأصول <Icon name="chevron" size={15} /></button></div>
        {recentActivity.length ? <div className="operations-list">{recentActivity.slice(0, 4).map((item) => <div className="operation-row" key={item.id}><span className={`operation-icon ${item.tone || "blue"}`}><Icon name={item.icon || "box"} size={17} /></span><span className="operation-copy"><strong>{item.title}</strong><small>{item.description}</small></span><span className="operation-actor">{item.actor}</span><span className="operation-time">{item.time}</span></div>)}</div> : <EmptyState title="لا توجد عمليات حديثة" description="ستظهر العمليات عند تسجيل أي تحديث." />}
      </section>
    </>
  );
}

function AssetsPage({ assets, allAssets, departments, search, setSearch, statusFilter, setStatusFilter, departmentFilter, setDepartmentFilter, onAdd, onExport, onSelectAsset }) {
  return (
    <>
      <div className="page-heading asset-page-heading">
        <div><p className="eyebrow">إدارة وتتبع الأصول</p><h1>قائمة الأصول</h1><p className="heading-subtitle">استعرض الأصول المسجلة وابحث عنها حسب الكود أو الاسم أو الإدارة.</p></div>
        <button className="primary-button" onClick={onAdd}><Icon name="plus" size={18} />إضافة أصل جديد</button>
      </div>

      <section className="asset-summary-row">
        <div className="asset-total"><span className="total-icon"><Icon name="box" size={21} /></span><span><small>إجمالي الأصول</small><strong>{numberFormatter.format(allAssets.length)}</strong></span></div>
        <div className="summary-separator" />
        <span className="summary-chip"><i className="summary-dot green" />نشط <strong>{numberFormatter.format(allAssets.filter((asset) => asset.status === "نشط").length)}</strong></span>
        <span className="summary-chip"><i className="summary-dot orange" />تحت الصيانة <strong>{numberFormatter.format(allAssets.filter((asset) => asset.status === "تحت الصيانة").length)}</strong></span>
        <span className="summary-chip"><i className="summary-dot blue" />مخزن <strong>{numberFormatter.format(allAssets.filter((asset) => asset.status === "مخزن").length)}</strong></span>
      </section>

      <section className="panel asset-table-panel">
        <div className="table-heading"><div><h2>سجل الأصول</h2><p>عرض {numberFormatter.format(assets.length)} من {numberFormatter.format(allAssets.length)} أصل</p></div><button className="secondary-button" onClick={onExport}><Icon name="download" size={17} />تصدير CSV</button></div>
        <div className="table-toolbar">
          <label className="search-field"><Icon name="search" size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث بالكود، الاسم، الفئة، الإدارة..." aria-label="البحث في الأصول" />{search && <button aria-label="مسح البحث" onClick={() => setSearch("")}><Icon name="close" size={15} /></button>}</label>
          <div className="filter-control"><Icon name="filter" size={16} /><select aria-label="تصفية حسب الحالة" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="الكل">كل الحالات</option>{Object.keys(statusClass).map((status) => <option value={status} key={status}>{status}</option>)}</select></div>
          <div className="filter-control department-filter"><select aria-label="تصفية حسب الإدارة" value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}><option value="الكل">كل الإدارات</option>{departments.map((department) => <option value={department} key={department}>{department}</option>)}</select></div>
        </div>

        <div className="table-scroll">
          <table className="asset-table">
            <thead><tr><th>الأصل</th><th>الفئة</th><th>الإدارة والموقع</th><th>المسؤول الحالي</th><th>الحالة</th><th>آخر تحديث</th><th><span className="visually-hidden">التفاصيل</span></th></tr></thead>
            <tbody>
              {assets.map((asset) => <tr key={asset.id} onClick={() => onSelectAsset(asset)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") onSelectAsset(asset); }}>
                <td><div className="table-asset"><span className={`asset-thumb ${asset.iconTone || "blue"}`}><Icon name={asset.icon || "box"} size={19} /></span><span><strong>{asset.name}</strong><small>{asset.code}</small></span></div></td>
                <td><span className="category-cell">{asset.category}</span>{asset.isVehicle && <small className="vehicle-label">مركبة</small>}</td>
                <td><span className="department-cell">{asset.department || "متعدد الإدارات"}</span><small className="location-cell">{asset.location || "—"}</small></td>
                <td><span className="custodian-cell">{asset.custodian || "عهدة إدارية"}</span>{asset.distributed && <small className="distributed-label">عهدة موزعة</small>}</td>
                <td><span className={`status-pill ${statusClass[asset.status] || "status-paused"}`}><i />{asset.status}</span></td>
                <td><span className="update-date">{asset.updatedAt || "—"}</span></td>
                <td><button className="row-chevron" aria-label={`تفاصيل ${asset.name}`} onClick={(event) => { event.stopPropagation(); onSelectAsset(asset); }}><Icon name="chevron" size={17} /></button></td>
              </tr>)}
            </tbody>
          </table>
          {!assets.length && <EmptyState title={allAssets.length ? "لا توجد نتائج مطابقة" : "لا توجد أصول لعرضها"} description={allAssets.length ? "جرّب تغيير كلمات البحث أو خيارات التصفية." : "ستظهر الأصول هنا عند اتصال النظام بمصدر البيانات."} action={allAssets.length ? <button className="text-button" onClick={() => { setSearch(""); setStatusFilter("الكل"); setDepartmentFilter("الكل"); }}>مسح الفلاتر</button> : null} />}
        </div>
        <div className="table-footer"><span>عرض <strong>{numberFormatter.format(assets.length)}</strong> من أصل <strong>{numberFormatter.format(allAssets.length)}</strong></span><div className="pagination"><button aria-label="السابق" disabled>‹</button><button className="page-current">1</button><button aria-label="التالي" disabled>›</button></div></div>
      </section>
      <div className="asset-list-note"><Icon name="wallet" size={16} /><span>القيم المالية والتقارير التفصيلية متاحة حسب صلاحيات المستخدم.</span></div>
    </>
  );
}

function EmptyState({ title, description, action }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name="box" size={22} /></span><strong>{title}</strong><p>{description}</p>{action}</div>;
}

function getStatusGradient(statuses) {
  let start = 0;
  const segments = statuses.map((status) => {
    const end = start + (status.percentage || 0);
    const segment = `${status.color} ${start}% ${end}%`;
    start = end;
    return segment;
  });
  return `conic-gradient(${segments.join(", ")})`;
}

function ComingSoon({ onNavigate }) {
  return <section className="coming-soon"><span className="coming-icon"><Icon name="layers" size={28} /></span><p className="eyebrow">مساحة العمل</p><h1>هذه الوحدة قيد التجهيز</h1><p>نعمل على إعداد هذه الشاشة لتكون متوافقة مع سير العمل والصلاحيات المعتمدة للنظام.</p><button className="primary-button" onClick={() => onNavigate("assets")}><Icon name="box" size={18} />العودة إلى الأصول</button></section>;
}

function AssetDetailsPage({ asset, onBack, onEdit, onNotify }) {
  const [activeTab, setActiveTab] = useState("overview");
  const requiredFields = [
    { label: "الرقم المسلسل", complete: Boolean(asset.serialNumber) },
    { label: "المورد", complete: Boolean(asset.supplier) },
    { label: "قيمة الشراء", complete: Number.isFinite(asset.purchaseValue) },
    { label: "تاريخ الشراء", complete: Boolean(asset.purchaseDate) },
    { label: "الموقع", complete: Boolean(asset.location) },
    { label: "الإدارة", complete: Boolean(asset.department && asset.department !== "متعدد الإدارات") || asset.distributed },
    { label: "مسؤول العهدة", complete: Boolean(asset.custodian) },
  ];
  const completeCount = requiredFields.filter((field) => field.complete).length;
  const completeness = Math.round((completeCount / requiredFields.length) * 100);
  const missingFields = requiredFields.filter((field) => !field.complete);
  const vehicleHistory = [
    ...(asset.vehiclePlateHistory || []).map((item) => ({ ...item, field: "رقم اللوحة" })),
    ...(asset.vehicleEngineHistory || []).map((item) => ({ ...item, field: "رقم المحرك" })),
  ];
  const tabs = [
    { id: "overview", label: "نظرة عامة" },
    { id: "custody", label: "العهدة والموقع" },
    { id: "history", label: "سجل الأصل" },
    { id: "attachments", label: "المرفقات" },
    ...(asset.isVehicle ? [{ id: "vehicle-history", label: "تاريخ المركبة" }] : []),
  ];

  return (
    <div className="asset-detail-page">
      <div className="detail-breadcrumb"><button onClick={onBack}>قائمة الأصول</button><Icon name="chevron" size={14} /><span>{asset.code}</span></div>
      <div className="detail-hero">
        <div className="detail-hero-main">
          <span className={`detail-hero-icon ${asset.iconTone || "blue"}`}><Icon name={asset.icon || "box"} size={26} /></span>
          <div className="detail-hero-copy">
            <div className="detail-hero-meta"><span className="eyebrow">{asset.category || "أصل"}</span><span className={`status-pill ${statusClass[asset.status] || "status-paused"}`}><i />{asset.status || "غير محدد"}</span></div>
            <h1>{asset.name || "أصل بدون اسم"}</h1>
            <p>{asset.code} <span>·</span> آخر تحديث {asset.updatedAt || "غير مسجل"}</p>
          </div>
        </div>
        <div className="detail-hero-actions">
          <button className="secondary-button" onClick={() => window.print()}><Icon name="download" size={17} />طباعة</button>
          <button className="secondary-button" onClick={() => onNotify("يتطلب نقل العهدة اتصالًا بواجهة API.")}><Icon name="arrows" size={17} />نقل الأصل</button>
          <button className="primary-button" onClick={onEdit}><Icon name="settings" size={17} />تعديل البيانات</button>
        </div>
      </div>

      <nav className="asset-detail-tabs" aria-label="أقسام تفاصيل الأصل" role="tablist">
        {tabs.map((tab) => <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? "detail-tab active" : "detail-tab"} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}
      </nav>

      {activeTab === "overview" && (
        <div className="detail-content-grid">
          <div className="detail-primary-column">
            <section className="panel detail-content-panel">
              <div className="detail-section-heading"><div><h2>البيانات الأساسية</h2><p>معلومات تعريف الأصل وتفاصيل الشراء</p></div><button className="text-button" onClick={onEdit}>تعديل <Icon name="chevron" size={14} /></button></div>
              <div className="asset-property-grid">
                <DetailField label="اسم الأصل" value={asset.name} />
                <DetailField label="الفئة" value={asset.category} />
                <DetailField label="الماركة والموديل" value={asset.brandModel} />
                <DetailField label="الرقم المسلسل" value={asset.serialNumber} />
                <DetailField label="تاريخ الشراء" value={asset.purchaseDate} />
                <DetailField label="قيمة الشراء" value={Number.isFinite(asset.purchaseValue) ? `${numberFormatter.format(asset.purchaseValue)} ج.م` : ""} />
                <DetailField label="المورد" value={asset.supplier} />
                <DetailField label="حالة الأصل" value={asset.condition || asset.status} />
                {asset.description && <DetailField label="الوصف" value={asset.description} wide />}
              </div>
            </section>

            {asset.isVehicle && (
              <section className="panel detail-content-panel">
                <div className="detail-section-heading"><div><h2>بيانات المركبة</h2><p>المعلومات التعريفية للمركبة</p></div><button className="text-button" onClick={onEdit}>تعديل بيانات المركبة <Icon name="chevron" size={14} /></button></div>
                <div className="asset-property-grid">
                  <DetailField label="رقم اللوحة" value={asset.plateNumber} />
                  <DetailField label="رقم الشاسيه" value={asset.chassisNumber} />
                  <DetailField label="رقم المحرك" value={asset.engineNumber} />
                  <DetailField label="حالة الاستلام" value={asset.vehicleReceiptStatus} />
                </div>
                <p className="detail-footnote">سجل تغييرات اللوحة والمحرك متاح من تبويب تاريخ المركبة.</p>
              </section>
            )}

            <CustodySection asset={asset} onNotify={onNotify} compact />
          </div>

          <aside className="detail-side-column">
            <section className="panel completeness-panel">
              <div className="detail-section-heading"><div><h2>اكتمال البيانات</h2><p>الحقول الأساسية المسجلة للأصل</p></div><strong>{numberFormatter.format(completeness)}%</strong></div>
              <div className="completeness-track"><i style={{ width: `${completeness}%` }} /></div>
              <div className="completeness-count">{numberFormatter.format(completeCount)} من {numberFormatter.format(requiredFields.length)} حقول مكتملة</div>
              {missingFields.length > 0 && <div className="missing-fields"><span>بيانات تحتاج إلى استكمال</span>{missingFields.map((field) => <div key={field.label}><i />{field.label}</div>)}</div>}
            </section>
            <section className="panel qr-placeholder-panel">
              <span className="qr-placeholder-icon"><Icon name="scan" size={22} /></span>
              <div><h2>رمز QR للأصل</h2><p>سيُنشأ الرمز عند ربط النظام بخدمة الأصول.</p></div>
              <strong>{asset.code}</strong>
            </section>
            <section className="panel quick-facts-panel">
              <h2>معلومات السجل</h2>
              <DetailField label="كود الأصل" value={asset.code} />
              <DetailField label="تاريخ آخر تحديث" value={asset.updatedAt} />
              <DetailField label="نوع العهدة" value={asset.distributed ? "موزعة" : asset.custodian ? "فردية" : "إدارية عامة"} />
            </section>
          </aside>
        </div>
      )}

      {activeTab === "custody" && <CustodySection asset={asset} onNotify={onNotify} />}

      {activeTab === "history" && (
        <section className="panel detail-tab-panel">
          <div className="detail-section-heading"><div><h2>سجل عمليات الأصل</h2><p>التغييرات المسجلة على الأصل</p></div></div>
          {asset.history?.length ? <div className="asset-timeline">{asset.history.map((item) => <TimelineItem key={item.id} item={item} />)}</div> : <EmptyState title="لا توجد عمليات مسجلة" description="ستظهر هنا عمليات النقل والعهدة والجرد المرتبطة بالأصل." />}
        </section>
      )}

      {activeTab === "attachments" && (
        <section className="panel detail-tab-panel">
          <div className="detail-section-heading"><div><h2>مرفقات الأصل</h2><p>صور وفواتير ومستندات داعمة</p></div><button className="secondary-button" onClick={() => onNotify("رفع الملفات سيتاح بعد تجهيز واجهة API.")}><Icon name="plus" size={16} />إضافة مرفق</button></div>
          <EmptyState title="لا توجد مرفقات" description="لم تُضف صور أو فواتير أو مستندات لهذا الأصل بعد." />
        </section>
      )}

      {activeTab === "vehicle-history" && (
        <section className="panel detail-tab-panel">
          <div className="detail-section-heading"><div><h2>تاريخ تغييرات المركبة</h2><p>سجل تغييرات أرقام اللوحة والمحرك</p></div><button className="text-button" onClick={onEdit}>تعديل بيانات المركبة <Icon name="chevron" size={14} /></button></div>
          {vehicleHistory.length ? <div className="vehicle-history-list">{vehicleHistory.map((item, index) => <div className="vehicle-history-row" key={`${item.field}-${index}`}><span className="history-indicator"><Icon name="arrows" size={16} /></span><div><strong>تغيير {item.field}</strong><p>{item.oldValue || "غير مسجل"} <span>←</span> {item.newValue}</p><small>السبب: {item.reason || "—"} · {item.changedAt || "—"}</small></div></div>)}</div> : <EmptyState title="لا يوجد سجل تغييرات بعد" description="تُسجَّل التغييرات هنا عند تعديل رقم اللوحة أو المحرك." />}
        </section>
      )}
    </div>
  );
}

function CustodySection({ asset, onNotify, compact = false }) {
  const custodies = asset.custodies || [];

  return (
    <section className={`panel detail-content-panel custody-detail-panel${compact ? " custody-compact" : ""}`}>
      <div className="detail-section-heading">
        <div><h2>{asset.distributed ? "العهدة الموزعة" : "الموقع والعهدة الحالية"}</h2><p>{asset.distributed ? `${numberFormatter.format(custodies.length)} سجلات عهدة نشطة لهذا الأصل` : "مكان الأصل والمسؤول الحالي عن العهدة"}</p></div>
        {!asset.distributed && <button className="text-button" onClick={() => onNotify("إدارة العهدة تتطلب اتصالًا بواجهة API.")}>إدارة العهدة <Icon name="chevron" size={14} /></button>}
      </div>
      {asset.distributed ? (
        <>
          <div className="custody-table-wrap">
            <table className="custody-table">
              <thead><tr><th>الإدارة</th><th>الموظف / نوع العهدة</th><th>وصف القطعة</th><th>حصة القيمة</th></tr></thead>
              <tbody>{custodies.map((custody, index) => <tr key={`${custody.department}-${index}`}><td>{custody.department}</td><td>{custody.employee || "عهدة إدارية عامة"}</td><td>{custody.description || "—"}</td><td>{custody.isPrimary ? <span className="primary-custody">الإدارة الأساسية</span> : <span className="non-primary-custody">بدون احتساب مكرر</span>}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="distributed-action-row"><p>القيمة المالية تُحتسب على الإدارة الأساسية فقط.</p><button className="secondary-button" onClick={() => onNotify("توحيد العهدة يتطلب اتصالًا بواجهة API.")}>توحيد العهدة</button></div>
        </>
      ) : (
        <div className="single-custody-grid">
          <DetailField label="الإدارة" value={asset.department} />
          <DetailField label="الموقع" value={asset.location} />
          <DetailField label="المسؤول الحالي" value={asset.custodian || "عهدة إدارية عامة"} />
          <DetailField label="نوع العهدة" value={asset.custodian ? "فردية" : "إدارية عامة"} />
        </div>
      )}
    </section>
  );
}

function DetailField({ label, value, wide = false }) {
  return <div className={`detail-field${wide ? " detail-field-wide" : ""}`}><span>{label}</span><strong>{value || "غير مسجل"}</strong></div>;
}

function TimelineItem({ item }) {
  return <div className="timeline-item"><span className="timeline-marker"><Icon name={item.icon || "clock"} size={15} /></span><div><strong>{item.title}</strong><p>{item.description}</p><small>{item.date || "—"} · {item.actor || "—"}</small></div></div>;
}

function AssetFormPage({ asset, categories, departments, onCancel, onSubmit }) {
  const [isVehicle, setIsVehicle] = useState(Boolean(asset?.isVehicle));
  const [plateNumber, setPlateNumber] = useState(asset?.plateNumber || "");
  const [engineNumber, setEngineNumber] = useState(asset?.engineNumber || "");
  const plateChanged = Boolean(asset?.isVehicle && asset.plateNumber !== plateNumber.trim());
  const engineChanged = Boolean(asset?.isVehicle && asset.engineNumber !== engineNumber.trim());

  return (
    <div className="asset-form-page">
      <div className="form-page-heading">
        <div><button className="form-back-link" onClick={onCancel}><Icon name="chevron" size={15} />{asset ? "العودة إلى تفاصيل الأصل" : "العودة إلى قائمة الأصول"}</button><p className="eyebrow">سجل الأصول</p><h1>{asset ? "تعديل بيانات الأصل" : "إضافة أصل جديد"}</h1><p className="heading-subtitle">{asset ? `${asset.code} · ${asset.name}` : "أدخل المعلومات الأساسية لتسجيل أصل جديد."}</p></div>
        {asset && <span className={`status-pill ${statusClass[asset.status] || "status-paused"}`}><i />{asset.status}</span>}
      </div>

      <form className="asset-form-layout" onSubmit={onSubmit}>
        <div className="asset-form-main">
          <section className="panel form-section">
            <div className="form-section-heading"><span className="form-section-number">1</span><div><h2>البيانات الأساسية</h2><p>التصنيف والتعريف بالأصل</p></div></div>
            <div className="form-fields-grid">
              <label className="form-field form-field-wide"><span>اسم الأصل <b>*</b></span><input name="name" required defaultValue={asset?.name || ""} placeholder="مثال: جهاز حاسب مكتبي" /></label>
              <label className="form-field"><span>الفئة <b>*</b></span><input name="category" required list="asset-categories" defaultValue={asset?.category || ""} onChange={(event) => { if (event.target.value === "مركبات") setIsVehicle(true); }} placeholder="اختر أو اكتب الفئة" /><datalist id="asset-categories">{categories.map((category) => <option key={category} value={category} />)}</datalist></label>
              <label className="form-field"><span>الماركة / الموديل</span><input name="brandModel" defaultValue={asset?.brandModel || ""} placeholder="الشركة والموديل" /></label>
              <label className="form-field"><span>الرقم المسلسل</span><input name="serialNumber" defaultValue={asset?.serialNumber || ""} placeholder="أدخل الرقم المسلسل" /></label>
              <label className="form-field"><span>الحالة</span><select name="status" defaultValue={asset?.status || "نشط"}>{Object.keys(statusClass).map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
              <label className="form-field"><span>حالة الأصل</span><select name="condition" defaultValue={asset?.condition || ""}><option value="">غير محددة</option><option value="جديد">جديد</option><option value="جيد">جيد</option><option value="يحتاج إلى صيانة">يحتاج إلى صيانة</option></select></label>
              <label className="form-field form-field-wide"><span>وصف إضافي</span><textarea name="description" rows="3" defaultValue={asset?.description || ""} placeholder="ملاحظات أو تفاصيل تساعد على تمييز الأصل" /></label>
            </div>
          </section>

          <section className="panel form-section">
            <div className="form-section-heading"><span className="form-section-number">2</span><div><h2>الشراء والموقع</h2><p>بيانات الشراء ومكان تواجد الأصل</p></div></div>
            <div className="form-fields-grid">
              <label className="form-field"><span>تاريخ الشراء <b>*</b></span><input type="date" name="purchaseDate" required defaultValue={asset?.purchaseDate || ""} /></label>
              <label className="form-field"><span>قيمة الشراء <b>*</b></span><div className="input-with-suffix"><input type="number" name="purchaseValue" min="0" step="0.01" required defaultValue={asset?.purchaseValue ?? ""} placeholder="0.00" /><span>ج.م</span></div></label>
              <label className="form-field"><span>المورد</span><input name="supplier" defaultValue={asset?.supplier || ""} placeholder="اسم المورد" /></label>
              <label className="form-field"><span>الإدارة <b>*</b></span><input name="department" required list="asset-departments" readOnly={Boolean(asset)} defaultValue={asset?.department || ""} placeholder="اختر أو اكتب اسم الإدارة" /><datalist id="asset-departments">{departments.map((department) => <option key={department} value={department} />)}</datalist>{asset && <small className="field-hint">تُحدَّث الإدارة من خلال عملية نقل الأصل.</small>}</label>
              <label className="form-field form-field-wide"><span>مكان التواجد <b>*</b></span><input name="location" required readOnly={Boolean(asset)} defaultValue={asset?.location || ""} placeholder="المبنى، الطابق، أو الموقع" />{asset && <small className="field-hint">يُحدَّث الموقع من خلال عملية نقل الأصل.</small>}</label>
            </div>
          </section>

          <section className="panel form-section">
            <div className="form-section-heading form-section-heading-inline"><span className="form-section-number">3</span><div><h2>بيانات المركبة</h2><p>فعّل هذا الخيار لإضافة بيانات المركبة</p></div><label className="vehicle-toggle"><input type="checkbox" name="isVehicle" checked={isVehicle} onChange={(event) => setIsVehicle(event.target.checked)} /><span>هذا الأصل مركبة</span></label></div>
            {isVehicle && <div className="vehicle-fields form-fields-grid">
              <label className="form-field"><span>رقم اللوحة <b>*</b></span><input name="plateNumber" required value={plateNumber} onChange={(event) => setPlateNumber(toWesternDigits(event.target.value))} placeholder="رقم لوحة المركبة" /></label>
              <label className="form-field"><span>رقم الشاسيه <b>*</b></span><input name="chassisNumber" required defaultValue={asset?.chassisNumber || ""} placeholder="رقم الشاسيه" /></label>
              <label className="form-field"><span>رقم المحرك</span><input name="engineNumber" value={engineNumber} onChange={(event) => setEngineNumber(toWesternDigits(event.target.value))} placeholder="رقم المحرك" /></label>
              <label className="form-field"><span>حالة الاستلام</span><select name="vehicleReceiptStatus" defaultValue={asset?.vehicleReceiptStatus || ""}><option value="">اختر الحالة</option><option value="جديدة">جديدة</option><option value="تعمل">تعمل</option></select></label>
              {plateChanged && <label className="form-field form-field-wide"><span>سبب تغيير رقم اللوحة <b>*</b></span><input name="plateChangeReason" required placeholder="سبب التغيير" /></label>}
              {engineChanged && <label className="form-field form-field-wide"><span>سبب تغيير رقم المحرك <b>*</b></span><input name="engineChangeReason" required placeholder="سبب التغيير" /></label>}
            </div>}
            {!isVehicle && <div className="vehicle-empty"><Icon name="arrows" size={19} /><span>بيانات المركبة غير مطلوبة لهذا الأصل.</span></div>}
          </section>
        </div>

        <aside className="asset-form-aside">
          <section className="panel form-submit-panel"><span className="form-preview-icon"><Icon name="box" size={23} /></span><h2>{asset ? "حفظ التعديلات" : "تسجيل الأصل"}</h2><p>{asset ? "راجع البيانات المعدلة قبل حفظها في هذه الجلسة." : "بعد التسجيل سيظهر الأصل في قائمة الأصول."}</p><div className="form-code-preview"><span>كود الأصل</span><strong>{asset?.code || "يُنشأ بواسطة الخادم"}</strong></div><div className="form-submit-actions"><button className="secondary-button" type="button" onClick={onCancel}>إلغاء</button><button className="primary-button" type="submit"><Icon name="check" size={17} />{asset ? "حفظ التعديلات" : "تسجيل الأصل"}</button></div><div className="form-demo-note"><span>ⓘ</span>التغييرات تجريبية ولن تُحفظ بعد مغادرة الصفحة.</div></section>
          <section className="form-tip"><Icon name="scan" size={18} /><div><strong>البيانات الدقيقة تسهّل الجرد</strong><p>أضف الرقم المسلسل والموقع لتسهيل التحقق من الأصل لاحقًا.</p></div></section>
        </aside>
      </form>
    </div>
  );
}
