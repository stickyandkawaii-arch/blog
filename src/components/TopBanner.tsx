import React from 'react';

export const TopBanner: React.FC = () => {
  return (
    <aside 
      id="announcement-banner"
      className="bg-[#F7ECE3] text-[#4A3B32] border-b border-[#ebdcd3] px-4 py-2 text-xs sm:text-sm font-normal tracking-normal text-center relative z-40 font-sans"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <a
          href="https://www.patreon.com/cw/Stickyandkawaii62"
          target="_parent"
          className="hover:underline transition-colors block text-center"
        >
          Abonne-toi pour la gazette de Septembre jusqu'au 30-09
        </a>
      </div>
    </aside>
  );
};

