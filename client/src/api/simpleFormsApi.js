import apiClient from './axiosInstance';

// Members
export const getAllMembers            = ()        => apiClient.get('/members');
export const getMemberById            = (id)      => apiClient.get(`/members/${id}`);
export const createMember             = (data)    => apiClient.post('/members', data);
export const updateMember             = (id, d)   => apiClient.put(`/members/${id}`, d);
export const deleteMember             = (id)      => apiClient.delete(`/members/${id}`);

// Trainers
export const getAllTrainers_s          = ()        => apiClient.get('/trainers');
export const getTrainerById            = (id)      => apiClient.get(`/trainers/${id}`);
export const createTrainer             = (data)    => apiClient.post('/trainers', data);
export const updateTrainer             = (id, d)   => apiClient.put(`/trainers/${id}`, d);
export const deleteTrainer             = (id)      => apiClient.delete(`/trainers/${id}`);

// Staff
export const getAllStaff_s             = ()        => apiClient.get('/staff');
export const getStaffById              = (id)      => apiClient.get(`/staff/${id}`);
export const createStaff               = (data)    => apiClient.post('/staff', data);
export const updateStaff               = (id, d)   => apiClient.put(`/staff/${id}`, d);
export const deleteStaff               = (id)      => apiClient.delete(`/staff/${id}`);

// Packages
export const getAllPackages_s          = ()        => apiClient.get('/packages');
export const getPackageById            = (id)      => apiClient.get(`/packages/${id}`);
export const createPackage             = (data)    => apiClient.post('/packages', data);
export const updatePackage             = (id, d)   => apiClient.put(`/packages/${id}`, d);
export const deletePackage             = (id)      => apiClient.delete(`/packages/${id}`);

// Training Types
export const getAllTrainingTypes_s     = ()        => apiClient.get('/training-types');
export const getTrainingTypeById       = (id)      => apiClient.get(`/training-types/${id}`);
export const createTrainingType        = (data)    => apiClient.post('/training-types', data);
export const updateTrainingType        = (id, d)   => apiClient.put(`/training-types/${id}`, d);
export const deleteTrainingType        = (id)      => apiClient.delete(`/training-types/${id}`);

// Classes
export const getAllClasses_s           = ()        => apiClient.get('/classes');
export const getClassById              = (id)      => apiClient.get(`/classes/${id}`);
export const createClass               = (data)    => apiClient.post('/classes', data);
export const updateClass               = (id, d)   => apiClient.put(`/classes/${id}`, d);
export const deleteClass               = (id)      => apiClient.delete(`/classes/${id}`);

// Class Bookings
export const getAllClassBookings        = ()        => apiClient.get('/class-bookings');
export const getClassBookingById       = (id)      => apiClient.get(`/class-bookings/${id}`);
export const createClassBooking        = (data)    => apiClient.post('/class-bookings', data);
export const updateClassBooking        = (id, d)   => apiClient.put(`/class-bookings/${id}`, d);
export const deleteClassBooking        = (id)      => apiClient.delete(`/class-bookings/${id}`);
export const getClassesForBooking      = ()        => apiClient.get('/class-bookings/classes');
export const getMembersForBooking      = ()        => apiClient.get('/class-bookings/members');

// Products
export const getAllProducts_s          = ()        => apiClient.get('/products');
export const getProductById            = (id)      => apiClient.get(`/products/${id}`);
export const createProduct             = (data)    => apiClient.post('/products', data);
export const updateProduct             = (id, d)   => apiClient.put(`/products/${id}`, d);
export const deleteProduct             = (id)      => apiClient.delete(`/products/${id}`);
export const getProductCategories      = ()        => apiClient.get('/products/categories');

// Equipment Items
export const getAllEquipmentItems       = ()        => apiClient.get('/equipment-items');
export const getEquipmentItemById      = (id)      => apiClient.get(`/equipment-items/${id}`);
export const createEquipmentItem       = (data)    => apiClient.post('/equipment-items', data);
export const updateEquipmentItem       = (id, d)   => apiClient.put(`/equipment-items/${id}`, d);
export const deleteEquipmentItem       = (id)      => apiClient.delete(`/equipment-items/${id}`);
export const getEquipmentCatsForItems  = ()        => apiClient.get('/equipment-items/categories');

// Maintenance Tickets
export const getAllTickets              = ()        => apiClient.get('/maintenance-tickets');
export const getTicketById             = (id)      => apiClient.get(`/maintenance-tickets/${id}`);
export const createTicket              = (data)    => apiClient.post('/maintenance-tickets', data);
export const updateTicket              = (id, d)   => apiClient.put(`/maintenance-tickets/${id}`, d);
export const deleteTicket              = (id)      => apiClient.delete(`/maintenance-tickets/${id}`);
export const getEquipmentForTickets    = ()        => apiClient.get('/maintenance-tickets/equipment');
export const getStaffForTickets        = ()        => apiClient.get('/maintenance-tickets/staff');

// Expense Categories
export const getAllExpenseCategories_s  = ()        => apiClient.get('/expense-categories');
export const getExpenseCategoryById    = (id)      => apiClient.get(`/expense-categories/${id}`);
export const createExpenseCategory     = (data)    => apiClient.post('/expense-categories', data);
export const updateExpenseCategory     = (id, d)   => apiClient.put(`/expense-categories/${id}`, d);
export const deleteExpenseCategory     = (id)      => apiClient.delete(`/expense-categories/${id}`);

// Payment Methods
export const getAllPaymentMethods_s     = ()        => apiClient.get('/payment-methods');
export const getPaymentMethodById      = (id)      => apiClient.get(`/payment-methods/${id}`);
export const createPaymentMethod       = (data)    => apiClient.post('/payment-methods', data);
export const updatePaymentMethod       = (id, d)   => apiClient.put(`/payment-methods/${id}`, d);
export const deletePaymentMethod       = (id)      => apiClient.delete(`/payment-methods/${id}`);

// Equipment Categories
export const getAllEquipmentCategories_s = ()       => apiClient.get('/equipment-categories');
export const getEquipmentCategoryById  = (id)      => apiClient.get(`/equipment-categories/${id}`);
export const createEquipmentCategory   = (data)    => apiClient.post('/equipment-categories', data);
export const updateEquipmentCategory   = (id, d)   => apiClient.put(`/equipment-categories/${id}`, d);
export const deleteEquipmentCategory   = (id)      => apiClient.delete(`/equipment-categories/${id}`);

// Product Categories
export const getAllProductCategories_s  = ()        => apiClient.get('/product-categories');
export const getProductCategoryById    = (id)      => apiClient.get(`/product-categories/${id}`);
export const createProductCategory     = (data)    => apiClient.post('/product-categories', data);
export const updateProductCategory     = (id, d)   => apiClient.put(`/product-categories/${id}`, d);
export const deleteProductCategory     = (id)      => apiClient.delete(`/product-categories/${id}`);
