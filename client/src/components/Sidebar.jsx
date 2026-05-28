import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const REPORT_MODULES = [
  {
    id: '7-1-nattakit',
    label: 'Nattakit',
    reports: [
      { to: '/reports/membership-subscriptions-list', label: 'Report 1' },
      { to: '/reports/membership-subscription-print', label: 'Report 2' },
      { to: '/reports/revenue-by-package', label: 'Report 3' },
    ],
  },
  {
    id: '7-2-phittayanan',
    label: 'Phittayanan',
    reports: [
      { to: '/reports/training-bookings-list', label: 'Report 1' },
      { to: '/reports/training-booking-print', label: 'Report 2' },
      { to: '/reports/revenue-by-trainer', label: 'Report 3' },
    ],
  },
  {
    id: '7-3-ashira',
    label: 'Ashira',
    reports: [
      { to: '/reports/merchandise-invoices-list', label: 'Report 1' },
      { to: '/reports/merchandise-invoice-print', label: 'Report 2' },
      { to: '/reports/revenue-by-product', label: 'Report 3' },
    ],
  },
  {
    id: '7-4-chanaphath',
    label: 'Chanaphath',
    reports: [
      { to: '/reports/payment-receipts-list', label: 'Report 1' },
      { to: '/reports/payment-receipt-detail', label: 'Report 2' },
      { to: '/reports/payments-by-method', label: 'Report 3' },
    ],
  },
  {
    id: '7-5-phuttipong',
    label: 'Phuttipong',
    reports: [
      { to: '/reports/expense-vouchers-list', label: 'Report 1' },
      { to: '/reports/expense-voucher-print', label: 'Report 2' },
      { to: '/reports/expense-by-category', label: 'Report 3' },
    ],
  },
  {
    id: '7-6-bannasorn',
    label: 'Bannasorn',
    reports: [
      { to: '/reports/active-subscriptions-as-of', label: 'Report 1' },
      { to: '/reports/subscriptions-expiring-30-days', label: 'Report 2' },
      { to: '/reports/monthly-business-performance', label: 'Report 3' },
    ],
  },
];

const NAV = [
  {
    id: 'lineitem_form',
    section: 'Lineitem Form',
    links: [
      { to: '/subscriptions',    label: 'Subscriptions' },
      { to: '/merchandise',      label: 'Merchandise Sales' },
      { to: '/expenses',         label: 'Expense Vouchers' },
      { to: '/training-bookings',label: 'Training Bookings' },
      { to: '/payment-receipts', label: 'Payment Receipts' },
      { to: '/equipment',        label: 'Equipment Purchase' },
    ],
  },
  {
    id: 'simple_forms',
    section: 'Simple Form',
    links: [
      { to: '/members',  label: 'Members' },
      { to: '/trainers', label: 'Trainers' },
      { to: '/staff',    label: 'Staff' },
      { to: '/packages',        label: 'Packages' },
      { to: '/training-types',  label: 'Training Types' },
      { to: '/classes',         label: 'Classes' },
      { to: '/class-bookings',  label: 'Class Bookings' },
      { to: '/products', label: 'Products' },
      { to: '/equipment-items',      label: 'Equipment' },
      { to: '/maintenance-tickets',  label: 'Maintenance Tickets' },
      { to: '/expense-categories',    label: 'Expense Categories' },
      { to: '/payment-methods',       label: 'Payment Methods' },
      { to: '/equipment-categories',  label: 'Equipment Categories' },
      { to: '/product-categories',    label: 'Product Categories' },
    ],
  },
  {
    id: 'report_form_group',
    section: 'Report Form',
    modules: REPORT_MODULES,
  },
];

const moduleButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: 'calc(100% - 24px)',
  margin: '2px 12px',
  padding: '8px 10px',
  background: 'var(--gray-50)',
  border: '1px solid var(--gray-100)',
  borderRadius: 6,
  cursor: 'pointer',
  color: 'var(--gray-500)',
  fontSize: 13,
  fontWeight: 600,
};

export default function Sidebar() {
  const location = useLocation();

  const flattenLinks = (group) => {
    if (group.links) return group.links;
    return group.modules.flatMap((module) => module.reports);
  };

  const isGroupActive = (group) =>
    flattenLinks(group).some((link) => {
      const pathname = location.pathname;
      return pathname === link.to || pathname.startsWith(link.to + '/');
    });

  const isModuleActive = (module) =>
    module.reports.some((link) => location.pathname === link.to || location.pathname.startsWith(link.to + '/'));

  const [openSections, setOpenSections] = useState(() => {
    const init = {};
    NAV.forEach((g) => { init[g.id] = g.id === 'lineitem_form' || isGroupActive(g); });
    return init;
  });

  const [openModules, setOpenModules] = useState(() => {
    const init = {};
    REPORT_MODULES.forEach((module, index) => { init[module.id] = index === 0 || isModuleActive(module); });
    return init;
  });

  const toggleSection = (id) => {
    const group = NAV.find((g) => g.id === id);
    if (isGroupActive(group)) return;
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleModule = (id) => {
    setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-row">
          <img src="/logo.png" alt="GymBro logo" className="sidebar-logo-img" />
          <div className="sidebar-logo-text">
            <h1>GymBro</h1>
            <span>Management System</span>
          </div>
        </div>
      </div>

      {NAV.map((group) => {
        const groupActive = isGroupActive(group);
        const isOpen = openSections[group.id] || groupActive;
        const itemCount = group.links ? group.links.length : group.modules.length;

        return (
          <div key={group.id} style={{ marginBottom: 2 }}>
            <button
              onClick={() => toggleSection(group.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '8px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 8,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-100)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.7px',
                textTransform: 'uppercase',
                color: groupActive ? 'var(--green-600)' : 'var(--gray-400)',
              }}>
                {group.section}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  background: groupActive ? 'var(--green-100)' : 'var(--gray-100)',
                  color: groupActive ? 'var(--green-600)' : 'var(--gray-400)',
                  borderRadius: 999,
                  padding: '1px 7px',
                  lineHeight: '18px',
                }}>
                  {itemCount}
                </span>
                <span style={{
                  fontSize: 9,
                  color: groupActive ? 'var(--green-600)' : 'var(--gray-400)',
                  transition: 'transform 0.2s',
                  display: 'inline-block',
                  transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                }}>
                  ▼
                </span>
              </span>
            </button>

            {isOpen && group.links && (
              <div style={{ marginBottom: 4 }}>
                {group.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            )}

            {isOpen && group.modules && (
              <div style={{ marginBottom: 4 }}>
                {group.modules.map((module) => {
                  const moduleActive = isModuleActive(module);
                  const moduleOpen = openModules[module.id] || moduleActive;
                  return (
                    <div key={module.id}>
                      <button
                        type="button"
                        onClick={() => toggleModule(module.id)}
                        style={{
                          ...moduleButtonStyle,
                          color: moduleActive ? 'var(--green-600)' : 'var(--gray-500)',
                          background: moduleActive ? 'var(--green-50)' : 'var(--gray-50)',
                          borderColor: moduleActive ? 'var(--green-200)' : 'var(--gray-100)',
                        }}
                      >
                        <span>{module.label}</span>
                        <span style={{ fontSize: 9, transform: moduleOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▼</span>
                      </button>
                      {moduleOpen && module.reports.map((link) => (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
                          style={{ paddingLeft: 34, fontSize: 12.5 }}
                        >
                          {link.label}
                        </NavLink>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}
