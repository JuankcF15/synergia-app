import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import BusinessLogin from '../pages/BusinessLogin';
import BusinessRegister from '../pages/BusinessRegister';
import BusinessDashboard from '../pages/BusinessDashboard';   
import HomePage from '../pages/HomePage';
import SurveyCode from '../pages/SurveyCode';
import SurveyPage from '../pages/SurveyPage';
import BusinessProfile from '../pages/BusinessProfile';
import EmployeesManagement from '../pages/EmployeesManagement';
import Reports from '../pages/Reports';
import BusinessSettings from '../pages/BusinessSettings';
import BusinessLayout from '../layouts/BusinessLayout'; // este es el nuevo layout
import AdminDashboard from '../pages/AdminDashboard';
import BusinessManager from '../pages/BusinessManager';
import AdminBusinessProfile from '../pages/AdminBusinessProfile';
import ForgotPassword from '../pages/ForgotPassword';

import ProtectedRoute from '../components/ProtectedRoute';
import AdminProtectedRoute from '../components/AdminProtectedRoute';

// Funciones para limpiar el storage y redirigir
function Logout() {
    localStorage.clear();
    return <Navigate to="/business/login" />;
}

function RegisterAndLogout() {
    localStorage.clear();
    return <Navigate to="/business/register" />;
}

export default function AppRoutes() {
    return (
        <BrowserRouter basename="/synergia">
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/business/login" element={<BusinessLogin />} />
                <Route path="/business/register" element={<BusinessRegister />} />
                <Route path="/business/logout" element={<Logout />} />
                <Route path="/business/registerlogout" element={<RegisterAndLogout />} />
                <Route path="/business/forgot-password" element={<ForgotPassword />} />

                {/* Rutas protegidas */}
                <Route element={<BusinessLayout />}>
                    <Route path="/business/dashboard" element={<ProtectedRoute><BusinessDashboard /></ProtectedRoute>} />
                    <Route path="/business/dashboard/profile" element={<ProtectedRoute><BusinessProfile /></ProtectedRoute>} />
                    <Route path="/business/dashboard/settings" element={<ProtectedRoute><BusinessSettings /></ProtectedRoute>} />
                    <Route path="/business/dashboard/employees" element={<ProtectedRoute><EmployeesManagement /></ProtectedRoute>} />
                    <Route path="/business/dashboard/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                </Route>

                {/* Ruta para el dashboard global de admin */}
                <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                <Route path="/admin/businesses" element={<AdminProtectedRoute><BusinessManager /></AdminProtectedRoute>} />
                <Route path="/admin/businesses/:id" element={<AdminProtectedRoute><AdminBusinessProfile /></AdminProtectedRoute>} />
                
                {/* Encuestas */}
                <Route path="/survey" element={<SurveyCode />} />
                <Route path="/survey/ongoing" element={<SurveyPage />} />
            </Routes>
        </BrowserRouter>
    );
}
