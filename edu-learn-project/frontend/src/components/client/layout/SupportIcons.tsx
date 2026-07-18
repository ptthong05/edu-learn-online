'use client';

import { useState, useEffect } from 'react';

export default function SupportIcons() {
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const icons = [
    {
      id: 'facebook',
      name: 'Facebook',
      href: 'https://www.facebook.com/thong.phamtan.18?rdid=2hYEGFT7yRYJmbIg&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1JJ8oXaRB5%2F#',
      color: 'bg-blue-600',
      hoverColor: 'bg-blue-700',
      rippleColor: '#2563eb',
      icon: (
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      id: 'zalo',
      name: 'Zalo',
      href: 'https://zalo.me/0932525650',
      color: 'bg-blue-500',
      hoverColor: 'bg-blue-600',
      rippleColor: '#3b82f6',
      icon: (
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.49 10.2722v-.4496h1.3467v6.3218h-.7704a.576.576 0 01-.5763-.5729l-.0006.0005a3.273 3.273 0 01-1.9372.6321c-1.8138 0-3.2844-1.4697-3.2844-3.2823 0-1.8125 1.4706-3.2822 3.2844-3.2822a3.273 3.273 0 011.9372.6321l.0006.0005zM6.9188 7.7896v.205c0 .3823-.051.6944-.2995 1.0605l-.03.0343c-.0542.0615-.1815.206-.2421.2843L2.024 14.8h4.8948v.7682a.5764.5764 0 01-.5767.5761H0v-.3622c0-.4436.1102-.6414.2495-.8476L4.8582 9.23H.1922V7.7896h6.7266zm8.5513 8.3548a.4805.4805 0 01-.4803-.4798v-7.875h1.4416v8.3548H15.47zM20.6934 9.6C22.52 9.6 24 11.0807 24 12.9044c0 1.8252-1.4801 3.306-3.3066 3.306-1.8264 0-3.3066-1.4808-3.3066-3.306 0-1.8237 1.4802-3.3044 3.3066-3.3044zm-10.1412 5.253c1.0675 0 1.9324-.8645 1.9324-1.9312 0-1.065-.865-1.9295-1.9324-1.9295s-1.9324.8644-1.9324 1.9295c0 1.0667.865 1.9312 1.9324 1.9312zm10.1412-.0033c1.0737 0 1.945-.8707 1.945-1.9453 0-1.073-.8713-1.9436-1.945-1.9436-1.0753 0-1.945.8706-1.945 1.9436 0 1.0746.8697 1.9453 1.945 1.9453z"/>
        </svg>
      ),
    },
    {
      id: 'telegram',
      name: 'Telegram',
      href: 'https://t.me/0932525650',
      color: 'bg-sky-500',
      hoverColor: 'bg-sky-600',
      rippleColor: '#0ea5e9',
      icon: (
        <svg className="w-7 h-7 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-5 items-center">
      {/* Social Contacts List */}
      <div className="flex flex-col gap-5">
        {icons.map((icon, index) => (
          <a
            key={icon.id}
            href={icon.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              group relative flex items-center justify-center
              w-14 h-14 ${icon.color} ${hoveredIcon === icon.id ? icon.hoverColor : ''}
              rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl
              animate-wobble
            `}
            style={{ 
              animationDelay: `${index * 0.7}s`,
            }}
            onMouseEnter={() => setHoveredIcon(icon.id)}
            onMouseLeave={() => setHoveredIcon(null)}
            title={icon.name}
          >
            {/* Ripple effect circles */}
            <span 
              className="absolute inset-0 rounded-full opacity-75 animate-ripple" 
              style={{ 
                backgroundColor: icon.rippleColor,
                animationDelay: '0s' 
              }}
            ></span>
            <span 
              className="absolute inset-0 rounded-full opacity-75 animate-ripple" 
              style={{ 
                backgroundColor: icon.rippleColor,
                animationDelay: '0.5s' 
              }}
            ></span>
            <span 
              className="absolute inset-0 rounded-full opacity-75 animate-ripple" 
              style={{ 
                backgroundColor: icon.rippleColor,
                animationDelay: '1s' 
              }}
            ></span>
            
            {/* Icon */}
            <span className="relative z-10">
              {icon.icon}
            </span>
            
            {/* Tooltip */}
            <span className="
              absolute right-full mr-3 px-3 py-1.5
              bg-gray-800 text-white text-xs rounded-lg
              opacity-0 group-hover:opacity-100
              transition-opacity duration-300
              whitespace-nowrap
              pointer-events-none
              shadow-md
            ">
              {icon.name}
              <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></span>
            </span>
          </a>
        ))}
      </div>

      {/* Scroll to Top button */}
      <button
        onClick={scrollToTop}
        className={`
          w-14 h-14 rounded-full bg-orange-400 hover:bg-orange-500 text-white
          shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110
          ${showScrollTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}
        `}
        title="Cuộn lên đầu trang"
      >
        <svg className="w-7 h-7 stroke-current" fill="none" strokeWidth={3} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}