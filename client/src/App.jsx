import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";

import ProtectedRoute from "./components/ProtectedRoute";

import BarraTareas from "./components/BarraTareas";
import Sidebar from "./components/Sidebar";

import { EditionProvider } from "./context/EditionContext";
import EditionPage from "./pages/edition/EditionPage";
import EditionFormPage from "./pages/edition/EditionFormPage";

import { EditionFilterProvider } from "./context/EditionFilterContext";

import { PersonProvider } from "./context/PersonContext";

import { SellerProvider } from "./context/SellerContext";
import SellerPage from "./pages/seller/SellerPage";
import SellerFormPage from "./pages/seller/SellerFormPage";
import SellerViewPage from "./pages/seller/SellerViewPage";

import { ClientProvider } from "./context/ClientContext";
import ClientPage from "./pages/client/ClientPage";
import ClientFormPage from "./pages/client/ClientFormPage";

import { SalesProvider } from "./context/SaleContext";
import SalePage from "./pages/sale/SalePage";
import SaleFormPage from "./pages/sale/SaleFormPage";
import SaleViewPage from "./pages/sale/SaleViewPage";
import SaleTarjetaUnicaPage from "./pages/sale/SaleTarjetaUnicaPage";

import { BingoCardProvider } from "./context/BingoCardContext";
import BingoCardPage from "./pages/bingoCard/BingoCardPage";
import BingoCardStatusPage from "./pages/bingoCard/BingoCardStatusPage";

import { QuotaProvider } from "./context/QuotaContext";
import ExpiredQuotasPage from "./pages/quota/ExpiredQuotasPage";
import QuotasPage from "./pages/quota/QuotasPage";

import { SellerPaymentProvider } from "./context/SellerPaymentContext";
import SellerPaymentPage from "./pages/sellerPayment/SellerPaymentPage";
import SellerPaymentFormPage from "./pages/sellerPayment/SellerPaymentFormPage";
import SellerPaymentView from "./pages/sellerPayment/SellerPaymentView";

import { DashboardProvider } from "./context/DashboardContext";
import DashboardPage from "./pages/dashboard/DashboardPage";

import { DrawProvider } from "./context/DrawContext";
import DrawPage from "./pages/draw/DrawPage";
import DrawFormPage from "./pages/draw/DrawFormPage";
import DrawViewPage from "./pages/draw/DrawViewPage";
import DrawWinnersDisplayPage from "./pages/draw/DrawWinnersDisplayPage";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Unauthorized from "./pages/Unauthorized";

import { UserProvider } from "./context/UserContext";
import UserPage from "./pages/user/UserPage";
import UserFormPage from "./pages/user/UserFormPage";
import { FeedbackProvider } from "./context/FeedbackContext";
import Toast from "./components/ui/Toast";

function App() {
  return (
    <FeedbackProvider>
      <AuthProvider>
        <EditionProvider>
          <EditionFilterProvider>
            <BingoCardProvider>
              <QuotaProvider>
                <PersonProvider>
                  <SellerProvider>
                    <SellerPaymentProvider>
                      <ClientProvider>
                        <SalesProvider>
                          <DashboardProvider>
                            <DrawProvider>
                              <UserProvider>
                                <BrowserRouter>
                                  <Layout />
                                </BrowserRouter>
                              </UserProvider>
                            </DrawProvider>
                          </DashboardProvider>
                        </SalesProvider>
                      </ClientProvider>
                    </SellerPaymentProvider>
                  </SellerProvider>
                </PersonProvider>
              </QuotaProvider>
            </BingoCardProvider>
          </EditionFilterProvider>
        </EditionProvider>
      </AuthProvider>
    </FeedbackProvider>
  );
}

function Layout() {
  const location = useLocation();

  const isDrawDisplay = location.pathname.startsWith("/draw/display/");

  const hideNavbar = ["/bingoCardStatus", "/login", "/"]
    .includes(location.pathname) || isDrawDisplay;

  const hideSidebar = ["/bingoCardStatus", "/login", "/register", "/"]
    .includes(location.pathname) ||
    location.pathname.startsWith("/sellerPayment/") && location.pathname.endsWith("/print") ||
    isDrawDisplay;

  return (
    <div className="app-layout bg-slate-50 flex min-h-screen">
      <Toast />
      {!hideSidebar && (
        <div className="w-[260px] fixed h-full z-40 bg-white">
          <SidebarWrapper />
        </div>
      )}

      <div className={`main-container flex-1 flex flex-col ${!hideSidebar ? 'ml-[260px]' : ''}`}>
        {!hideNavbar && (
          <header className={`h-16 border-b border-slate-100 bg-white sticky top-0 z-50`}>
            <BarraTareas />
          </header>
        )}

        <main className="content-area">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/profile" element={<ProtectedRoute allowedRoles={['Administrador']}><ProfilePage /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute allowedRoles={['Administrador']}><UserPage /></ProtectedRoute>} />
            <Route path="/users/new" element={<ProtectedRoute allowedRoles={['Administrador']}><UserFormPage /></ProtectedRoute>} />
            <Route path="/users/edit/:id" element={<ProtectedRoute allowedRoles={['Administrador']}><UserFormPage /></ProtectedRoute>} />

            <Route path="/editions" element={<ProtectedRoute allowedRoles={['Administrador']}><EditionPage /></ProtectedRoute>} />
            <Route path="/edition/new" element={<ProtectedRoute allowedRoles={['Administrador']}><EditionFormPage /></ProtectedRoute>} />
            <Route path="/edition/edit/:id" element={<ProtectedRoute allowedRoles={['Administrador']}><EditionFormPage /></ProtectedRoute>} />

            <Route path="/sales" element={<ProtectedRoute allowedRoles={['Administrador']}><SalePage /></ProtectedRoute>} />
            <Route path="/sale/new" element={<ProtectedRoute allowedRoles={['Administrador']}><SaleFormPage /></ProtectedRoute>} />
            <Route path="/sale/edit/:id" element={<ProtectedRoute allowedRoles={['Administrador']}><SaleFormPage /></ProtectedRoute>} />
            <Route path="/sale/view/:id" element={<ProtectedRoute allowedRoles={['Administrador']}><SaleViewPage /></ProtectedRoute>} />
            <Route path="/salesTarjetaUnica" element={<ProtectedRoute allowedRoles={['Administrador']}><SaleTarjetaUnicaPage /></ProtectedRoute>} />

            <Route path="/quotas" element={<ProtectedRoute allowedRoles={['Administrador']}><ExpiredQuotasPage /></ProtectedRoute>} />
            <Route path="/allQuotas" element={<ProtectedRoute allowedRoles={['Administrador']}><QuotasPage /></ProtectedRoute>} />

            <Route path="/bingoCards" element={<ProtectedRoute allowedRoles={['Administrador']}><BingoCardPage /></ProtectedRoute>} />
            <Route path="/bingoCardStatus" element={<ProtectedRoute allowedRoles={['Administrador']}><BingoCardStatusPage /></ProtectedRoute>} />

            <Route path="/sellers" element={<ProtectedRoute allowedRoles={['Administrador']}><SellerPage /></ProtectedRoute>} />
            <Route path="/seller/new" element={<ProtectedRoute allowedRoles={['Administrador']}><SellerFormPage /></ProtectedRoute>} />
            <Route path="/seller/edit/:id" element={<ProtectedRoute allowedRoles={['Administrador']}><SellerFormPage /></ProtectedRoute>} />
            <Route path="/seller/view/:id" element={<ProtectedRoute allowedRoles={['Administrador']}><SellerViewPage /></ProtectedRoute>} />

            <Route path="/clients" element={<ProtectedRoute allowedRoles={['Administrador']}><ClientPage /></ProtectedRoute>} />
            <Route path="/client/new" element={<ProtectedRoute allowedRoles={['Administrador']}><ClientFormPage /></ProtectedRoute>} />
            <Route path="/client/edit/:id" element={<ProtectedRoute allowedRoles={['Administrador']}><ClientFormPage /></ProtectedRoute>} />

            <Route path="/sellerPayments" element={<ProtectedRoute allowedRoles={['Administrador']}><SellerPaymentPage /></ProtectedRoute>} />
            <Route path="/sellerPayment/new" element={<ProtectedRoute allowedRoles={['Administrador']}><SellerPaymentFormPage /></ProtectedRoute>} />
            <Route path="/sellerPayment/view/:id" element={<ProtectedRoute allowedRoles={['Administrador']}><SellerPaymentView /></ProtectedRoute>} />

            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['Administrador']}><DashboardPage /></ProtectedRoute>} />

            <Route path="/draws" element={<ProtectedRoute allowedRoles={['Administrador']}><DrawPage /></ProtectedRoute>} />
            <Route path="/draw/new" element={<ProtectedRoute allowedRoles={['Administrador']}><DrawFormPage /></ProtectedRoute>} />
            <Route path="/draw/edit/:id" element={<ProtectedRoute allowedRoles={['Administrador']}><DrawFormPage /></ProtectedRoute>} />
            <Route path="/draw/view/:id" element={<ProtectedRoute allowedRoles={['Administrador']}><DrawViewPage /></ProtectedRoute>} />
            <Route path="/draw/display/:id" element={<DrawWinnersDisplayPage />} />

            <Route path="/unauthorized" element={<Unauthorized />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function SidebarWrapper() {
  const { user } = useAuth();
  if (!user || user.roles !== 'Administrador') return null;
  return <Sidebar />;
}

export default App;
