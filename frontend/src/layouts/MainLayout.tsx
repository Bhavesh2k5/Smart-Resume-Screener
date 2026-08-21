import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, FileSearch } from 'lucide-react';

export default function MainLayout() {
  const navItems = [
    { to: '/', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { to: '/jobs', icon: <Briefcase className="w-5 h-5" />, label: 'Jobs' },
    { to: '/candidates', icon: <Users className="w-5 h-5" />, label: 'Candidates' },
    { to: '/screener', icon: <FileSearch className="w-5 h-5" />, label: 'Smart Screener' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden flex bg-md-background">
      {/* Decorative Atmospheric Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-md-primary/10 blur-3xl pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] rounded-full bg-md-tertiary/10 blur-3xl pointer-events-none mix-blend-multiply" />
      
      {/* Sidebar Navigation */}
      <aside className="relative z-20 w-64 border-r border-md-outline/10 bg-md-surface/80 backdrop-blur-xl hidden md:flex flex-col">
        <div className="p-6 pb-2 border-b border-md-outline/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-md-primary text-white rounded-full">
              <FileSearch className="w-6 h-6" />
            </div>
            <h1 className="font-bold text-lg text-md-on-background tracking-tight leading-tight">
              Smart<br/>Screener
            </h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300 ease-md font-medium text-sm ${
                  isActive 
                    ? 'bg-md-secondary-container text-md-on-secondary-container shadow-sm' 
                    : 'text-md-on-surface-variant hover:bg-md-primary/5 hover:text-md-on-background'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 h-screen overflow-y-auto">
        <div className="p-4 md:p-8 max-w-6xl mx-auto pb-24">
          <Outlet />
        </div>
      </main>
      
      {/* Mobile Nav (Bottom Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-md-surface border-t border-md-outline/10 px-4 py-2 flex justify-between items-center shadow-lg pb-safe">
         {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${
                  isActive 
                    ? 'text-md-primary' 
                    : 'text-md-on-surface-variant hover:bg-md-primary/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-full ${isActive ? 'bg-md-secondary-container' : ''}`}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
      </div>
    </div>
  );
}
