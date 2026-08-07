import { Outlet } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen bg-cream text-navy font-body">
      <Outlet />
    </div>
  );
}