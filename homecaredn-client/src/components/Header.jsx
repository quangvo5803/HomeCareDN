import { contacts } from '../data';

export default function Header() {
  return (
    <header
      id="top"
      className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b shadow-sm"
    >
      {/* Topbar (lg+) */}
      <div className="hidden lg:block bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="flex items-center justify-between py-3 text-sm text-gray-600">
            <div className="flex items-center gap-8">
              <div className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                <i className="fas fa-phone-alt text-primary" />
                <span className="font-medium">{contacts.phone}</span>
              </div>
              <div className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                <i className="far fa-envelope-open text-primary" />
                <span className="font-medium">{contacts.email}</span>
              </div>
              <div className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                <i className="far fa-clock text-primary" />
                <span className="font-medium">{contacts.hours}</span>
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
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
              />
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Navigation Menu (Desktop) */}
          <div className="hidden lg:flex items-center">
            <ul className="flex items-center gap-8 mr-8">
              {[
                ['Home', '#'],
                ['About Us', '#about'],
                ['Our Services', '#services'],
                ['Contact Us', '#footer'],
              ].map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-gray-700 hover:text-primary font-medium transition-colors duration-300 relative group"
                  >
                    {label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                  </a>
                </li>
              ))}
            </ul>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Login Button */}
              <button
                type="button"
                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                Login
              </button>

              {/* Register Button */}
              <button
                type="button"
                class="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
              >
                Register
              </button>

              {/* Globe Button */}
              <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-primary hover:bg-gray-50 border border-gray-300 hover:border-primary rounded-full transition-all duration-300">
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
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Mobile Navigation */}
              <ul className="space-y-3">
                {[
                  ['Home', '#'],
                  ['About Us', '#about'],
                  ['Our Services', '#services'],
                  ['Contact Us', '#footer'],
                ].map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="block py-2 text-gray-700 hover:text-primary font-medium transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Mobile Action Buttons */}
              <div className="pt-4 border-t space-y-3">
                <div className="flex gap-3">
                  <button className="flex-1 py-3 text-gray-700 border border-gray-200 rounded-full hover:border-primary hover:text-primary transition-colors">
                    Login
                  </button>
                  <button className="flex-1 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-full hover:shadow-lg transition-all">
                    Register
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-primary">
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
