import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

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
    section: 'Simple Form Group',
    links: [
      // People
      { to: '/members',  label: 'Members' },
      { to: '/trainers', label: 'Trainers' },
      { to: '/staff',    label: 'Staff' },
      // Programs
      { to: '/packages',        label: 'Packages' },
      { to: '/training-types',  label: 'Training Types' },
      { to: '/classes',         label: 'Classes' },
      { to: '/class-bookings',  label: 'Class Bookings' },
      // Inventory
      { to: '/products', label: 'Products' },
      // Facilities
      { to: '/equipment-items',      label: 'Equipment' },
      { to: '/maintenance-tickets',  label: 'Maintenance Tickets' },
      // Settings
      { to: '/expense-categories',    label: 'Expense Categories' },
      { to: '/payment-methods',       label: 'Payment Methods' },
      { to: '/equipment-categories',  label: 'Equipment Categories' },
      { to: '/product-categories',    label: 'Product Categories' },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();

  const isGroupActive = (links) =>
    links.some((link) => {
      const pathname = location.pathname;
      return pathname === link.to || pathname.startsWith(link.to + '/');
    });

  const [openSections, setOpenSections] = useState(() => {
    const init = {};
    NAV.forEach((g) => { init[g.id] = g.id === 'lineitem_form' || isGroupActive(g.links); });
    return init;
  });

  const toggleSection = (id) => {
    if (isGroupActive(NAV.find((g) => g.id === id).links)) return;
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-row">
          <img src="/logo.png" alt="GymBro logo" className="sidebar-logo-img" />
          <div className="sidebar-logo-text">
            <h1>GymBro</h1>
            <span>Management System</span>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      {NAV.map((group) => {
        const groupActive = isGroupActive(group.links);
        const isOpen = openSections[group.id] || groupActive;

        return (
          <div key={group.id} style={{ marginBottom: 2 }}>
            {/* Section header */}
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
                  {group.links.length}
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

            {/* Links */}
            {isOpen && (
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
          </div>
        );
      })}
    </aside>
  );
}
