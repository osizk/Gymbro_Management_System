import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MerchandiseList from './pages/Merchandise/MerchandiseList';
import MerchandiseForm from './pages/Merchandise/MerchandiseForm';

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

        {/* ── Merchandise Module ── */}
        <Route path="/merchandise"          element={<Layout><MerchandiseList /></Layout>} />
        <Route path="/merchandise/new"      element={<Layout><MerchandiseForm /></Layout>} />
        <Route path="/merchandise/:id/edit" element={<Layout><MerchandiseForm /></Layout>} />

        {/* teammates add routes here */}
        {/* <Route path="/subscriptions" element={<Layout><SubscriptionList /></Layout>} /> */}

        <Route path="*" element={<Layout><p className="state-box">404 — Page not found</p></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}