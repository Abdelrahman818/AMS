"use client";

import { useMemo, useState } from "react";
import { dateFormatter, normalizeDisplayData, numberFormatter, toWesternDigits } from "./number-format";
const EMPTY_DATASET = { columns: [], rows: [] };
const EMPTY_ROWS = [];

export default function WorkspaceModulePage({ moduleId, config, Icon: IconComponent, onNotify, onUpdateRows }) {
  const [activeTab, setActiveTab] = useState(config?.tabs?.[0]?.id || "");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [showForm, setShowForm] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [reportBuilt, setReportBuilt] = useState(false);
  const [reportDepartment, setReportDepartment] = useState("الكل");
  const [reportStatus, setReportStatus] = useState("الكل");
  const Icon = IconComponent;
  const dataset = config?.datasets?.[activeTab] || EMPTY_DATASET;
  const rows = dataset.rows || EMPTY_ROWS;
  const reportBuilder = moduleId === "reports" && activeTab === "builder";
  const reportDepartments = [...new Set((config?.datasets?.builder?.rows || []).map((row) => row.department).filter(Boolean))];
  const reportStatuses = [...new Set((config?.datasets?.builder?.rows || []).map((row) => row.status).filter(Boolean))];

  const visibleRows = useMemo(() => {
    let result = rows;
    if (moduleId === "notifications" && activeTab === "unread") {
      result = result.filter((row) => row.status !== "مقروء");
    }
    if (reportBuilder && !reportBuilt) return [];
    if (reportBuilder && reportDepartment !== "الكل") {
      result = result.filter((row) => row.department === reportDepartment);
    }
    if (reportBuilder && reportStatus !== "الكل") {
      result = result.filter((row) => row.status === reportStatus);
    }
    if (statusFilter !== "الكل") {
      result = result.filter((row) => row.status === statusFilter);
    }
    const query = toWesternDigits(search.trim()).toLocaleLowerCase("ar");
    return query
      ? result.filter((row) => Object.values(row).some((value) => String(value).toLocaleLowerCase("ar").includes(query)))
      : result;
  }, [activeTab, moduleId, reportBuilt, reportBuilder, reportDepartment, reportStatus, rows, search, statusFilter]);

  function exportRows() {
    if (!dataset.columns.length || !visibleRows.length) {
      onNotify("لا توجد بيانات مطابقة للتصدير.");
      return;
    }
    const csvRows = [
      dataset.columns.map((column) => column.label),
      ...visibleRows.map((row) => dataset.columns.map((column) => row[column.key] ?? "")),
    ];
    const content = csvRows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${moduleId}-${activeTab}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    onNotify("تم تنزيل البيانات الظاهرة بصيغة CSV.");
  }

  function handlePrimaryAction() {
    if (moduleId === "custody" && !dataset.formFields?.length) {
      setActiveTab("transfers");
      setShowForm(true);
      return;
    }
    if (dataset.bulkActionLabel) {
      const updatedRows = rows.map((row) => ({ ...row, status: "مقروء" }));
      onUpdateRows(moduleId, activeTab, updatedRows);
      onNotify(dataset.bulkActionMessage || "تم تحديث السجلات المعروضة.");
      return;
    }
    if (moduleId === "reports" && activeTab === "builder") {
      setReportBuilt(true);
      onNotify("تم إنشاء معاينة التقرير من بيانات JSON التجريبية.");
      return;
    }
    if (config.actionLabel?.includes("تصدير")) {
      exportRows();
      return;
    }
    if (dataset.formFields?.length) {
      setShowForm(true);
      return;
    }
    onNotify(dataset.rowActionMessage || "هذا الإجراء غير متاح في النسخة التجريبية.");
  }

  function handleCreate(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData.entries());
    const now = dateFormatter.format(new Date());
    const newRow = { id: `${moduleId}-${activeTab}-${Date.now()}`, ...normalizeDisplayData(values) };

    dataset.columns.forEach((column) => {
      if (newRow[column.key] !== undefined) return;
      if (column.key === "status") newRow[column.key] = dataset.newRowStatus || "جديد";
      else if (["createdBy", "requestedBy", "actor", "importedBy"].includes(column.key)) newRow[column.key] = "محمد عبدالله";
      else if (["date", "createdAt", "requestedAt", "lastRun", "finalizedAt"].includes(column.key)) newRow[column.key] = now;
      else if (["reference", "code", "employeeNumber"].includes(column.key)) newRow[column.key] = `D-${Date.now().toString().slice(-5)}`;
      else newRow[column.key] = "—";
    });

    onUpdateRows(moduleId, activeTab, [newRow, ...rows]);
    setShowForm(false);
    onNotify("تمت إضافة السجل إلى بيانات الجلسة التجريبية.");
  }

  function handleRowAction(row) {
    if (dataset.rowActionStatus) {
      onUpdateRows(
        moduleId,
        activeTab,
        rows.map((item) => item.id === row.id ? { ...item, status: dataset.rowActionStatus } : item),
      );
    } else {
      setDetailRecord(row);
    }
    onNotify(dataset.rowActionMessage || "تم تنفيذ الإجراء في وضع المعاينة.");
  }

  const actionLabel = dataset.bulkActionLabel || config.actionLabel || "إضافة سجل";
  const actionIcon = dataset.bulkActionLabel ? "check" : config.actionLabel?.includes("تصدير") ? "download" : "plus";
  const hasPrimaryAction = Boolean(
    dataset.bulkActionLabel
    || dataset.formFields?.length
    || config.actionLabel?.includes("تصدير")
    || moduleId === "custody",
  );

  return (
    <div className="workspace-module">
      <div className="page-heading module-page-heading">
        <div>
          <p className="eyebrow">{config.eyebrow}</p>
          <h1>{config.title}</h1>
          <p className="heading-subtitle">{config.description}</p>
        </div>
        {hasPrimaryAction && <button className={dataset.bulkActionLabel ? "secondary-button" : "primary-button"} onClick={handlePrimaryAction}>
          <Icon name={actionIcon} size={17} />{actionLabel}
        </button>}
      </div>

      <section className="module-stats-grid" aria-label="ملخص الوحدة">
        {(config.stats || []).map((stat) => (
          <article className="module-stat-card" key={stat.label}>
            <span className={`stat-icon ${stat.tone || "blue"}`}><Icon name={stat.icon || config.icon || "layers"} size={18} /></span>
            <div><small>{stat.label}</small><strong>{stat.value}</strong></div>
          </article>
        ))}
      </section>

      <nav className="module-tabs" role="tablist" aria-label={`أقسام ${config.title}`}>
        {(config.tabs || []).map((tab) => (
          <button
            key={tab.id}
            id={`module-tab-${moduleId}-${tab.id}`}
            className={`module-tab${activeTab === tab.id ? " active" : ""}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearch("");
              setStatusFilter("الكل");
              setReportBuilt(false);
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {reportBuilder && (
        <section className="panel report-builder-panel">
          <div className="module-section-heading">
            <span className="module-section-icon"><Icon name="filter" size={18} /></span>
            <div><h2>تحديد نطاق التقرير</h2><p>اختر الفلاتر لإنشاء معاينة قابلة للتصدير.</p></div>
          </div>
          <div className="report-filter-grid">
            <label className="form-field module-form-field"><span>الإدارة</span><select value={reportDepartment} onChange={(event) => setReportDepartment(event.target.value)}><option value="الكل">كل الإدارات</option>{reportDepartments.map((department) => <option key={department}>{department}</option>)}</select></label>
            <label className="form-field module-form-field"><span>الحالة</span><select value={reportStatus} onChange={(event) => setReportStatus(event.target.value)}><option value="الكل">كل الحالات</option>{reportStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
            <label className="form-field module-form-field"><span>الفترة</span><select defaultValue="month"><option value="month">هذا الشهر</option><option value="quarter">آخر 3 أشهر</option><option value="year">هذا العام</option></select></label>
            <button className="secondary-button report-preview-button" onClick={() => { setReportBuilt(true); onNotify("تم إنشاء معاينة التقرير من بيانات JSON التجريبية."); }}><Icon name="chart" size={16} />إنشاء معاينة</button>
          </div>
        </section>
      )}

      <section className="panel module-table-panel" role="tabpanel" aria-labelledby={`module-tab-${moduleId}-${activeTab}`}>
        <div className="module-table-heading">
          <div><h2>{config.tabs?.find((tab) => tab.id === activeTab)?.label || config.title}</h2><p>عرض {numberFormatter.format(visibleRows.length)} من {numberFormatter.format(rows.length)} سجل</p></div>
          {dataset.columns.length > 0 && <span className="module-record-count"><Icon name={config.icon || "layers"} size={16} />{numberFormatter.format(rows.length)} سجل</span>}
        </div>

        <div className="module-toolbar">
          <label className="search-field"><Icon name="search" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="البحث في السجلات" placeholder="ابحث في السجلات..." />{search && <button aria-label="مسح البحث" onClick={() => setSearch("")}><Icon name="close" size={14} /></button>}</label>
          {dataset.columns.some((column) => column.key === "status") && (
            <label className="filter-control"><Icon name="filter" size={15} /><select aria-label="تصفية حسب الحالة" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="الكل">كل الحالات</option>{[...new Set(rows.map((row) => row.status).filter(Boolean))].map((status) => <option key={status}>{status}</option>)}</select></label>
          )}
        </div>

        {visibleRows.length ? (
          <div className="table-scroll">
            <table className="module-table">
              <thead><tr>{dataset.columns.map((column) => <th key={column.key}>{column.label}</th>)}<th><span className="visually-hidden">الإجراء</span></th></tr></thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row.id}>
                    {dataset.columns.map((column) => (
                      <td key={column.key}>
                        {column.type === "status"
                          ? <span className={`status-pill ${statusClass(row[column.key])}`}><i />{row[column.key] || "غير محدد"}</span>
                          : <span className={column.key === "name" || column.key === "asset" || column.key === "title" ? "module-primary-cell" : ""}>{row[column.key] || "—"}</span>}
                      </td>
                    ))}
                    <td><button className="module-row-action" onClick={() => handleRowAction(row)}>{dataset.rowActionLabel || "عرض"}<Icon name="chevron" size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state module-empty-state">
            <span className="empty-icon"><Icon name={config.icon || "layers"} size={22} /></span>
            <strong>{reportBuilder && !reportBuilt ? "أنشئ معاينة لعرض النتائج" : "لا توجد سجلات مطابقة"}</strong>
            <p>{reportBuilder && !reportBuilt ? "تُعرض النتائج بعد اختيار نطاق التقرير." : "غيّر كلمات البحث أو خيارات التصفية لعرض السجلات."}</p>
          </div>
        )}

        <div className="module-table-footer"><span>بيانات توضيحية محمّلة من ملف JSON</span><span>{numberFormatter.format(visibleRows.length)} سجل</span></div>
      </section>

      {showForm && (
        <div className="module-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false); }}>
          <section className="module-dialog" role="dialog" aria-modal="true" aria-labelledby="module-dialog-title">
            <div className="module-dialog-heading"><div><p className="eyebrow">{config.title}</p><h2 id="module-dialog-title">{actionLabel}</h2></div><button className="icon-button" aria-label="إغلاق" onClick={() => setShowForm(false)}><Icon name="close" size={18} /></button></div>
            <p className="module-dialog-description">أدخل البيانات لإضافتها مؤقتًا إلى هذه الجلسة التجريبية.</p>
            <form className="module-dialog-form" onSubmit={handleCreate}>
              {(dataset.formFields || []).map((field) => (
                <label className={`form-field module-form-field${field.type === "textarea" ? " module-field-wide" : ""}`} key={field.name}>
                  <span>{field.label}{field.required && <b> *</b>}</span>
                  {field.type === "textarea"
                    ? <textarea name={field.name} rows="3" required={field.required} placeholder={field.placeholder || ""} />
                    : field.type === "select"
                      ? <select name={field.name} required={field.required} defaultValue=""><option value="" disabled>اختر</option>{(field.options || []).map((option) => <option key={option}>{option}</option>)}</select>
                      : <input name={field.name} type={field.type || "text"} required={field.required} placeholder={field.placeholder || ""} />}
                </label>
              ))}
              <div className="module-dialog-actions"><button className="secondary-button" type="button" onClick={() => setShowForm(false)}>إلغاء</button><button className="primary-button" type="submit"><Icon name="check" size={16} />حفظ تجريبي</button></div>
            </form>
          </section>
        </div>
      )}

      {detailRecord && (
        <div className="module-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetailRecord(null); }}>
          <section className="module-dialog module-record-dialog" role="dialog" aria-modal="true" aria-labelledby="module-record-title">
            <div className="module-dialog-heading"><div><p className="eyebrow">{config.title}</p><h2 id="module-record-title">تفاصيل السجل</h2></div><button className="icon-button" aria-label="إغلاق" onClick={() => setDetailRecord(null)}><Icon name="close" size={18} /></button></div>
            <dl className="module-record-details">{dataset.columns.map((column) => <div key={column.key}><dt>{column.label}</dt><dd>{detailRecord[column.key] || "—"}</dd></div>)}</dl>
            <div className="module-dialog-actions"><button className="primary-button" onClick={() => setDetailRecord(null)}>إغلاق</button></div>
          </section>
        </div>
      )}
    </div>
  );
}

function statusClass(status) {
  if (["نشط", "مكتمل", "جاهز", "ناجح", "مرتبط"].includes(status)) return "status-active";
  if (["جديد", "متاح"].includes(status)) return "status-warehouse";
  if (["مفقود", "مرفوض", "ملغى"].includes(status)) return "status-missing";
  if (["تحت الصيانة", "قيد التنفيذ"].includes(status)) return "status-maintenance";
  return "status-paused";
}
