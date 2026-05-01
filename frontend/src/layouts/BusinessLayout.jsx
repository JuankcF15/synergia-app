import React from 'react';
import { Outlet } from 'react-router-dom';
import { BusinessProvider } from '../context/BusinessContext';

export default function BusinessLayout() {
    return (
        <BusinessProvider>
            <Outlet />
        </BusinessProvider>
    );
}
