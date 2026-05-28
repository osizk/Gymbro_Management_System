import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar               from './components/Sidebar';
import Toast                 from './components/Toast';
import { ToastProvider }     from './contexts/ToastContext';
import MerchandiseList       from './pages/Merchandise/MerchandiseList';
import MerchandiseForm       from './pages/Merchandise/MerchandiseForm';
import MerchandiseView       from './pages/Merchandise/MerchandiseView';
import SubscriptionList      from './pages/Subscription/SubscriptionList';
import SubscriptionForm      from './pages/Subscription/SubscriptionForm';
import SubscriptionView      from './pages/Subscription/SubscriptionView';
import ExpenseVoucherList    from './pages/ExpenseVoucher/ExpenseVoucherList';
import ExpenseVoucherForm    from './pages/ExpenseVoucher/ExpenseVoucherForm';
import ExpenseVoucherView    from './pages/ExpenseVoucher/ExpenseVoucherView';
import TrainingBookingList   from './pages/TrainingBooking/TrainingBookingList';
import TrainingBookingForm   from './pages/TrainingBooking/TrainingBookingForm';
import TrainingBookingView   from './pages/TrainingBooking/TrainingBookingView';
import PaymentReceiptList    from './pages/PaymentReceipt/PaymentReceiptList';
import PaymentReceiptForm    from './pages/PaymentReceipt/PaymentReceiptForm';
import PaymentReceiptView    from './pages/PaymentReceipt/PaymentReceiptView';
import EquipmentPurchaseList from './pages/EquipmentPurchase/EquipmentPurchaseList';
import EquipmentPurchaseForm from './pages/EquipmentPurchase/EquipmentPurchaseForm';
import EquipmentPurchaseView from './pages/EquipmentPurchase/EquipmentPurchaseView';

import MemberList            from './pages/Member/MemberList';
import MemberForm            from './pages/Member/MemberForm';
import MemberView            from './pages/Member/MemberView';
import TrainerList           from './pages/Trainer/TrainerList';
import TrainerForm           from './pages/Trainer/TrainerForm';
import TrainerView           from './pages/Trainer/TrainerView';
import StaffList             from './pages/Staff/StaffList';
import StaffForm             from './pages/Staff/StaffForm';
import StaffView             from './pages/Staff/StaffView';
import PackageList           from './pages/Package/PackageList';
import PackageForm           from './pages/Package/PackageForm';
import PackageView           from './pages/Package/PackageView';
import TrainingTypeList      from './pages/TrainingType/TrainingTypeList';
import TrainingTypeForm      from './pages/TrainingType/TrainingTypeForm';
import TrainingTypeView      from './pages/TrainingType/TrainingTypeView';
import ClassList             from './pages/Class/ClassList';
import ClassForm             from './pages/Class/ClassForm';
import ClassView             from './pages/Class/ClassView';
import ClassBookingList      from './pages/ClassBooking/ClassBookingList';
import ClassBookingForm      from './pages/ClassBooking/ClassBookingForm';
import ClassBookingView      from './pages/ClassBooking/ClassBookingView';
import ProductList           from './pages/Product/ProductList';
import ProductForm           from './pages/Product/ProductForm';
import ProductView           from './pages/Product/ProductView';
import EquipmentItemList     from './pages/EquipmentItem/EquipmentItemList';
import EquipmentItemForm     from './pages/EquipmentItem/EquipmentItemForm';
import EquipmentItemView     from './pages/EquipmentItem/EquipmentItemView';
import MaintenanceTicketList from './pages/MaintenanceTicket/MaintenanceTicketList';
import MaintenanceTicketForm from './pages/MaintenanceTicket/MaintenanceTicketForm';
import MaintenanceTicketView from './pages/MaintenanceTicket/MaintenanceTicketView';
import ExpenseCategoryList   from './pages/ExpenseCategory/ExpenseCategoryList';
import ExpenseCategoryForm   from './pages/ExpenseCategory/ExpenseCategoryForm';
import ExpenseCategoryView   from './pages/ExpenseCategory/ExpenseCategoryView';
import PaymentMethodList     from './pages/PaymentMethod/PaymentMethodList';
import PaymentMethodForm     from './pages/PaymentMethod/PaymentMethodForm';
import PaymentMethodView     from './pages/PaymentMethod/PaymentMethodView';
import EquipmentCategoryList from './pages/EquipmentCategory/EquipmentCategoryList';
import EquipmentCategoryForm from './pages/EquipmentCategory/EquipmentCategoryForm';
import EquipmentCategoryView from './pages/EquipmentCategory/EquipmentCategoryView';
import ProductCategoryList   from './pages/ProductCategory/ProductCategoryList';
import ProductCategoryForm   from './pages/ProductCategory/ProductCategoryForm';
import ProductCategoryView   from './pages/ProductCategory/ProductCategoryView';
import ReportList            from './pages/Report/ReportList';
import ReportView            from './pages/Report/ReportView';

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
    <ToastProvider>
      <BrowserRouter>
        <Toast />
        <Routes>
          <Route path="/" element={<Navigate to="/subscriptions" replace />} />

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
        <Route path="/expenses"                 element={<Layout><ExpenseVoucherList /></Layout>} />
        <Route path="/expenses/new"             element={<Layout><ExpenseVoucherForm /></Layout>} />
        <Route path="/expenses/:id"             element={<Layout><ExpenseVoucherView /></Layout>} />
        <Route path="/expenses/:id/edit"        element={<Layout><ExpenseVoucherForm /></Layout>} />

        {/* ── Training Bookings ── */}
        <Route path="/training-bookings"        element={<Layout><TrainingBookingList /></Layout>} />
        <Route path="/training-bookings/new"    element={<Layout><TrainingBookingForm /></Layout>} />
        <Route path="/training-bookings/:id"    element={<Layout><TrainingBookingView /></Layout>} />
        <Route path="/training-bookings/:id/edit" element={<Layout><TrainingBookingForm /></Layout>} />

        {/* ── Payment Receipts ── */}
        <Route path="/payment-receipts"         element={<Layout><PaymentReceiptList /></Layout>} />
        <Route path="/payment-receipts/new"     element={<Layout><PaymentReceiptForm /></Layout>} />
        <Route path="/payment-receipts/:id"     element={<Layout><PaymentReceiptView /></Layout>} />
        <Route path="/payment-receipts/:id/edit" element={<Layout><PaymentReceiptForm /></Layout>} />

        {/* ── Equipment Purchase ── */}
        <Route path="/equipment"                element={<Layout><EquipmentPurchaseList /></Layout>} />
        <Route path="/equipment/new"            element={<Layout><EquipmentPurchaseForm /></Layout>} />
        <Route path="/equipment/:id"            element={<Layout><EquipmentPurchaseView /></Layout>} />
        <Route path="/equipment/:id/edit"       element={<Layout><EquipmentPurchaseForm /></Layout>} />

        {/* ── Members ── */}
        <Route path="/members"                  element={<Layout><MemberList /></Layout>} />
        <Route path="/members/new"              element={<Layout><MemberForm /></Layout>} />
        <Route path="/members/:id"              element={<Layout><MemberView /></Layout>} />
        <Route path="/members/:id/edit"         element={<Layout><MemberForm /></Layout>} />

        {/* ── Trainers ── */}
        <Route path="/trainers"                 element={<Layout><TrainerList /></Layout>} />
        <Route path="/trainers/new"             element={<Layout><TrainerForm /></Layout>} />
        <Route path="/trainers/:id"             element={<Layout><TrainerView /></Layout>} />
        <Route path="/trainers/:id/edit"        element={<Layout><TrainerForm /></Layout>} />

        {/* ── Staff ── */}
        <Route path="/staff"                    element={<Layout><StaffList /></Layout>} />
        <Route path="/staff/new"                element={<Layout><StaffForm /></Layout>} />
        <Route path="/staff/:id"                element={<Layout><StaffView /></Layout>} />
        <Route path="/staff/:id/edit"           element={<Layout><StaffForm /></Layout>} />

        {/* ── Packages ── */}
        <Route path="/packages"                 element={<Layout><PackageList /></Layout>} />
        <Route path="/packages/new"             element={<Layout><PackageForm /></Layout>} />
        <Route path="/packages/:id"             element={<Layout><PackageView /></Layout>} />
        <Route path="/packages/:id/edit"        element={<Layout><PackageForm /></Layout>} />

        {/* ── Training Types ── */}
        <Route path="/training-types"           element={<Layout><TrainingTypeList /></Layout>} />
        <Route path="/training-types/new"       element={<Layout><TrainingTypeForm /></Layout>} />
        <Route path="/training-types/:id"       element={<Layout><TrainingTypeView /></Layout>} />
        <Route path="/training-types/:id/edit"  element={<Layout><TrainingTypeForm /></Layout>} />

        {/* ── Classes ── */}
        <Route path="/classes"                  element={<Layout><ClassList /></Layout>} />
        <Route path="/classes/new"              element={<Layout><ClassForm /></Layout>} />
        <Route path="/classes/:id"              element={<Layout><ClassView /></Layout>} />
        <Route path="/classes/:id/edit"         element={<Layout><ClassForm /></Layout>} />

        {/* ── Class Bookings ── */}
        <Route path="/class-bookings"           element={<Layout><ClassBookingList /></Layout>} />
        <Route path="/class-bookings/new"       element={<Layout><ClassBookingForm /></Layout>} />
        <Route path="/class-bookings/:id"       element={<Layout><ClassBookingView /></Layout>} />
        <Route path="/class-bookings/:id/edit"  element={<Layout><ClassBookingForm /></Layout>} />

        {/* ── Products ── */}
        <Route path="/products"                 element={<Layout><ProductList /></Layout>} />
        <Route path="/products/new"             element={<Layout><ProductForm /></Layout>} />
        <Route path="/products/:id"             element={<Layout><ProductView /></Layout>} />
        <Route path="/products/:id/edit"        element={<Layout><ProductForm /></Layout>} />

        {/* ── Equipment Items ── */}
        <Route path="/equipment-items"          element={<Layout><EquipmentItemList /></Layout>} />
        <Route path="/equipment-items/new"      element={<Layout><EquipmentItemForm /></Layout>} />
        <Route path="/equipment-items/:id"      element={<Layout><EquipmentItemView /></Layout>} />
        <Route path="/equipment-items/:id/edit" element={<Layout><EquipmentItemForm /></Layout>} />

        {/* ── Maintenance Tickets ── */}
        <Route path="/maintenance-tickets"          element={<Layout><MaintenanceTicketList /></Layout>} />
        <Route path="/maintenance-tickets/new"      element={<Layout><MaintenanceTicketForm /></Layout>} />
        <Route path="/maintenance-tickets/:id"      element={<Layout><MaintenanceTicketView /></Layout>} />
        <Route path="/maintenance-tickets/:id/edit" element={<Layout><MaintenanceTicketForm /></Layout>} />

        {/* ── Expense Categories ── */}
        <Route path="/expense-categories"           element={<Layout><ExpenseCategoryList /></Layout>} />
        <Route path="/expense-categories/new"       element={<Layout><ExpenseCategoryForm /></Layout>} />
        <Route path="/expense-categories/:id"       element={<Layout><ExpenseCategoryView /></Layout>} />
        <Route path="/expense-categories/:id/edit"  element={<Layout><ExpenseCategoryForm /></Layout>} />

        {/* ── Payment Methods ── */}
        <Route path="/payment-methods"          element={<Layout><PaymentMethodList /></Layout>} />
        <Route path="/payment-methods/new"      element={<Layout><PaymentMethodForm /></Layout>} />
        <Route path="/payment-methods/:id"      element={<Layout><PaymentMethodView /></Layout>} />
        <Route path="/payment-methods/:id/edit" element={<Layout><PaymentMethodForm /></Layout>} />

        {/* ── Equipment Categories ── */}
        <Route path="/equipment-categories"          element={<Layout><EquipmentCategoryList /></Layout>} />
        <Route path="/equipment-categories/new"      element={<Layout><EquipmentCategoryForm /></Layout>} />
        <Route path="/equipment-categories/:id"      element={<Layout><EquipmentCategoryView /></Layout>} />
        <Route path="/equipment-categories/:id/edit" element={<Layout><EquipmentCategoryForm /></Layout>} />

        {/* ── Product Categories ── */}
        <Route path="/product-categories"           element={<Layout><ProductCategoryList /></Layout>} />
        <Route path="/product-categories/new"       element={<Layout><ProductCategoryForm /></Layout>} />
        <Route path="/product-categories/:id"       element={<Layout><ProductCategoryView /></Layout>} />
        <Route path="/product-categories/:id/edit"  element={<Layout><ProductCategoryForm /></Layout>} />

        {/* ── Reports ── */}
        <Route path="/reports"                      element={<Layout><ReportList /></Layout>} />
        <Route path="/reports/:reportId"            element={<Layout><ReportView /></Layout>} />

        <Route path="*" element={<Layout><p className="state-box">404 — Page not found</p></Layout>} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  );
}
