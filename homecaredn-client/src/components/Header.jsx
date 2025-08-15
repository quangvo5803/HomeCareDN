import { contacts } from '../data';

export default function Header() {
  return (
    <header
      id="top"
      className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur border-b"
    >
      {/* Topbar (lg+) */}
      <div className="hidden lg:block bg-gray-50">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm text-gray-700">
            <div className="flex items-center gap-6">
              <div className="inline-flex items-center gap-2">
                <i className="fas fa-phone-alt" />
                <span>{contacts.phone}</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <i className="far fa-envelope-open" />
                <span>{contacts.email}</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <i className="far fa-clock" />
                <span>{contacts.hours}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {['facebook-f', 'twitter', 'linkedin-in', 'instagram'].map(
                (k) => (
                  <a
                    key={k}
                    href="#"
                    className="btn-square border-x first:rounded-l-lg last:rounded-r-lg"
                  >
                    <i className={`fab fa-${k}`} />
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="max-w-screen-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <i className="fa fa-building text-primary text-2xl" />
            <h1 className="h-heading text-2xl font-bold">APEX</h1>
          </a>
          <input id="nav-toggle" type="checkbox" className="peer hidden" />
          <label htmlFor="nav-toggle" className="lg:hidden cursor-pointer p-2">
            <span className="sr-only">Toggle Menu</span>
            <i className="fas fa-bars text-xl" />
          </label>
          <div className="peer-checked:block hidden lg:block">
            <ul className="flex flex-col lg:flex-row items-center gap-2 lg:gap-6 py-3 lg:py-0">
              {[
                ['Home', '#'],
                ['About Us', '#about'],
                ['Our Services', '#services'],
                ['Contact Us', '#footer'],
              ].map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-gray-700 hover:text-primary transition"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
