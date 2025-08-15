import React, { useState } from 'react';
import { contacts } from '../data.js';
import { Link } from 'react-router-dom';

// New, more structured navigation data with a dropdown menu
const navItems = [
  { label: 'Home', href: '#', type: 'link' },
  { label: 'About Us', href: '#about', type: 'link' },
  {
    label: 'Our Services',
    href: '#',
    type: 'dropdown',
    submenu: [
      { label: 'Construction Home', href: '#services' },
      { label: 'Repair Home', href: '#services' },
      { label: 'Material', href: '#services' },
    ],
  },
  { label: 'Contact Us', href: '#footer', type: 'link' },
];

export default function Header() {
  // State to manage the visibility of the mobile dropdown menu
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  // Toggle function for the mobile services dropdown
  const toggleServices = () => {
    setIsServicesOpen(!isServicesOpen);
  };

  return (
    <header
      id="top"
      className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
    >
      {/* Topbar (lg+) */}
      <div className="hidden lg:block bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="flex items-center justify-between py-3 text-sm text-gray-600">
            <div className="flex items-center gap-8">
              <div className="inline-flex items-center gap-2 hover:text-blue-600 transition-colors">
                <i className="fas fa-phone-alt text-blue-500" />
                <span className="font-medium">{contacts.phone}</span>
              </div>
              <div className="inline-flex items-center gap-2 hover:text-blue-600 transition-colors">
                <i className="far fa-envelope-open text-blue-500" />
                <span className="font-medium">{contacts.email}</span>
              </div>
              <div className="inline-flex items-center gap-2 hover:text-blue-600 transition-colors">
                <i className="far fa-clock text-blue-500" />
                <span className="font-medium">{contacts.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navbar */}
      <nav className="max-w-screen-2xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center group">
            <div className="w-32 h-20 rounded-xl overflow-hidden group-hover:scale-110 transition-transform duration-300">
              <img
                src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749183824/logo_flxixf.png"
                alt="HomeCareDN Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </a>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
              />
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Navigation Menu (Desktop) */}
          <div className="hidden lg:flex items-center">
            <ul className="flex items-center gap-8 mr-8">
              {navItems.map((item) => (
                <li key={item.label} className="relative group">
                  {item.type === 'link' ? (
                    // Regular link item
                    <a
                      href={item.href}
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 relative"
                    >
                      {item.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
                    </a>
                  ) : (
                    // Dropdown menu item
                    <>
                      <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 relative focus:outline-none">
                        {item.label}
                        <i className="ml-2 fas fa-chevron-down text-xs transition-transform duration-300 group-hover:rotate-180" />
                      </button>
                      {/* Dropdown content */}
                      <ul className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 bg-white shadow-lg rounded-lg opacity-0 group-hover:opacity-100 group-hover:visible transition-all duration-300 invisible z-50">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.label}>
                            <a
                              href={subItem.href}
                              className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors rounded-lg"
                            >
                              {subItem.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </li>
              ))}
            </ul>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                Login
              </Link>
              <Link
                to="/register"
                type="button"
                className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
              >
                Register
              </Link>
              <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-50 border border-gray-300 hover:border-blue-500 rounded-full transition-all duration-300">
                <i className="fas fa-globe text-lg" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <input id="nav-toggle" type="checkbox" className="peer hidden" />
          <label
            htmlFor="nav-toggle"
            className="lg:hidden cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span className="sr-only">Toggle Menu</span>
            <i className="fas fa-bars text-xl text-gray-700" />
          </label>

          {/* Mobile Menu */}
          <div className="peer-checked:block hidden lg:hidden absolute top-full left-0 right-0 bg-white border-t shadow-lg">
            <div className="p-6 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Mobile Navigation */}
              <ul className="space-y-3">
                {navItems.map((item) => (
                  <li key={item.label}>
                    {item.type === 'link' ? (
                      // Regular link
                      <a
                        href={item.href}
                        className="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                      >
                        {item.label}
                      </a>
                    ) : (
                      // Dropdown item
                      <div>
                        <button
                          onClick={toggleServices}
                          className="w-full text-left py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors focus:outline-none flex justify-between items-center"
                        >
                          {item.label}
                          <i
                            className={`fas fa-chevron-down text-xs transition-transform duration-300 ${
                              isServicesOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isServicesOpen && (
                          <ul className="pl-4 mt-2 space-y-2">
                            {item.submenu.map((subItem) => (
                              <li key={subItem.label}>
                                <a
                                  href={subItem.href}
                                  className="block py-1 text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                  {subItem.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {/* Mobile Action Buttons */}
              <div className="pt-4 border-t space-y-3">
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    className="flex-1 py-3 text-gray-700 border border-gray-200 rounded-full hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    Register
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                    <i className="fas fa-globe" />
                    <span>Language</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
