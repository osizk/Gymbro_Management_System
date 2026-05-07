import { NavLink } from 'react-router-dom';

const NAV = [
  {
    section: 'Line-Item Forms',
    links: [
      { to: '/subscriptions', label: 'Subscriptions' },
      { to: '/merchandise',   label: 'Merchandise Sales' },
      // { to: '/training-bookings', label: 'Training Bookings' },
      // { to: '/payment-receipts',  label: 'Payment Receipts' },
      // { to: '/expenses',          label: 'Expense Vouchers' },
      // { to: '/equipment',         label: 'Equipment Purchase' },
    ],
  },
];

export default function Sidebar() {
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

      {NAV.map((group) => (
        <div key={group.section}>
          <p className="sidebar-section-label">{group.section}</p>
          {group.links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
              end
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      ))}
    </aside>
  );
}