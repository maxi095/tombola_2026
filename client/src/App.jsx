import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import TaskPage from "./pages/TaskPage";
import TaskFormPage from "./pages/TaskFormPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ActivityPage from "./pages/ActivityPage";
import ActivityFormPage from "./pages/ActivityFormPage";
import ActivityViewPage from "./pages/ActivityViewPage";
import UserPage from "./pages/UserPage";
import UserFormPage from "./pages/UserFormPage";
import UserViewPage from "./pages/UserViewPage";
import AcademicUnitPage from "./pages/AcademicUnitPage";
import ProjectPage from "./pages/ProjectPage";
import StudentPage from "./pages/StudentPage";
import StudentFormPage from "./pages/StudentFormPage";
import DirectorPage from "./pages/DirectorPage";

import ProtectedRoute from "./components/ProtectedRoute";

import { TaskProvider } from "./context/TasksContext";
import { ActivityProvider } from "./context/ActivityContext";
import BarraTareas from "./components/BarraTareas";
import Sidebar from "./components/Sidebar";
import { UserProvider } from "./context/UserContext";
import { AcademicUnitProvider } from "./context/AcademicUnitContext";
import { ProjectProvider } from "./context/ProjectContext";
import ProjectFormPage from "./pages/ProjectFormPage";
import { DimensionProvider } from "./context/DimensionContext";
import ActivityProjectPage from "./pages/ActivityProjectPage";
import { ActivityProjectProvider } from "./context/ActivityProjectContext";
import ActivityProjectFormPage from "./pages/ActivityProjectFormPage";
import AcademicUnitFormPage from "./pages/AcademicUnitFormPage";
import ActivityStudentPage from "./pages/ActivityStudentPage";
import Unauthorized from "./pages/Unauthorized";
import ActivityProjectViewPage from "./pages/ActivityProjectViewPage";

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


function App() {
  return (
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
                          <DimensionProvider>
                            <ProjectProvider>
                              <ActivityProjectProvider>
                                <AcademicUnitProvider>
                                  <UserProvider>
                                    <TaskProvider>
                                      <ActivityProvider>
                                        <BrowserRouter>
                                          <Layout />
                                        </BrowserRouter>
                                      </ActivityProvider>
                                    </TaskProvider>
                                  </UserProvider>
                                </AcademicUnitProvider>
                              </ActivityProjectProvider>
                            </ProjectProvider>
                          </DimensionProvider>
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
  );
}

function Layout() {
  const location = useLocation();

  const isDrawDisplay = location.pathname.startsWith("/draw/display/");

  const hideNavbar  = ["/bingoCardStatus"]
  .includes(location.pathname) || isDrawDisplay;

  const hideSidebar  = ["/bingoCardStatus", "/login", "/register", "/"]
  .includes(location.pathname) || 
  location.pathname.startsWith("/sellerPayment/") && location.pathname.endsWith("/print") || 
  isDrawDisplay;

  return (
    <div className="app-container">
     {/* BarraTareas condicional */}
     {!hideNavbar && (
        <div className="navbar">
          <BarraTareas />
        </div>
      )}

      {/* Sidebar condicional */}
      {!hideSidebar && (
        <div className="sidebar">
          <SidebarWrapper />
        </div>
      )}

      {/* Contenido principal */}
      <div className={hideSidebar  ? "main-content-full" : "main-content"}> {/* Clase que organiza el contenido principal */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/tasks" element={<TaskPage />} />
          <Route path="/tasks/new" element={<TaskFormPage />} />
          <Route path="/tasks/:id" element={<TaskFormPage />} />

          <Route path="/profile" element={<ProtectedRoute allowedRoles={['Administrador', 'Secretario', 'Director', 'Estudiante']}><ProfilePage /></ProtectedRoute>}/>

          <Route path="/users" element={<ProtectedRoute allowedRoles={['Administrador']}><UserPage /></ProtectedRoute>} />
          <Route path="/users/new" element={<ProtectedRoute allowedRoles={['Administrador']}><UserFormPage /></ProtectedRoute>} />
          <Route path="/users/edit/:id" element={<ProtectedRoute allowedRoles={['Administrador']}><UserFormPage /></ProtectedRoute>} />
          <Route path="/users/view/:id" element={<ProtectedRoute allowedRoles={['Administrador']}><UserViewPage /></ProtectedRoute>} />

          <Route path="/directors" element={<ProtectedRoute allowedRoles={['Administrador', 'Secretario']}><DirectorPage /></ProtectedRoute>} />

          <Route path="/students" element={<ProtectedRoute allowedRoles={['Administrador', 'Secretario', 'Director']}><StudentPage /></ProtectedRoute>} />
          <Route path="/students/new" element={<ProtectedRoute allowedRoles={['Administrador', 'Secretario', 'Director']}><StudentFormPage /></ProtectedRoute>} />
          <Route path="/students/edit/:id" element={<ProtectedRoute allowedRoles={['Administrador', 'Secretario', 'Director']}><StudentFormPage /></ProtectedRoute>} />

          <Route path="/academic-units" element={<ProtectedRoute allowedRoles={['Administrador']}><AcademicUnitPage /></ProtectedRoute>} />
          <Route path="/academic-units/new" element={<ProtectedRoute allowedRoles={['Administrador']}><AcademicUnitFormPage /></ProtectedRoute>} />
          <Route path="/academic-units/edit/:id" element={<ProtectedRoute allowedRoles={['Administrador']}><AcademicUnitFormPage /></ProtectedRoute>} />

          <Route path="/projects" element={<ProtectedRoute allowedRoles={['Administrador', 'Secretario', 'Director']}><ProjectPage /></ProtectedRoute>} />
          <Route path="/projects/new" element={<ProtectedRoute allowedRoles={['Administrador', 'Secretario', 'Director']}><ProjectFormPage /></ProtectedRoute>} />
          <Route path="/projects/edit/:id" element={<ProtectedRoute allowedRoles={['Administrador', 'Secretario', 'Director']}><ProjectFormPage /></ProtectedRoute>} />

          <Route path="/activity-projects" element={<ProtectedRoute allowedRoles={['Administrador', 'Secretario', 'Director']}><ActivityProjectPage /></ProtectedRoute>} />
          <Route path="/activity-projects/new" element={<ProtectedRoute allowedRoles={['Administrador', 'Secretario', 'Director']}><ActivityProjectFormPage /></ProtectedRoute>} />
          <Route path="/activity-projects/edit/:id" element={<ProtectedRoute allowedRoles={['Administrador', 'Secretario', 'Director']}><ActivityProjectFormPage /></ProtectedRoute>} />
          <Route path="/activity-projects/view/:id" element={<ProtectedRoute allowedRoles={['Administrador', 'Secretario', 'Director']}><ActivityProjectViewPage /></ProtectedRoute>} />

          <Route path="/activities" element={<ProtectedRoute allowedRoles={['Administrador', 'Secretario', 'Director']}><ActivityStudentPage /></ProtectedRoute>} />
          <Route path="/activities/new" element={<ProtectedRoute allowedRoles={['Administrador', 'Secretario', 'Director']}><ActivityFormPage /></ProtectedRoute>} />
          <Route path="/activities/edit/:id" element={<ProtectedRoute allowedRoles={['Administrador', 'Secretario', 'Director']}><ActivityFormPage /></ProtectedRoute>} />
          <Route path="/activities/view/:id" element={<ProtectedRoute allowedRoles={['Administrador', 'Secretario', 'Director']}><ActivityViewPage /></ProtectedRoute>} />

          <Route path="/my-activities" element={<ProtectedRoute allowedRoles={['Estudiante']}><ActivityPage /></ProtectedRoute>} />

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
      </div>
    </div>
  );
}

function SidebarWrapper() {
  const { user } = useAuth();
  if (!user || !['Administrador', 'Director', 'Secretario'].includes(user.roles)) return null;
  return <Sidebar />;
}

export default App;
