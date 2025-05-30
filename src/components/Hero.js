import React from 'react';
import { Link } from 'react-router-dom';

function Hero() {
  return (
    // bg-gradient-to-r from-qadiyatuk-green to-green-700 pour changer background en un autre vert
    <section className="relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900 via-emerald-600 to-black text-white py-16 px-6 md:px-16 overflow-hidden animate-zoom-in">
      <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent animate-aurora z-0"></div>

      <div className="absolute inset-0 z-0">
        <div className="absolute top-5 right-5 w-2 h-2 bg-yellow-300 rounded-full animate-twinkle-1"></div>
        <div className="absolute top-15 left-10 w-3 h-3 bg-yellow-200 rounded-full animate-twinkle-2"></div>
        <div className="absolute bottom-5 right-1/3 w-2 h-2 bg-yellow-300 rounded-full animate-twinkle-3"></div>
        <div className="absolute bottom-10 left-1/4 w-3 h-3 bg-yellow-200 rounded-full animate-twinkle-4"></div>
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-twinkle-5"></div>
      </div>

      <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 z-10">
        <div className="md:w-1/2 text-center md:text-right">
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-white/20 animate-slide-in-left">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight">
              <span className="block max-w-[90%] mx-auto md:mx-0 text-right animate-gradient-reveal">
              ادارة مكتب المحاماة بسهولة مع{' '}
                <span className="relative inline-block bg-gradient-to-r from-yellow-300 to-yellow-600 text-transparent bg-clip-text">
                  قضيتك
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-300 rounded-full animate-sparkle"></span>
                  <span className="absolute -bottom-2 -left-2 w-4 h-4 bg-yellow-300 rounded-full animate-sparkle-delayed"></span>
                </span>
              </span>
            </h1>
            <p className="text-base md:text-xl mb-6 text-gray-100 leading-relaxed font-light animate-fade-in-up">
              منصة شاملة لإدارة القضايا، المواعيد، والعملاء بأمان وكفاءة.
            </p>
            <div className="flex gap-4 justify-center md:justify-end">
              <Link
                to="/register"
                className="relative px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-emerald-900 font-semibold rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(255,215,0,0.8)] transform transition-all duration-300 animate-bounce-in overflow-hidden"
                style={{ animationDelay: '0.5s' }}
              >
                <span className="absolute inset-0 bg-yellow-300 opacity-0 hover:opacity-30 animate-ripple transition-opacity duration-500"></span>
                ابدأ الآن
              </Link>
              <Link
                to="/features"
                className="relative px-6 py-3 bg-transparent border-2 border-yellow-400/50 text-white font-semibold rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(255,215,0,0.5)] hover:bg-yellow-400/20 hover:border-yellow-400/70 transition-all duration-300 animate-bounce-in overflow-hidden"
                style={{ animationDelay: '0.7s' }}
              >
                <span className="absolute inset-0 bg-yellow-300 opacity-0 hover:opacity-30 animate-ripple transition-opacity duration-500"></span>
                اكتشف الميزات
              </Link>
            </div>
          </div>
        </div>

        <div className="md:w-1/2 animate-slide-in-right">
          <div className="relative w-full max-w-sm mx-auto group">
            <div className="relative transform transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] animate-float">
              <img
                src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Lawyer with gavel and documents"
                className="w-full rounded-lg shadow-2xl transform group-hover:rotate-0 transition-all duration-500"
              />
              <div className="absolute inset-0 border-4 border-transparent rounded-lg bg-gradient-to-r from-yellow-400/30 via-emerald-400/30 to-yellow-400/30 animate-holographic"></div>
              <div className="absolute inset-0 bg-yellow-400/20 rounded-lg blur-xl -z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;