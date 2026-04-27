
// DOSC Solution Architecture — React JSX
// Paste into any React environment with Tailwind or inline styles
// Dependencies: React 18, no external libraries needed

const { useState, useRef, useEffect } = React;

const C = {
  navy:  "#1B3A6B",
  teal:  "#007B85",
  tealL: "#e0f5f7",
  blue:  "#2E5FA3",
  slate: "#64748b",
  slateL:"#f8fafc",
  border:"#e2e8f0",
  green: "#16a34a",
  white: "#ffffff",
  purple:"#7C3AED",
  red:   "#DC2626",
  amber: "#b45309",
};

const Badge = ({ children, color = C.teal }) => (
  <span style={{
    display: "inline-block", background: color + "18", color,
    border: `1px solid ${color}44`, borderRadius: 4,
    padding: "2px 8px", fontSize: 11, fontWeight: 600, lineHeight: "18px",
  }}>{children}</span>
);

const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{
    background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10,
    padding: 18, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    cursor: onClick ? "pointer" : undefined, ...style,
  }}>{children}</div>
);

// ─── Arrow SVG ────────────────────────────────────────────────────────────────
const Arrow = ({ dir = "down", color = C.teal, size = 28 }) => {
  const isV = dir === "down";
  const w = isV ? 40 : size + 60;
  const h = isV ? size + 20 : 36;
  return (
    <svg width={w} height={h} style={{ display: "block", margin: "0 auto", overflow: "visible" }}>
      <style>{`
        .fa { animation: fd 0.8s linear infinite; }
        .fah { animation: fh 0.8s linear infinite; }
        @keyframes fd { 0%{stroke-dashoffset:24} 100%{stroke-dashoffset:0} }
        @keyframes fh { 0%{stroke-dashoffset:24} 100%{stroke-dashoffset:0} }
      `}</style>
      {isV ? (
        <>
          <line x1={w/2} y1={4} x2={w/2} y2={h-12}
            stroke={color} strokeWidth={2} strokeDasharray="6 4" className="fa" />
          <polygon points={`${w/2-5},${h-12} ${w/2+5},${h-12} ${w/2},${h-2}`} fill={color} />
        </>
      ) : (
        <>
          <line x1={4} y1={h/2} x2={w-12} y2={h/2}
            stroke={color} strokeWidth={2} strokeDasharray="6 4" className="fah" />
          <polygon points={`${w-12},${h/2-5} ${w-12},${h/2+5} ${w-2},${h/2}`} fill={color} />
        </>
      )}
    </svg>
  );
};

// ─── IP DATA ──────────────────────────────────────────────────────────────────
const IP_DATA = {
  "IP-1": {
    title: "F&B & Retail POS → Business Central", dir: "CMP → D365 BC", color: C.teal,
    desc: "Every F&B and retail POS transaction posts revenue, invoice, and UAE VAT to Business Central in real time — no batch, no delay.",
    flows: [
      { from: "F&B Bill Settled (CMP)",      to: "GL Revenue Line (BC)",        note: "Immediate on bill close" },
      { from: "UAE VAT calculated (CMP)",    to: "VAT Output Account (BC)",      note: "5% auto-applied per item" },
      { from: "Retail sale — Chandlery",     to: "Inventory & Revenue (BC)",     note: "Stock and revenue updated" },
      { from: "Member account charge (CMP)", to: "Customer AR Ledger (BC)",      note: "Deferred — end of month" },
      { from: "Credit note / refund (CMP)",  to: "Credit Memo (BC)",             note: "Reversal posted immediately" },
    ],
  },
  "IP-2": {
    title: "Membership & Contracts → Business Central", dir: "CMP → D365 BC", color: C.navy,
    desc: "Member and contract master data flows from CMP (source of truth) to Business Central for AR invoicing, deposits, and financial reporting.",
    flows: [
      { from: "New member created (CMP)",    to: "Customer Card (BC)",           note: "One-way sync on creation" },
      { from: "Membership fee raised (CMP)", to: "AR Invoice (BC)",              note: "Synced on invoice issue" },
      { from: "Security deposit received",   to: "Deposit Liability (BC)",       note: "Posted to balance sheet" },
      { from: "Deposit refund/write-off",    to: "Liability released (BC)",      note: "On CMP approval" },
      { from: "Contract renewal (CMP)",      to: "AR invoice & revenue (BC)",    note: "Annual or periodic" },
    ],
  },
  "IP-3": {
    title: "Marina & Boatyard → Business Central", dir: "CMP → D365 BC", color: C.blue,
    desc: "All marina operational revenue — berth fees, work orders, meter charges, crane lifts — consolidates into Business Central for financial reporting.",
    flows: [
      { from: "Berth contract invoice (CMP)", to: "AR & Revenue (BC)",           note: "On invoice creation" },
      { from: "Work order completed (CMP)",   to: "Labour + material revenue",   note: "By cost centre" },
      { from: "Meter reading charged (CMP)",  to: "Utility revenue line (BC)",   note: "Auto-invoiced by CMP" },
      { from: "Crane lift billed (CMP)",      to: "Boatyard revenue (BC)",       note: "Linked to work order" },
      { from: "Dry storage fee (CMP)",        to: "Storage revenue (BC)",        note: "Monthly or on-demand" },
    ],
  },
  "IP-4": {
    title: "HR & Payroll — Seamlessly Integrated with BC", dir: "Experts People 365 ↔ D365 BC", color: C.purple,
    seamless: true,
    desc: "Experts People 365 is built natively on the same D365 Business Central platform — same environment, same database, same user interface. There is no API call, no middleware, and no data sync. HR, payroll, and finance operate as a single unified system.",
    flows: [
      { from: "F&B / marina hours (CMP)",    to: "Payroll run (EP 365)",         note: "Timesheet import triggers payroll" },
      { from: "Payroll posted (EP 365)",     to: "GL cost centres (BC)",         note: "Native BC posting — no sync needed" },
      { from: "Leave approved (EP 365)",     to: "Payroll deduction (BC)",       note: "Seamless — same data layer" },
      { from: "EOSB provision (EP 365)",     to: "Liability ledger (BC)",        note: "Auto-posted per UAE Labour Law" },
      { from: "WPS SIF generated (EP 365)",  to: "Bank file / MOHRE",            note: "Single-click from within BC" },
    ],
  },
  "IP-5": {
    title: "Payment Gateway → CMP & Business Central", dir: "Gateway → CMP → BC", color: C.green,
    desc: "Card and online payments are processed by the payment gateway, auto-reconciled in CMP, and posted to Business Central bank accounts.",
    flows: [
      { from: "Card payment (member/guest)", to: "CMP payment record",           note: "Gateway tokenised" },
      { from: "CMP payment reconciled",      to: "Bank account (BC)",            note: "Auto-posted on settlement" },
      { from: "Online invoice payment",      to: "AR cleared (BC)",              note: "Member self-service via app" },
      { from: "Direct debit processed",      to: "Recurring AR cleared (BC)",    note: "Membership & berth fees" },
      { from: "Payment reversal/chargeback", to: "Reversal entry (BC)",          note: "Alert to finance team" },
    ],
  },
  "IP-6": {
    title: "Power BI — Seamlessly Integrated with BC", dir: "D365 BC → Power BI (native embed)", color: C.amber,
    seamless: true,
    desc: "Power BI is seamlessly embedded within D365 Business Central — no data export, no separate BI tool to log into. Dashboards are available directly inside BC pages and refresh automatically. Marina Master CMP also publishes its own operational dashboards. Together, management gets a full view: financial performance from BC and club operations from CMP.",
    flows: [
      { from: "Financial data (BC)",         to: "P&L / Balance Sheet reports",  note: "Auto-refresh — native embed" },
      { from: "Revenue by dept (BC)",        to: "Cost centre dashboard",        note: "Budget vs actual live" },
      { from: "Occupancy data (CMP)",        to: "Marina ops dashboard",         note: "Berth fill rate, movements" },
      { from: "Member data (CMP)",           to: "Membership analytics",         note: "Renewals, acquisition" },
      { from: "F&B revenue (CMP + BC)",      to: "F&B performance dashboard",    note: "By outlet, item, period" },
    ],
  },
  "IP-7": {
    title: "UAE E-Invoicing — Seamlessly Integrated with BC", dir: "D365 BC → UAE FTA (PEPPOL 5-Corner Model)", color: C.red,
    seamless: true,
    desc: "The BEMEA UAE E-Invoicing Connector is built natively inside D365 Business Central — no middleware, no separate portal. Every invoice raised in BC is automatically prepared and submitted to the UAE FTA through the PEPPOL 5-Corner Model.",
    fiveCorner: true,
    flows: [
      { from: "Corner 1 — Supplier", to: "DOSC as Seller", note: "When billing members, guests & vendors — DOSC originates the invoice in BC" },
      { from: "Corner 2 — Supplier's Service Provider", to: "BEMEA Connector", note: "Prepares the UBL 2.1 e-invoice and transmits on DOSC's behalf" },
      { from: "Corner 3 — Buyer's Service Provider", to: "Receives & delivers", note: "Delivers the cleared invoice to the buyer's system" },
      { from: "Corner 4 — Buyer", to: "DOSC as Buyer", note: "When receiving supplier invoices — DOSC is the buyer at Corner 4" },
      { from: "Corner 5 — Tax Authority", to: "UAE FTA", note: "Validates, clears & archives every invoice; optional validation checkpoint" },
    ],
  },
};

// ─── PILLAR DATA ──────────────────────────────────────────────────────────────
const PILLAR_DATA = [
  {
    num: "1", color: C.teal, title: "Club Management Platform", vendor: "Marina Master",
    meta: "35 years · 6 continents · 200+ active marina deployments · Regional refs: UAE (Yas Marina) & Qatar (Pearl Marina)",
    hosting: "DOSC-owned Microsoft Azure UAE environment",
    cats: [
      { cat: "Membership & CRM", items: [
        "Full member and vessel data with contract management",
        "Differentiated casual vs. permanent berth holder contracts",
        "CRM — segmentation, bulk email/SMS, account management",
        "Document storage with expiry alerts (insurance, licences)",
        "myMarina member portal — view contracts, pay invoices, track utilities",
      ]},
      { cat: "F&B POS (Integrated — no extra hardware)", items: [
        "Web-app / tablet POS — runs on standard tablet or PC, no bespoke hardware",
        "Table map with colour-coded occupancy and order routing to kitchen",
        "Split bills by item or amount; member account billing (tab to end of month)",
        "Kitchen Order Tickets (KOT) with KDS / printer routing per station",
        "Happy hour: time-based pricing rules applied automatically by schedule",
        "Member discounts: CMP member profile linked directly at point of sale",
        "Staff tabs — open, accumulate, settle at end of service",
        "F&B revenue flows to D365 BC via Integration Point IP-1 in real time",
        "F&B staff hours exported to Experts People 365 via IP-4 for payroll",
      ]},
      { cat: "Marina & Boatyard", items: [
        "Interactive graphical berth map with real-time colour-coded occupancy",
        "Dock walk — arrivals, departures, permanent/daily exits, movement history",
        "Calendar-based berth reservation with arrival/departure lists and alerts",
        "Crane planner — lift scheduling, notifications, linked work orders",
        "Dry storage allocation and boat movements",
        "Work orders with labour and materials tracking",
        "Meter readings — water & electricity with Excel import and auto-invoicing",
      ]},
      { cat: "Events, Retail & Gate Access", items: [
        "Event management — packages, seating, billing for regattas and social events",
        "Charter booking for vessels and rentable assets",
        "Retail POS — chandlery, fuel, bait & tackle, merchandise",
        "Gate access — face ID, CCTV, access card (CMP software layer; hardware by DOSC)",
        "Staff app — push notifications for bookings and crane plans",
      ]},
      { cat: "Dashboards & Analytics", items: [
        "Role-based customisable dashboards per department",
        "Standard and advanced reports with Excel / PDF export",
        "Drill-down from dashboard to individual transaction",
        "Customised SQL-based reports per DOSC requirements",
      ]},
    ],
    licensing: "USD 48 / berth / year · 1 location · Unlimited staff users · Support included (bugs, updates, new features)",
  },
  {
    num: "2", color: C.navy, title: "ERP Backbone", vendor: "Microsoft Dynamics 365 Business Central",
    meta: "Microsoft's flagship mid-market cloud ERP · BEMEA: 300+ UAE Dynamics implementations",
    hosting: "Microsoft Azure UAE North / South — Microsoft-managed SaaS",
    cats: [
      { cat: "Finance & Fixed Assets", items: [
        "General Ledger with multi-department cost centres",
        "Accounts Payable & Receivable with aging reports",
        "Bank reconciliation with automated matching",
        "Fixed assets with depreciation schedules and register",
        "Multi-currency support for club operations",
        "Budget management and variance reporting",
      ]},
      { cat: "Inventory & Procurement", items: [
        "Item master with full product catalogue",
        "Purchase orders with multi-level approval workflows",
        "Vendor management and preferred supplier pricing",
        "Stock management with reorder alerts",
        "Landed cost tracking and purchase price variance",
      ]},
      { cat: "UAE VAT & Corporate Tax", items: [
        "UAE VAT (5%) — tax invoices, credit notes, VAT return filing",
        "Corporate Tax provision calculations and reporting",
        "QR code generation on all sales invoices",
        "Full audit trail per FTA requirements",
        "All DOSC revenue streams mapped to tax codes",
      ]},
      { cat: "BEMEA UAE E-Invoicing Connector", items: [
        "UBL 2.1 / PEPPOL five-corner model (UAE mandate) — built natively in BC",
        "Real-time FTA submission — no manual upload required",
        "B2B and B2C invoice types supported with correct document type mapping",
        "Bi-directional FTA status tracking (accepted / rejected) in BC",
        "Covers all revenue: membership, marina, F&B, events, boatyard, retail",
        "All FTA regulatory updates at no extra cost (included in SaaS)",
      ]},
      { cat: "Power BI & Reporting", items: [
        "Embedded OOB Power BI dashboards (financial & operational)",
        "Budget vs actual variance reporting",
        "Drill-down from summary to transaction level",
        "Customised Power BI reports available on request",
        "Pulls data from both BC and CMP for unified management view",
      ]},
    ],
    licensing: "Essentials: USD 960/user/yr · Team Member: USD 96/user/yr · Power BI Pro: USD 168/user/yr · Quantities confirmed after role mapping",
  },
  {
    num: "3", color: C.blue, title: "HR & Payroll", vendor: "Experts People 365",
    meta: "UAE-localised HR & Payroll · Built natively on D365 BC · Same environment, same UI, same data platform",
    hosting: "Within D365 BC environment — no separate HR system to manage",
    cats: [
      { cat: "Employee Management", items: [
        "Employee records, contracts, job profiles, organisational structure",
        "Visa, Emirates ID, and passport expiry tracking with automated alerts",
        "Document management and compliance records",
        "Onboarding and offboarding workflows",
      ]},
      { cat: "Leave & Attendance", items: [
        "All UAE-mandated leave types — annual, sick, emergency, maternity",
        "Leave approval workflows and team calendar",
        "Timesheet import from CMP for payroll validation and job costing",
        "Department-level attendance and hours reports",
      ]},
      { cat: "UAE Payroll & Compliance", items: [
        "WPS-compliant payroll processing",
        "MOHRE Salary Information File (SIF) generation",
        "EOSB (End of Service Benefit) calculations per UAE Labour Law",
        "Departmental job costing from CMP timesheets",
        "MOHRE compliance reporting and audit trail",
      ]},
    ],
    licensing: "USD 2,000 / year / legal entity · BC Essentials licences for HR users (included in BC user count)",
  },
];

// ─── ARCH PAGE ────────────────────────────────────────────────────────────────
function ArchDiagram({ onIPClick, activeIP }) {
  const pillarStyle = (bg) => ({
    flex: 1, background: bg, color: "#fff", borderRadius: 10,
    padding: "16px 14px", minWidth: 0,
  });

  const SEAMLESS_IPS = ["IP-4", "IP-6", "IP-7"];
  const IPBadge = ({ id, dir = "down" }) => {
    const active = activeIP === id;
    const seamless = SEAMLESS_IPS.includes(id);
    const baseColor = seamless ? C.green : C.teal;
    return (
      <div onClick={(e) => { e.stopPropagation(); onIPClick(id); }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", minWidth: 54, flexShrink: 0 }}>
        <span style={{
          background: active ? baseColor : "#fff", color: active ? "#fff" : baseColor,
          border: `2px solid ${baseColor}`, borderRadius: 6, padding: "3px 7px",
          fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", transition: "all .15s",
          boxShadow: active ? `0 0 0 3px ${baseColor}33` : undefined,
        }}>{id}</span>
        <Arrow dir={dir} color={active ? baseColor : "#cbd5e1"} size={28} />
      </div>
    );
  };

  return (
    <div style={{ background: C.slateL, borderRadius: 14, padding: "20px 18px", marginBottom: 24 }}>
      {/* Members */}
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 16px", textAlign: "center", marginBottom: 4, fontSize: 13, color: C.slate, fontWeight: 600 }}>
        👥 DOSC Members & Staff &nbsp;·&nbsp; 📱 <strong>myMarina App</strong> (iOS & Android — included in CMP SaaS)
      </div>
      <Arrow dir="down" color={C.slate} size={18} />

      {/* Pillar row */}
      <div style={{ display: "flex", gap: 10, alignItems: "stretch", marginBottom: 4 }}>
        {/* Pillar 1 */}
        <div style={pillarStyle(C.teal)}>
          <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.75, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>Pillar 1</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Club Management Platform</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 10 }}>Marina Master</div>
          {["Membership & CRM", "Marina & Boatyard", "F&B POS (Integrated)", "Retail POS", "Events & Racing", "Gate Access", "myMarina App", "Staff App"].map(i => (
            <div key={i} style={{ background: "rgba(255,255,255,.18)", borderRadius: 4, padding: "3px 7px", fontSize: 11, marginBottom: 3 }}>{i}</div>
          ))}
        </div>

        {/* IP 1-2-3 */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 6, flexShrink: 0, width: 60 }}>
          <IPBadge id="IP-1" />
          <IPBadge id="IP-2" />
          <IPBadge id="IP-3" />
        </div>

        {/* Pillar 2 */}
        <div style={pillarStyle(C.navy)}>
          <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.75, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>Pillar 2</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>ERP Backbone</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 10 }}>D365 Business Central</div>
          {["Finance & GL", "AP / AR", "Fixed Assets", "Inventory & Procurement", "UAE VAT (5%)", "UAE E-Invoicing", "Cost Centres", "Power BI"].map(i => (
            <div key={i} style={{ background: "rgba(255,255,255,.18)", borderRadius: 4, padding: "3px 7px", fontSize: 11, marginBottom: 3 }}>{i}</div>
          ))}
        </div>

        {/* IP-4 */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 6, flexShrink: 0, width: 60 }}>
          <IPBadge id="IP-4" />
        </div>

        {/* Pillar 3 */}
        <div style={pillarStyle(C.blue)}>
          <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.75, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>Pillar 3</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>HR & Payroll</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 10 }}>Experts People 365 (on D365 BC)</div>
          {["Employee Records", "Leave Management", "WPS Payroll", "EOSB", "MOHRE SIF", "Visa Tracking", "Timesheet Import", "Org Structure"].map(i => (
            <div key={i} style={{ background: "rgba(255,255,255,.18)", borderRadius: 4, padding: "3px 7px", fontSize: 11, marginBottom: 3 }}>{i}</div>
          ))}
        </div>
      </div>

      {/* Downward IPs from P2 */}
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }} />
        <div style={{ width: 60 }} />
        <div style={{ flex: 1, display: "flex", justifyContent: "space-around" }}>
          <IPBadge id="IP-5" dir="down" />
          <IPBadge id="IP-6" dir="down" />
          <IPBadge id="IP-7" dir="down" />
        </div>
        <div style={{ width: 60 }} />
        <div style={{ flex: 1 }} />
      </div>

      {/* External tier */}
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <div style={{ flex: 1 }} />
        <div style={{ width: 60 }} />
        <div style={{ flex: 1, display: "flex", gap: 8 }}>
          {[
            { bg: "#fffbeb", bc: "#fcd34d", tc: "#92400e", icon: "💳", t: "Payment Gateway", s: "Stripe / Network Int'l" },
            { bg: "#f0fdf4", bc: "#86efac", tc: "#166534", icon: "📊", t: "Power BI", s: "All-pillar dashboards" },
            { bg: "#fef2f2", bc: "#fca5a5", tc: "#991b1b", icon: "🏛️", t: "UAE FTA (PEPPOL)", s: "Real-time e-invoicing" },
          ].map(x => (
            <div key={x.t} style={{ flex: 1, background: x.bg, border: `1px solid ${x.bc}`, borderRadius: 8, padding: "9px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 16, marginBottom: 3 }}>{x.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: x.tc }}>{x.t}</div>
              <div style={{ fontSize: 11, color: x.tc, opacity: 0.8, marginTop: 2 }}>{x.s}</div>
            </div>
          ))}
        </div>
        <div style={{ width: 60 }} />
        <div style={{ flex: 1 }} />
      </div>

      {/* Azure */}
      <div style={{ background: "#fff", border: `2px dashed ${C.teal}`, borderRadius: 8, padding: "10px 14px", marginTop: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
          ☁️ Microsoft Azure UAE — UAE North / UAE South · DOSC-Owned Infrastructure
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["ISO/IEC 27001:2013", "Dubai DESC CSP", "SOC 1 & SOC 2 Type II", "MFA Enforced", "Geo-Redundant DR", "UAE Data Sovereignty"].map(t => (
            <span key={t} style={{ background: C.slateL, border: `1px solid ${C.teal}44`, borderRadius: 4, padding: "3px 8px", fontSize: 11, color: "#334155" }}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ background: C.teal, color: "#fff", border: `2px solid ${C.teal}`, borderRadius: 6, padding: "2px 7px", fontSize: 10, fontWeight: 700 }}>IP-x</span>
          <span style={{ fontSize: 11, color: C.slate }}>API Integration</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ background: C.green, color: "#fff", border: `2px solid ${C.green}`, borderRadius: 6, padding: "2px 7px", fontSize: 10, fontWeight: 700 }}>IP-x</span>
          <span style={{ fontSize: 11, color: C.slate }}>Seamless Integration (native, no middleware)</span>
        </div>
        <span style={{ fontSize: 11, color: C.slate }}>· Click any badge for details</span>
      </div>
    </div>
  );
}

function IPDetail({ id }) {
  if (!id) return (
    <div style={{ background: C.slateL, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, textAlign: "center", color: C.slate, fontSize: 13 }}>
      👆 Click any <strong style={{ color: C.teal }}>IP badge</strong> in the diagram above to see the integration detail
    </div>
  );
  const d = IP_DATA[id];
  const isSeamless = !!d.seamless;
  const isFiveCorner = !!d.fiveCorner;

  return (
    <div style={{ background: "#fff", border: `2px solid ${d.color}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{ background: d.color, padding: "14px 20px", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, letterSpacing: 0.8, textTransform: "uppercase" }}>{id}</div>
          {isSeamless && (
            <span style={{
              background: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.5)",
              borderRadius: 12, padding: "1px 9px", fontSize: 10, fontWeight: 700,
              letterSpacing: 0.5, textTransform: "uppercase",
            }}>✦ Seamless Integration</span>
          )}
          {!isSeamless && (
            <span style={{
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)",
              borderRadius: 12, padding: "1px 9px", fontSize: 10, fontWeight: 700,
              letterSpacing: 0.5, textTransform: "uppercase",
            }}>⇄ API Integration</span>
          )}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{d.title}</div>
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 3, fontStyle: "italic" }}>{d.dir}</div>
        <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 8, lineHeight: 1.5 }}>{d.desc}</div>
      </div>
      <div style={{ padding: "16px 20px" }}>
        {isFiveCorner ? (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 14 }}>
              The 5-Corner Model — How DOSC Participates
            </div>
            {/* Role callout */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {[
                { corner: "Corner 1", role: "DOSC as Seller", icon: "🏢", desc: "When billing members, guests, or third parties — DOSC originates the invoice in BC. The connector handles everything from there automatically.", highlight: true },
                { corner: "Corner 4", role: "DOSC as Buyer", icon: "📥", desc: "When receiving invoices from suppliers — DOSC sits at Corner 4, receiving the FTA-cleared e-invoice from the supplier's service provider.", highlight: true },
              ].map(r => (
                <div key={r.corner} style={{
                  flex: 1, background: `${d.color}10`,
                  border: `1.5px solid ${d.color}`,
                  borderRadius: 8, padding: "12px 14px",
                }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{r.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: d.color, textTransform: "uppercase", letterSpacing: 0.6 }}>{r.corner}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 4 }}>{r.role}</div>
                  <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.5 }}>{r.desc}</div>
                </div>
              ))}
            </div>
            {/* 5-corner chain */}
            <div style={{ fontSize: 12, fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 }}>The 5-Corner Chain</div>
            <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
              {d.flows.map((f, i) => {
                // Highlight corners where DOSC plays a role (0=Corner1, 3=Corner4) and FTA (4=Corner5)
                const isDosc = i === 0 || i === 3;
                const isFta = i === 4;
                const highlight = isDosc || isFta;
                const borderColor = isFta ? "#6366f1" : isDosc ? d.color : C.border;
                const bgColor = isFta ? "#eef2ff" : isDosc ? `${d.color}12` : C.slateL;
                const labelColor = isFta ? "#4338ca" : isDosc ? d.color : C.slate;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                    <div style={{
                      background: bgColor,
                      border: `1.5px solid ${borderColor}`,
                      borderRadius: 8, padding: "8px 12px", textAlign: "center", minWidth: 130,
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: labelColor, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
                        {f.from.split("—")[0].trim()}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>
                        {f.from.split("—")[1]?.trim() || f.from}
                      </div>
                      <div style={{ fontSize: 11, color: "#334155", marginTop: 3 }}>{f.to}</div>
                      <div style={{ fontSize: 10, color: C.slate, marginTop: 4, fontStyle: "italic", lineHeight: 1.4 }}>{f.note}</div>
                    </div>
                    {i < d.flows.length - 1 && (
                      <div style={{ color: d.color, fontWeight: 700, fontSize: 18, padding: "0 4px", flexShrink: 0 }}>→</div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 }}>
              {isSeamless ? "How It Works" : "Data Flow"}
            </div>
            {d.flows.map((f, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1fr 28px 1fr auto",
                alignItems: "center", gap: 8,
                padding: "8px 10px", background: i % 2 === 0 ? C.slateL : "#fff",
                borderRadius: 6, marginBottom: 4,
              }}>
                <div style={{ fontSize: 12.5, color: C.navy, fontWeight: 600 }}>{f.from}</div>
                <div style={{ textAlign: "center", color: d.color, fontWeight: 700, fontSize: 14 }}>→</div>
                <div style={{ fontSize: 12.5, color: "#334155" }}>{f.to}</div>
                <div><Badge color={d.color}>{f.note}</Badge></div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function PillarBreakdown() {
  const [active, setActive] = useState(0);
  const [openCat, setOpenCat] = useState(null);
  const p = PILLAR_DATA[active];

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {PILLAR_DATA.map((pl, i) => (
          <button key={i} onClick={() => { setActive(i); setOpenCat(null); }} style={{
            flex: 1, padding: "12px 10px", border: `2px solid ${i === active ? pl.color : C.border}`,
            borderRadius: 8, background: i === active ? pl.color : "#fff",
            color: i === active ? "#fff" : C.slate, cursor: "pointer", transition: "all .15s", textAlign: "left",
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, opacity: i === active ? 0.8 : 0.6, letterSpacing: 1, textTransform: "uppercase" }}>Pillar {pl.num}</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{pl.title}</div>
            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 1 }}>{pl.vendor}</div>
          </button>
        ))}
      </div>

      <div style={{ border: `2px solid ${p.color}22`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ background: p.color, color: "#fff", padding: "14px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Pillar {p.num}</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{p.title}</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>{p.vendor} · {p.meta}</div>
          <div style={{ marginTop: 8, background: "rgba(255,255,255,.15)", display: "inline-block", padding: "3px 10px", borderRadius: 5, fontSize: 11 }}>
            ☁️ {p.hosting}
          </div>
        </div>
        <div style={{ padding: 16, background: "#fff" }}>
          {p.cats.map((c, ci) => (
            <div key={c.cat} style={{ marginBottom: 8, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
              <button onClick={() => setOpenCat(openCat === ci ? null : ci)} style={{
                width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "11px 14px", background: openCat === ci ? p.color + "18" : "#fff",
                border: "none", cursor: "pointer", textAlign: "left",
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: openCat === ci ? p.color : C.navy }}>{c.cat}</span>
                <span style={{ color: p.color, fontWeight: 700, fontSize: 16 }}>{openCat === ci ? "▲" : "▼"}</span>
              </button>
              {openCat === ci && (
                <div style={{ padding: "10px 14px 14px", background: C.slateL }}>
                  {c.items.map(item => (
                    <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6, fontSize: 12.5, color: "#334155" }}>
                      <span style={{ color: p.color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>·</span>
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div style={{ marginTop: 12, background: `${p.color}10`, border: `1px solid ${p.color}30`, borderRadius: 7, padding: "10px 14px", fontSize: 12.5, color: p.color }}>
            <strong>Licensing: </strong>{p.licensing}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArchPage() {
  const [activeIP, setActiveIP] = useState(null);
  const ipRef = useRef(null);

  const handleIPClick = (id) => {
    setActiveIP(prev => prev === id ? null : id);
    setTimeout(() => ipRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  };

  const ownerRows = [
    ["Membership & CRM", "CMP — Marina Master", "Member lifecycle, vessel profiles, contracts, CRM, myMarina app, bulk email/SMS"],
    ["Sailing, Events & Racing", "CMP — Marina Master", "Race management, sailing school, regatta scheduling, event packages and billing"],
    ["Marina & Boat Yard", "CMP — Marina Master", "Berth map, reservations, dock walk, cranes, dry storage, work orders, meters"],
    ["Food & Beverage POS", "CMP — Marina Master (integrated)", "Table service, KOT, split bills, happy hour pricing, member discounts, staff tabs"],
    ["Retail & Gate Access", "CMP — Marina Master", "Retail POS, chandlery, face ID / access card / CCTV (software; hardware by DOSC)"],
    ["Inventory & Procurement", "Dynamics 365 Business Central", "Purchase orders, vendor mgmt, approval workflows, item master, stock control"],
    ["Finance & Fixed Assets", "Dynamics 365 Business Central", "GL, AP/AR, cost centres, bank recon, fixed assets, multi-currency, budgeting"],
    ["UAE VAT & E-Invoicing", "D365 BC + BEMEA Connector", "5% VAT, corporate tax, PEPPOL UBL 2.1, real-time FTA submission, QR codes"],
    ["HR & Payroll", "Experts People 365 (on D365 BC)", "WPS payroll, EOSB, MOHRE SIF, leave management, visa tracking, timesheets"],
    ["Reporting & Analytics", "Power BI + CMP Dashboards", "Financial, operational, membership, F&B dashboards; budget vs actual"],
  ];

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.navy, letterSpacing: "-0.3px" }}>Solution Architecture & Data Flow</h2>
        <p style={{ fontSize: 13, color: C.slate, marginTop: 4 }}>
          Three purpose-built pillars connected through seven integration points — all on Azure UAE. Click any IP badge to trace the exact data flow.
        </p>
      </div>

      <ArchDiagram onIPClick={handleIPClick} activeIP={activeIP} />

      <div ref={ipRef} style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 10 }}>
          {activeIP ? `Integration Point Detail — ${activeIP}` : "Integration Point Detail"}
        </div>
        <IPDetail id={activeIP} />
      </div>

      <div style={{ borderTop: `2px solid ${C.border}`, paddingTop: 28, marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Pillar Breakdown</h2>
        <p style={{ fontSize: 13, color: C.slate, marginBottom: 20 }}>
          Full feature scope for each pillar. Select a pillar, then expand each capability category.
        </p>
        <PillarBreakdown />
      </div>

      <div style={{ borderTop: `2px solid ${C.border}`, paddingTop: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 4 }}>System Ownership by Department</h2>
        <p style={{ fontSize: 13, color: C.slate, marginBottom: 16 }}>Every DOSC function mapped to its owning system.</p>
        <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}` }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["DOSC Function", "System Owner", "Key Capabilities"].map(h => (
                  <th key={h} style={{ background: C.navy, color: "#fff", padding: "9px 12px", textAlign: "left", fontSize: 12, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ownerRows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : C.slateL }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{
                      padding: "8px 12px", borderBottom: `1px solid ${C.border}`,
                      verticalAlign: "top", lineHeight: 1.45, fontSize: 13,
                      fontWeight: ci === 0 ? 700 : 400, color: ci === 0 ? C.navy : "#334155",
                    }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── OPS PAGE ─────────────────────────────────────────────────────────────────
function TimelineSection() {
  const [active, setActive] = useState(0);
  const phases = [
    { num: 1, icon: "🔍", title: "Discovery & Kickoff", weeks: "Weeks 1–3", color: "#0891b2",
      acts: [
        "Joint kickoff — all three pillars with DOSC stakeholders simultaneously",
        "Requirements workshops per department (Marina, Finance, F&B, HR, Events)",
        "FRDD for all three pillars — functional requirements design document",
        "Data migration assessment — inventory of existing system data",
        "Integration mapping — confirm and agree all 7 integration points",
        "Chart of accounts and multi-department cost centre design",
        "Azure UAE environment provisioning (CMP on DOSC-owned Azure; BC on Microsoft)",
      ]},
    { num: 2, icon: "⚙️", title: "Configuration & Setup", weeks: "Weeks 3–8", color: C.teal,
      acts: [
        "BC: Finance module (GL, AP/AR, cost centres, fixed assets, budgeting)",
        "BC: Inventory & Procurement configuration",
        "BC: UAE VAT and BEMEA E-Invoicing Connector — FTA API registration",
        "CMP: Marina setup — berths, contracts, tariffs, meter configuration",
        "CMP: F&B POS — table map, KOT routing, happy hour rules, member pricing, staff tabs",
        "CMP: Gate access, events, crane planner, work order configuration",
        "Experts People 365: employees, leave types, WPS structure, EOSB rules",
      ]},
    { num: 3, icon: "🔗", title: "Integration Build & Test", weeks: "Weeks 7–11", color: C.navy,
      acts: [
        "Build and test all 7 integration points (CMP ↔ BC, EP 365, FTA, Power BI)",
        "F&B end-to-end: POS bill → GL → VAT posting → FTA e-invoice submission",
        "Timesheet export to Experts People 365 — WPS payroll calculation validation",
        "myMarina member app configuration and testing",
        "Payment gateway (Stripe / Network International) integration and test",
        "Power BI dashboard development (financial, operational, F&B, membership)",
        "System Integration Testing (SIT) — end-to-end transaction flows",
      ]},
    { num: 4, icon: "🧪", title: "Data Migration & UAT", weeks: "Weeks 10–14", color: C.blue,
      acts: [
        "Migration: member and customer data from existing system",
        "Migration: vessel records, berth contracts, historical reservations",
        "Migration: financial opening balances and AR open items",
        "UAT: F&B POS — split bills, happy hour rules, member discount, KOT flow",
        "UAT: Finance — GL postings, VAT reporting, e-invoice submission to FTA",
        "UAT: HR — payroll run, leave approval, timesheet import",
        "DOSC department head sign-off on all modules",
      ]},
    { num: 5, icon: "🎓", title: "Training", weeks: "Weeks 13–15", color: C.purple,
      acts: [
        "Train-the-trainer: Marina Operations (CMP, dock walk, reservations, gate)",
        "Train-the-trainer: Finance (BC, VAT, purchasing, fixed assets, reporting)",
        "Train-the-trainer: F&B (POS, table management, KOT, happy hour, end-of-day close)",
        "Train-the-trainer: HR (EP 365 — leave, payroll, visa tracking, timesheets)",
        "Train-the-trainer: Events & Reporting (CMP, Power BI dashboards)",
        "Training materials and user guides in electronic format",
        "100% nominated trainer attendance required before go-live",
      ]},
    { num: 6, icon: "🚀", title: "Go-Live & Hypercare", weeks: "Weeks 15–16", color: C.red,
      acts: [
        "Production environment cutover from existing system",
        "Parallel run period — both systems active simultaneously",
        "BEMEA and CMP vendor on-floor go-live support daily",
        "Final data migration cutover (open balances, active reservations)",
        "Daily issue resolution and escalation process active",
        "Go-live checklist completion and formal DOSC sign-off",
        "Transition to ongoing support and Annual Maintenance Contract",
      ]},
  ];
  const ph = phases[active];

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Implementation Timeline</h2>
      <p style={{ fontSize: 13, color: C.slate, marginBottom: 20 }}>
        Microsoft Sure Step + Success by Design. All three pillars implemented concurrently — <strong>3 to 4 months</strong> total.
      </p>

      <div style={{ display: "flex", gap: 0, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
        {phases.map((p, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            flex: 1, padding: "10px 4px", border: "none", borderRight: `1px solid ${C.border}`,
            background: active === i ? p.color : "#fff", color: active === i ? "#fff" : C.slate,
            cursor: "pointer", transition: "all .15s",
          }}>
            <div style={{ fontSize: 18, marginBottom: 2 }}>{p.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700 }}>Ph {p.num}</div>
            <div style={{ fontSize: 10, opacity: 0.85 }}>{p.weeks}</div>
          </button>
        ))}
      </div>

      <Card style={{ borderTop: `3px solid ${ph.color}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: ph.color, textTransform: "uppercase", letterSpacing: 0.5 }}>Phase {ph.num}</span>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.navy, marginTop: 2 }}>{ph.icon} {ph.title}</div>
          </div>
          <Badge color={ph.color}>{ph.weeks}</Badge>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {ph.acts.map(a => (
            <div key={a} style={{ display: "flex", gap: 8, alignItems: "flex-start", background: C.slateL, borderRadius: 6, padding: "8px 12px", fontSize: 12.5, color: "#334155" }}>
              <span style={{ color: ph.color, fontWeight: 700, flexShrink: 0 }}>→</span>{a}
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Key Milestones</div>
          {[["Project Kickoff & Discovery", "Week 3"], ["FRDD Sign-off (all pillars)", "Week 8"],
            ["Integration Testing Complete", "Week 11"], ["UAT Sign-off", "Week 14"],
            ["Training Complete", "Week 15"], ["Go-Live", "Weeks 15–16"]].map(([m, w]) => (
            <div key={m} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, padding: "7px 0", fontSize: 12.5 }}>
              <span style={{ color: "#334155" }}>{m}</span>
              <span style={{ color: C.teal, fontWeight: 700 }}>{w}</span>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Support & Warranty</div>
          {[["CMP (Marina Master)", "Included in SaaS — bugs, updates, new features"],
            ["D365 BC & EP 365", "12-month post go-live bug warranty (BEMEA)"],
            ["Support hours", "UAE-based · Mon–Fri · 9 AM – 5 PM GST"],
            ["Post-warranty", "Annual Maintenance Contract (AMC) available"]].map(([l, v]) => (
            <div key={l} style={{ borderBottom: `1px solid ${C.border}`, padding: "7px 0", fontSize: 12.5 }}>
              <div style={{ fontWeight: 700, color: C.navy, marginBottom: 1 }}>{l}</div>
              <div style={{ color: "#475569" }}>{v}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function ComplianceSection() {
  const groups = [
    { id: "uae", label: "📋 UAE Regulatory", rows: [
      ["UAE VAT (5%)", "D365 BC Native", "Tax invoices, credit notes, input/output VAT, VAT return filing"],
      ["UAE E-Invoicing — PEPPOL 5-corner", "BEMEA Connector (in BC)", "UBL 2.1, QR codes, real-time FTA submission, B2B & B2C coverage"],
      ["UAE Corporate Tax", "D365 BC Native", "CT provision calculations and financial reporting"],
      ["WPS — Wages Protection System", "Experts People 365", "WPS-compliant payroll processing; MOHRE SIF file generation"],
      ["EOSB — End of Service Benefit", "Experts People 365", "Automated EOSB calculations per UAE Labour Law"],
      ["CDA Reporting", "D365 BC", "Club-specific compliance reporting capability"],
    ]},
    { id: "sec", label: "🔒 Security Certs", rows: [
      ["ISO/IEC 27001:2013", "Microsoft Azure & D365", "Information security management system"],
      ["ISO/IEC 27017:2015", "Microsoft Azure", "Cloud-specific security controls"],
      ["Dubai DESC CSP Standard", "Microsoft Azure", "Certified for UAE government / semi-government entities"],
      ["CSA STAR Level 2", "Microsoft Azure", "Cloud security assessment and attestation"],
      ["SOC 1 & SOC 2 Type II", "Microsoft Azure & D365", "Audited cloud operational controls"],
      ["MFA & RBAC Enforced", "All Pillars", "Multi-factor authentication and role-based access control"],
    ]},
    { id: "data", label: "🗄️ Data Governance", rows: [
      ["UAE Data Sovereignty", "All Three Pillars", "CMP, BC, and EP 365 all on Azure UAE North / South"],
      ["DOSC-Owned Infrastructure", "CMP", "CMP deployed on DOSC-owned Azure — DOSC owns all data"],
      ["Full Audit Trail", "All Pillars", "Every transaction: user, timestamp, change history logged immutably"],
      ["Segregation of Duties", "D365 BC", "Role-based access with enforced approval workflows"],
      ["Geo-Redundant DR", "Microsoft Azure", "Automated daily backups with geo-redundant disaster recovery"],
      ["Encryption at Rest & Transit", "All Pillars", "Full encryption across all systems and all data transfers"],
    ]},
  ];
  const [ag, setAg] = useState("uae");
  const g = groups.find(x => x.id === ag);

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Compliance & Security</h2>
      <p style={{ fontSize: 13, color: C.slate, marginBottom: 16 }}>Full UAE regulatory compliance and certified Azure security across all three pillars.</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {groups.map(gr => (
          <button key={gr.id} onClick={() => setAg(gr.id)} style={{
            flex: 1, padding: "10px 12px", border: `2px solid ${ag === gr.id ? C.navy : C.border}`,
            borderRadius: 8, background: ag === gr.id ? C.navy : "#fff",
            color: ag === gr.id ? "#fff" : C.slate, cursor: "pointer", transition: "all .15s",
            fontSize: 13, fontWeight: 700,
          }}>{gr.label}</button>
        ))}
      </div>
      <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}` }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>{["Standard / Area", "Managed By", "Details"].map(h => (
              <th key={h} style={{ background: C.navy, color: "#fff", padding: "9px 12px", textAlign: "left", fontSize: 12, fontWeight: 600 }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {g.rows.map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : C.slateL }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: "8px 12px", borderBottom: `1px solid ${C.border}`, verticalAlign: "top", lineHeight: 1.4, fontSize: 13, fontWeight: ci === 0 ? 700 : 400, color: ci === 0 ? C.navy : "#334155" }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PricingSection() {
  const [open, setOpen] = useState(null);
  const items = [
    { title: "Club Management Platform (Marina Master)", type: "Annual Recurring", color: C.teal, price: "USD 48 / berth / year",
      rows: [["Scope", "1 location — DOSC UAE"], ["Included", "Unlimited staff users · myMarina member app · Dashboards · Support (bugs, updates, new features)"], ["F&B POS", "Included in CMP SaaS — no additional POS vendor cost, no bespoke hardware"], ["Implementation", "TBC after discovery, demo & module selection"], ["Note", "Priced per berth (rentable spot), not per user. Final berth count confirmed at discovery."]] },
    { title: "Dynamics 365 Business Central — Licences", type: "Annual Recurring", color: C.navy, price: "From USD 96 / user / year",
      rows: [["Essentials (full user)", "USD 960 / user / year"], ["Team Member", "USD 96 / user / year"], ["Power BI Pro", "USD 168 / user / year"], ["Implementation", "TBC after discovery · USD 500/day onsite · USD 450/day offsite"], ["Note", "User quantities confirmed after discovery and role mapping."]] },
    { title: "Experts People 365 — HR & Payroll", type: "Annual Recurring", color: C.blue, price: "USD 2,000 / year / legal entity",
      rows: [["Included", "WPS payroll · EOSB · MOHRE SIF · Leave management · Visa tracking · Timesheet import from CMP"], ["BC Licences", "HR users use D365 BC Essentials — included in BC user count above"], ["Implementation", "TBC after discovery and module scoping"]] },
    { title: "BEMEA UAE E-Invoicing Connector", type: "Annual + One-Time Setup", color: C.red, price: "TBC at RFP stage",
      rows: [["Annual SaaS", "Per legal entity subscription"], ["One-time", "FTA API setup and testing fee"], ["Included", "All FTA regulatory updates under SaaS at no extra cost"], ["Coverage", "Membership, marina, F&B, events, boatyard, retail"]] },
  ];

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Indicative Pricing Model</h2>
      <p style={{ fontSize: 13, color: C.slate, marginBottom: 16 }}>
        For budget planning only. Final fixed pricing presented in the formal RFP response after discovery and module selection.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {items.map((item, i) => (
          <div key={i} onClick={() => setOpen(open === i ? null : i)} style={{
            background: "#fff", border: `2px solid ${open === i ? item.color : C.border}`,
            borderRadius: 10, overflow: "hidden", cursor: "pointer", transition: "all .15s",
            boxShadow: open === i ? `0 4px 12px ${item.color}22` : undefined,
          }}>
            <div style={{ borderTop: `4px solid ${item.color}`, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: item.color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{item.type}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: item.color }}>{item.price}</div>
              <div style={{ fontSize: 12, color: C.slate, marginTop: 6 }}>{open === i ? "▲ Hide detail" : "▼ Show detail"}</div>
            </div>
            {open === i && (
              <div style={{ padding: "0 16px 14px", borderTop: `1px solid ${C.border}` }}>
                {item.rows.map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12.5 }}>
                    <span style={{ fontWeight: 700, color: C.navy, minWidth: 110, flexShrink: 0 }}>{k}</span>
                    <span style={{ color: "#475569", lineHeight: 1.45 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <Card style={{ background: C.slateL }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Total Cost of Ownership Notes</div>
        <div style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.7 }}>
          All pricing is indicative for budget planning. Final fixed pricing will be presented in the formal RFP response following the discovery workshop and FRDD sign-off.
          The <strong>F&B POS module is included within the CMP SaaS licence</strong> — no separate POS vendor, no additional hardware cost.
          One-time implementation costs across all three pillars are confirmed after the discovery call and requirements scoping.
        </div>
      </Card>
    </div>
  );
}

function OpsPage() {
  return (
    <div>
      <TimelineSection />
      <ComplianceSection />
      <PricingSection />
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
const PAGES = [
  { id: "arch", label: "Architecture & Data Flow" },
  { id: "ops",  label: "Timeline, Compliance & Pricing" },
];

export default function DOSCArchitecture() {
  const [page, setPage] = useState("arch");

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ background: C.navy, padding: "18px 28px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#B8D4E0", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 3 }}>
              Dubai Offshore Sailing Club
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
              ERP & Club Management Platform
            </h1>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", marginTop: 3 }}>
              Solution Architecture Briefing &nbsp;·&nbsp; Business Experts MEA LLC &nbsp;·&nbsp; April 2026
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "flex-start" }}>
            {["3 Pillars", "7 Integration Points", "Azure UAE", "3–4 Month Timeline", "UAE PEPPOL Ready"].map(b => (
              <span key={b} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.25)", borderRadius: 4, padding: "3px 9px", fontSize: 11, color: "rgba(255,255,255,.85)", fontWeight: 500 }}>{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Page nav */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", padding: "0 24px" }}>
          {PAGES.map(p => (
            <button key={p.id} onClick={() => setPage(p.id)} style={{
              padding: "12px 20px", border: "none",
              borderBottom: `3px solid ${page === p.id ? C.teal : "transparent"}`,
              background: "transparent", color: page === p.id ? C.navy : C.slate,
              fontWeight: page === p.id ? 700 : 500, fontSize: 14,
              cursor: "pointer", transition: "all .15s", whiteSpace: "nowrap",
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1020, margin: "0 auto", padding: "28px 24px 56px" }}>
        {page === "arch" ? <ArchPage /> : <OpsPage />}
      </div>
    </div>
  );
}
