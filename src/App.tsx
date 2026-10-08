import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import { SalonProvider } from '@/contexts/SalonContext';
import { routes } from './routes';

const App: React.FC = () => {
  return (
    <Router>
      <SalonProvider>
        <IntersectObserver />
        <div className="flex flex-col min-h-screen bg-background text-foreground">
          <Routes>
            {routes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Toaster position="top-right" richColors />
      </SalonProvider>
    </Router>
  );
};

export default App;
