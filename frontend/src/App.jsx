import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { BrowserRouter, Route, Routes, useLocation, Navigate } from 'react-router-dom'

// import DashBoard from './pages/dashboard/dashboard'
import SideBar from './compountes/sidebar/Sidebar'
import PropertyForm from './compountes/Property/PropertyForm'
import PropertiesList from './compountes/Property/PropertyList'
import LeaseAgreement from './compountes/Property/LeaseAgreement'
import TenantInfo from './compountes/Property/TenantInfo'
import TenantList from './compountes/Tenant12/TenantList';
import PropertyDetails from './pages/PropertyDetails';
// import EditProperty from './pages/EditProperty'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import Register from './pages/Login/Register'
import About from './pages/About/About'
import Privacy from './pages/Privacy/Privacy'
import Terms from './pages/Term/Terms'
import TenantForm from './compountes/Tenant12/TenantForm'
import TenateDetails from './compountes/Tenant12/TenateDetails'
import LeaseForm from './compountes/Lease/LeaseFrom';
import MaintenanceRequestForm from './compountes/Maintenance12/MaintenanceRequestFrom';
import MaintenanceRequestDetails from './compountes/Maintenance12/MaintenanceRequestDetails';
import MaintenanceRequestList from './compountes/Maintenance12/MaintenanceRequestList';
import Header from './compountes/navbar/Header';
import AdminDashboard from './compountes/admainDashboard.jsx';

import FinancialManagement from './compountes/Financial12/Income.jsx';
import FinancialExpenses from './compountes/Financial12/Expenses.jsx';
import RentPayments from './compountes/Financial12/RentPayments.jsx';
import RentPaymentReceipt from './compountes/Financial12/RentPaymentReceipt';
import RentPaymentReceiptList from './compountes/Financial12/RentPaymentReceiptList';
import PaymentHistory from './compountes/Financial12/PaymentHistory';
import PropertyFilteredList from './compountes/Property/Overview.jsx';
import FinancialReport from './compountes/Financial12/FinancialReport.jsx';
import FinancialDashboard from './compountes/Financial12/FinancialDashboard.jsx';
import UserRoleCharts from './compountes/UserManagement/UserRoleCharts.jsx';
import UserTable from './compountes/UserManagement/UserTable.jsx';
import UserManagement from './compountes/UserManagement/UserManagement.jsx';
import GeneralDashboard from './compountes/GeneralDashboard/GeneralDashboard.jsx';



function AppContent() {
  const location = useLocation();
  
  // Check if current route should show sidebar
  const showSidebar = 
    location.pathname !== '/' && 
    location.pathname !== '/login' &&
    location.pathname !== '/register' &&
    location.pathname !== '/about' && 
    location.pathname !== '/add-property' && 
    location.pathname !== '/terms' &&
    location.pathname !== '/privacy-policy' &&
    !location.pathname.startsWith('/property/') && 
    !location.pathname.startsWith('/edit-property/') &&
    !location.pathname.startsWith('/tenants/');
  // New ProtectedRoute component
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (!token || !user) {
      // Redirect to login page if not authenticated
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  const renderContent = () => (
     <Routes>
       <Route path='/' element={<Home/>}/>
       <Route path='/login' element={<Login/>}/>
       <Route path='/register' element={<Register/>}/>
       <Route path='/about' element={<About/>}/>
       <Route path='/privacy-policy' element={<Privacy/>}/>
       <Route path='/terms' element={<Terms/>}/>
       <Route 
         path='/dashboard' 
         element={
           <ProtectedRoute>
             <Header />
             <GeneralDashboard/>
           </ProtectedRoute>
         }
       />

       <Route 
         path='/properties' 
         element={
           <ProtectedRoute>
             <Header />
             <PropertiesList/>
           </ProtectedRoute>
         }
       />
       <Route 
         path='/add-property' 
         element={
           <ProtectedRoute>
             <Header />
             <PropertyForm/>
           </ProtectedRoute>
         }
       />
       <Route 
         path='/leases' 
         element={
           <ProtectedRoute>
             <Header />
             <LeaseAgreement/>
           </ProtectedRoute>
         }
       />
       <Route 
         path='/maintenance-details' 
         element={
           <ProtectedRoute>
             <Header />
             <MaintenanceRequestDetails/>
           </ProtectedRoute>
         }
       />
       <Route 
         path='/maintenance-list' 
         element={
           <ProtectedRoute>
             <Header />
             <MaintenanceRequestList/>
           </ProtectedRoute>
         }
       />
       <Route 
         path="/overview-list"
         element={
           <ProtectedRoute>
             
             <PropertiesList />
           </ProtectedRoute>
         }
       />
       <Route 
         path='/maintenance' 
         element={
           <ProtectedRoute>
             <Header />
             <MaintenanceRequestForm/>
           </ProtectedRoute>
         }
       />
       <Route 
         path='/leases/new' 
         element={
           <ProtectedRoute>
             <Header />
             <LeaseForm/>
           </ProtectedRoute>
         }
         />
       <Route 
         path='/financal-income' 
         element={
           <ProtectedRoute>
             <Header />
             <FinancialManagement/>
           </ProtectedRoute>
         }
       />
       <Route 
         path='/financial-expenses' 
         element={
           <ProtectedRoute>
             <Header />
             <FinancialExpenses/>
           </ProtectedRoute>
         }
       />
       <Route 
         path='/financial-Rent' 
         element={
           <ProtectedRoute>
             <Header />
             <RentPayments/>
           </ProtectedRoute>
         }
       />
       <Route 
         path='/Rent-receipt' 
         element={
           <ProtectedRoute>
            
             <RentPaymentReceipt/>
           </ProtectedRoute>
         }
       />
       <Route 
         path='/Rent-receipt-list' 
         element={
           <ProtectedRoute>
             <Header />
             <RentPaymentReceiptList/>
           </ProtectedRoute>
         }
       />
       <Route 
         path='/tenate' 
         element={
           <ProtectedRoute>
             <Header />
             <TenantInfo/>
           </ProtectedRoute>
         }
       />
       <Route 
         path='/tenant-list' 
         element={
           <ProtectedRoute>
             <Header />
             <TenantList/>
           </ProtectedRoute>
         }
       />
       <Route 
         path='/tenants/:id' 
         element={
           <ProtectedRoute>
             
             <TenateDetails/>
           </ProtectedRoute>
         }
       />
       <Route 
         path='/tenant-form' 
         element={
           <ProtectedRoute>
             <Header />
             <TenantForm/>
           </ProtectedRoute>
         }
       />
       <Route 
         path='/property/:id' 
         element={
           <ProtectedRoute>
             
             <PropertyDetails/>
           </ProtectedRoute>
         }
       />
       <Route 
         path='/financial-report' 
         element={
           <ProtectedRoute>
             
             <FinancialReport />
           </ProtectedRoute>
         }
       />
       <Route 
         path='/financial-dashboard' 
         element={
           <ProtectedRoute>
             
             <FinancialDashboard />
           </ProtectedRoute>
         }
       />
       <Route 
         path='/User-Role' 
         element={
           <ProtectedRoute>
             
             <UserRoleCharts />
           </ProtectedRoute>
         }
       />
       <Route 
         path='/User-mangement' 
         element={
           <ProtectedRoute>
             
             <UserManagement />
           </ProtectedRoute>
         }
       />
       <Route 
         path='/User-table' 
         element={
           <ProtectedRoute>
             
             <UserTable />
           </ProtectedRoute>
         }
       />
       {/* <Route 
         path='/financial-report/:propertyId' 
         element={
           <ProtectedRoute>
             <FinancialReport />
           </ProtectedRoute>
         }
       /> */}
   
       <Route 
         path='/user-management' 
         element={
           <ProtectedRoute>
             <Header />
             <UserManagement/>
           </ProtectedRoute>
         }
       />
       <Route 
         path='/financial-rent/payment-history' 
         element={
           <ProtectedRoute>
             <Header />
             <PaymentHistory/>
           </ProtectedRoute>
         }
       />
       <Route 
         path='/properties-filtered' 
         element={
           <ProtectedRoute>
             <Header />
             <PropertyFilteredList/>
           </ProtectedRoute>
         }
       />
       {/* <Route 
         path='/edit-property/:id' 
         element={
           <ProtectedRoute>
             <Header />
             <EditProperty/>
           </ProtectedRoute>
         }
       /> */}
       <Route path='/privacy-policy' element={<Privacy/>}/>
       <Route 
         path='/admin-dashboard' 
         element={
           <ProtectedRoute>
             <Header />
             <AdminDashboard/>
           </ProtectedRoute>
         }
       />
     </Routes>
   );

  return (
    <>
      {showSidebar ? (
        <SideBar>
          {renderContent()}
        </SideBar>
      ) : (
        renderContent()
      )}
      <ToastContainer />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
