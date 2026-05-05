import { NavLink } from 'react-router-dom';

const NAV = [
  {
    section: 'Line-Item Forms',
    links: [
      { to: '/merchandise', label: 'Merchandise Sales' },
      // teammates add their links here, e.g.:
      // { to: '/subscriptions',     label: 'Subscriptions' },
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
        <h1>GymBro</h1>
        <span>Management System</span>
      </div>

      {NAV.map((group) => (
        <div key={group.section}>
          <p className="sidebar-section-label">{group.section}</p>
          {group.links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                'sidebar-link' + (isActive ? ' active' : '')
              }
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