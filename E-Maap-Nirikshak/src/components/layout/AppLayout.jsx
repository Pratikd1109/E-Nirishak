import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import ToastContainer from '../shared/Toast.jsx';

export default function AppLayout({ role }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar role={role} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
