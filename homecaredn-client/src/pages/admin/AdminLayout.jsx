import Sidebar from '../../components/admin/Sidebar';
import Navbar from '../../components/admin/Navbar';
import Footer from '../../components/admin/Footer';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="flex flex-col min-h-screen font-sans text-base antialiased font-normal leading-default bg-gray-50 text-slate-500">
      <div className="absolute w-full bg-blue-500 min-h-75"></div>
      <Sidebar />
      <div className="relative flex-1 transition-all duration-200 ease-in-out xl:ml-68 rounded-xl flex flex-col">
        <Navbar />
        <div className="w-full px-6 py-6 mx-auto flex-1">
          {/* Nơi render các trang con của admin */}
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
}
