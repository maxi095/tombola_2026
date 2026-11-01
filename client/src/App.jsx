import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import BarraTareas from "./components/BarraTareas";
import Sidebar from "./components/Sidebar";

// Providers
import { EditionProvider } from "./context/EditionContext";
import { EditionFilterProvider } from "./context/EditionFilterContext";
import { SellerProvider } from "./context/SellerContext";
import { ClientProvider } from "./context/ClientContext";
import { SalesProvider } from "./context/SaleContext";
import { BingoCardProvider } from "./context/BingoCardContext";
import { QuotaProvider } from "./context/QuotaContext";
import { SellerPaymentProvider } from "./context/SellerPaymentContext";
import { BalanceProvider } from "./context/BalanceContext";
import { DashboardProvider } from "./context/DashboardContext";
import { DrawProvider } from "./context/DrawContext";
import { UserProvider } from "./context/UserContext";
import { VendedorProvider } from "./context/VendedorContext";
import { FeedbackProvider } from "./context/FeedbackContext";
import { LayoutProvider, useLayout } from "./context/LayoutContext";
import Toast from "./components/ui/Toast";

// Code Splitting Dinámico con React.lazy() 🚀⚡
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));

// Usuarios
const UserPage = lazy(() => import("./pages/user/UserPage"));
const UserFormPage = lazy(() => import("./pages/user/UserFormPage"));

// Ediciones
const EditionPage = lazy(() => import("./pages/edition/EditionPage"));
const EditionFormPage = lazy(() => import("./pages/edition/EditionFormPage"));

// Vendedores
const SellerPage = lazy(() => import("./pages/seller/SellerPage"));
const SellerFormPage = lazy(() => import("./pages/seller/SellerFormPage"));
const SellerViewPage = lazy(() => import("./pages/seller/SellerViewPage"));

// Asociados / Clientes
const ClientPage = lazy(() => import("./pages/client/ClientPage"));
const ClientFormPage = lazy(() => import("./pages/client/ClientFormPage"));

// Ventas
const SalePage = lazy(() => import("./pages/sale/SalePage"));
const SaleFormPage = lazy(() => import("./pages/sale/SaleFormPage"));
const SaleViewPage = lazy(() => import("./pages/sale/SaleViewPage"));
const SaleTarjetaUnicaPage = lazy(() => import("./pages/sale/SaleTarjetaUnicaPage"));

// Cuotas
const ExpiredQuotasPage = lazy(() => import("./pages/quota/ExpiredQuotasPage"));
const QuotasPage = lazy(() => import("./pages/quota/QuotasPage"));

// Cartones
const BingoCardPage = lazy(() => import("./pages/bingoCard/BingoCardPage"));
const BingoCardStatusPage = lazy(() => import("./pages/bingoCard/BingoCardStatusPage"));

// Rendiciones / Pagos de Vendedores
const SellerPaymentPage = lazy(() => import("./pages/sellerPayment/SellerPaymentPage"));
const SellerPaymentFormPage = lazy(() => import("./pages/sellerPayment/SellerPaymentFormPage"));
const SellerPaymentView = lazy(() => import("./pages/sellerPayment/SellerPaymentView"));

// Balance
const BalancePage = lazy(() => import("./pages/balance/BalancePage"));
const BalanceFormPage = lazy(() => import("./pages/balance/BalanceFormPage"));
const BalanceViewPage = lazy(() => import("./pages/balance/BalanceViewPage"));

// Dashboard
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));

// Sorteos
const DrawPage = lazy(() => import("./pages/draw/DrawPage"));
const DrawFormPage = lazy(() => import("./pages/draw/DrawFormPage"));
const DrawViewPage = lazy(() => import("./pages/draw/DrawViewPage"));
const DrawWinnersDisplayPage = lazy(() => import("./pages/draw/DrawWinnersDisplayPage"));

// Portal Vendedor Mobile PWA 📱🚀
const VendedorLayout = lazy(() =>
  import("./components/mobile/VendedorLayout").then((m) => ({ default: m.VendedorLayout }))
);
const VendedorHomePage = lazy(() =>
  import("./pages/vendedor/VendedorHomePage").then((m) => ({ default: m.VendedorHomePage }))
);
const VendedorCartonesPage = lazy(() =>
  import("./pages/vendedor/VendedorCartonesPage").then((m) => ({ default: m.VendedorCartonesPage }))
);
const VendedorVentaPage = lazy(() =>
  import("./pages/vendedor/VendedorVentaPage").then((m) => ({ default: m.VendedorVentaPage }))
);
const VendedorCuotasPage = lazy(() =>
  import("./pages/vendedor/VendedorCuotasPage").then((m) => ({ default: m.VendedorCuotasPage }))
);

const PageLoader = () => (
  <div className="py-40 flex flex-col items-center justify-center gap-3">
    <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">
      Cargando...
    </span>
  </div>
);

function App() {
  return (
    <FeedbackProvider>
      <LayoutProvider>
        <AuthProvider>
          <EditionProvider>
            <EditionFilterProvider>
              <BingoCardProvider>
                <QuotaProvider>
                  <SellerProvider>
                    <SellerPaymentProvider>
                      <BalanceProvider>
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
                      </BalanceProvider>
                    </SellerPaymentProvider>
                  </SellerProvider>
                </QuotaProvider>
              </BingoCardProvider>
            </EditionFilterProvider>
          </EditionProvider>
        </AuthProvider>
      </LayoutProvider>
    </FeedbackProvider>
  );
}

function Layout() {
  const location = useLocation();
  const { isSidebarCollapsed, isSidebarHovered } = useLayout();
  const isDrawDisplay = location.pathname.startsWith("/draw/display/");
  const isVendedorRoute = location.pathname.startsWith("/vendedor");
  const isDirectivaRoute = location.pathname.startsWith("/directiva");
  const hideNavbar = ["/bingoCardStatus", "/login", "/"]
    .includes(location.pathname) || isDrawDisplay || isVendedorRoute || isDirectivaRoute;
  const hideSidebar = ["/bingoCardStatus", "/login", "/register", "/"]
    .includes(location.pathname) ||
    location.pathname.startsWith("/sellerPayment/") && location.pathname.endsWith("/print") ||
    isDrawDisplay || isVendedorRoute || isDirectivaRoute;

  const structuralWidth = isSidebarCollapsed ? '70px' : '220px';
  const visualWidth = (isSidebarCollapsed && !isSidebarHovered) ? '70px' : '220px';

  return (
    <div className="app-layout bg-slate-50 flex min-h-screen">
      <Toast />
      {!hideSidebar && (
        <div
          className="fixed h-full z-[60] bg-white border-r border-slate-100 transition-all duration-300 ease-in-out overflow-hidden shadow-2xl shadow-slate-900/5"
          style={{ width: visualWidth }}
        >
          <SidebarWrapper />
        </div>
      )}
      <div
        className="main-container flex-1 flex flex-col transition-all duration-300 ease-in-out"
        style={{ marginLeft: !hideSidebar ? structuralWidth : '0px' }}
      >
        {!hideNavbar && (
          <header className={`h-16 border-b border-slate-100 bg-white sticky top-0 z-50`}>
            <BarraTareas />
          </header>
        )}

        <main className="content-area">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route path="/profile" element={<ProtectedRoute allowedRoles={['Administrador', 'Vendedor', 'Directiva']}><ProfilePage /></ProtectedRoute>} />
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
              <Route path="/bingoCardStatus" element={<ProtectedRoute allowedRoles={['Administrador', 'Directiva', 'Vendedor']}><BingoCardStatusPage /></ProtectedRoute>} />

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

              <Route path="/balance" element={<ProtectedRoute allowedRoles={['Administrador']}><BalancePage /></ProtectedRoute>} />
              <Route path="/balance/new" element={<ProtectedRoute allowedRoles={['Administrador']}><BalanceFormPage /></ProtectedRoute>} />
              <Route path="/balance/view/:id" element={<ProtectedRoute allowedRoles={['Administrador']}><BalanceViewPage /></ProtectedRoute>} />

              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['Administrador', 'Directiva']}><DashboardPage /></ProtectedRoute>} />

              <Route path="/draws" element={<ProtectedRoute allowedRoles={['Administrador']}><DrawPage /></ProtectedRoute>} />
              <Route path="/draw/new" element={<ProtectedRoute allowedRoles={['Administrador']}><DrawFormPage /></ProtectedRoute>} />
              <Route path="/draw/edit/:id" element={<ProtectedRoute allowedRoles={['Administrador']}><DrawFormPage /></ProtectedRoute>} />
              <Route path="/draw/view/:id" element={<ProtectedRoute allowedRoles={['Administrador']}><DrawViewPage /></ProtectedRoute>} />
              <Route path="/draw/display/:id" element={<DrawWinnersDisplayPage />} />

              {/* Portal Móvil Vendedor PWA 📱 */}
              <Route
                path="/vendedor"
                element={
                  <ProtectedRoute allowedRoles={['Vendedor', 'Administrador']}>
                    <VendedorProvider>
                      <VendedorLayout />
                    </VendedorProvider>
                  </ProtectedRoute>
                }
              >
                <Route index element={<VendedorHomePage />} />
                <Route path="cartones" element={<VendedorCartonesPage />} />
                <Route path="vender" element={<VendedorVentaPage />} />
                <Route path="cuotas" element={<VendedorCuotasPage />} />
              </Route>

              <Route path="/unauthorized" element={<Unauthorized />} />
            </Routes>
          </Suspense>
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
