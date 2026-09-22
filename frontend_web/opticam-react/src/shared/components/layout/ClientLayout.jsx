// src/shared/components/layout/ClientLayout.jsx
import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatBot } from '../chatbot/ChatBot';

export const ClientLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <ChatBot />
      <Footer />
    </div>
  );
};