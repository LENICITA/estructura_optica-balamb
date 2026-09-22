// src/shared/components/layout/UserLayout.jsx
import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export const UserLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};