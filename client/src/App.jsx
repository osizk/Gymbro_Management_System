import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar               from './components/Sidebar';
import MerchandiseList       from './pages/Merchandise/MerchandiseList';
import MerchandiseForm       from './pages/Merchandise/MerchandiseForm';
import MerchandiseView       from './pages/Merchandise/MerchandiseView';
import SubscriptionList      from './pages/Subscription/SubscriptionList';
import SubscriptionForm      from './pages/Subscription/SubscriptionForm';
import SubscriptionView      from './pages/Subscription/SubscriptionView';
import ExpenseVoucherList    from './pages/ExpenseVoucher/ExpenseVoucherList';
import ExpenseVoucherForm    from './pages/ExpenseVoucher/ExpenseVoucherForm';
import ExpenseVoucherView    from './pages/ExpenseVoucher/ExpenseVoucherView';

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/merchandise" replace />} />

        {/* ── Merchandise ── */}
        <Route path="/merchandise"              element={<Layout><MerchandiseList /></Layout>} />
        <Route path="/merchandise/new"          element={<Layout><MerchandiseForm /></Layout>} />
        <Route path="/merchandise/:id"          element={<Layout><MerchandiseView /></Layout>} />
        <Route path="/merchandise/:id/edit"     element={<Layout><MerchandiseForm /></Layout>} />

        {/* ── Subscriptions ── */}
        <Route path="/subscriptions"            element={<Layout><SubscriptionList /></Layout>} />
        <Route path="/subscriptions/new"        element={<Layout><SubscriptionForm /></Layout>} />
        <Route path="/subscriptions/:id"        element={<Layout><SubscriptionView /></Layout>} />
        <Route path="/subscriptions/:id/edit"   element={<Layout><SubscriptionForm /></Layout>} />

        {/* ── Expense Vouchers ── */}
        <Route path="/expenses"              element={<Layout><ExpenseVoucherList /></Layout>} />
        <Route path="/expenses/new"          element={<Layout><ExpenseVoucherForm /></Layout>} />
        <Route path="/expenses/:id"          element={<Layout><ExpenseVoucherView /></Layout>} />
        <Route path="/expenses/:id/edit"     element={<Layout><ExpenseVoucherForm /></Layout>} />

        {/* teammates add routes here */}
        {/* <Route path="/training-bookings"        element={<Layout><TrainingList /></Layout>} /> */}
        {/* <Route path="/training-bookings/new"    element={<Layout><TrainingForm /></Layout>} /> */}
        {/* <Route path="/training-bookings/:id"    element={<Layout><TrainingView /></Layout>} /> */}
        {/* <Route path="/training-bookings/:id/edit" element={<Layout><TrainingForm /></Layout>} /> */}

        <Route path="*" element={<Layout><p className="state-box">404 — Page not found</p></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}