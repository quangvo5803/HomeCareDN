import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#111827] text-gray-400 font-sans">
      <div className="container mx-auto max-w-screen-xl px-4 py-16 lg:px-6 lg:py-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Cột 1: Logo và Mô tả */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              {/* Thay thế bằng logo thực tế của bạn nếu cần */}
              <div className="bg-orange-500 w-8 h-8 flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-white text-3xl font-bold">APEX</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Diam dolor diam ipsum sit. Aliqu diam amet diam et eos. Clita erat ipsum et lorem et elit, sed stet lorem sit clita.
            </p>
            <div className="flex space-x-2">
              <a href="#" className="flex items-center justify-center w-8 h-8 rounded border border-gray-600 text-gray-400 hover:text-white hover:border-white transition-colors duration-300">
                <i className="fab fa-twitter" />
              </a>
              <a href="#" className="flex items-center justify-center w-8 h-8 rounded border border-gray-600 text-gray-400 hover:text-white hover:border-white transition-colors duration-300">
                <i className="fab fa-facebook-f" />
              </a>
              <a href="#" className="flex items-center justify-center w-8 h-8 rounded border border-gray-600 text-gray-400 hover:text-white hover:border-white transition-colors duration-300">
                <i className="fab fa-youtube" />
              </a>
              <a href="#" className="flex items-center justify-center w-8 h-8 rounded border border-gray-600 text-gray-400 hover:text-white hover:border-white transition-colors duration-300">
                <i className="fab fa-linkedin-in" />
              </a>
            </div>
          </div>

          {/* Cột 2: Địa chỉ */}
          <div>
            <h2 className="text-white text-2xl font-bold mb-4">Address</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-3 text-orange-500" />
                <span>123 Street, New York, USA</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-phone-alt mt-1 mr-3 text-orange-500" />
                <span>+012 345 67890</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-envelope-open mt-1 mr-3 text-orange-500" />
                <span>info@example.com</span>
              </li>
            </ul>
          </div>

          {/* Cột 3: Liên kết nhanh */}
          <div>
            <h2 className="text-white text-2xl font-bold mb-4">Quick Links</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <i className="fas fa-chevron-right mr-3 text-orange-500" />
                <a href="#" className="hover:text-white transition-colors duration-300">
                  About Us
                </a>
              </li>
              <li className="flex items-center">
                <i className="fas fa-chevron-right mr-3 text-orange-500" />
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Contact Us
                </a>
              </li>
              <li className="flex items-center">
                <i className="fas fa-chevron-right mr-3 text-orange-500" />
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Our Services
                </a>
              </li>
              <li className="flex items-center">
                <i className="fas fa-chevron-right mr-3 text-orange-500" />
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Terms & Condition
                </a>
              </li>
              <li className="flex items-center">
                <i className="fas fa-chevron-right mr-3 text-orange-500" />
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 4: Newsletter */}
          <div>
            <h2 className="text-white text-2xl font-bold mb-4">Newsletter</h2>
            <p className="text-sm mb-4">
              Dolor amet sit justo amet elitr clita ipsum elitr est.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="w-full bg-[#1e293b] text-gray-200 border border-[#1e293b] focus:outline-none focus:border-orange-500 px-4 py-3 text-sm"
              />
              <button className="bg-orange-500 text-white font-medium px-6 py-3 hover:bg-orange-600 transition-colors duration-300">
                SignUp
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dòng dưới cùng */}
      <div className="border-t border-gray-700 mt-8 py-4 text-center text-gray-500 text-sm">
        <div className="container mx-auto max-w-screen-xl px-4 lg:px-6 flex flex-col md:flex-row justify-between items-center">
          <p>© Your Site Name. All Right Reserved.</p>
          <p>
            Designed By <a href="https://htmlcodex.com" className="text-orange-500 hover:underline">HTML Codex</a>
            <br className="md:hidden" />
            Distributed By: <a href="https://themewagon.com" className="text-orange-500 hover:underline">ThemeWagon</a>
          </p>
        </div>
      </div>
    </footer>
  );
}