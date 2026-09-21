import React from 'react';

export const TopBanner: React.FC = () => {
  return (
    <aside 
      id="announcement-banner"
      className="bg-[#f8efe8] text-[#2c2320] border-b border-[#ebdcd3] px-4 py-1.5 text-[12px] sm:text-[13px] font-['Open_Sans',sans-serif] font-normal tracking-normal text-center relative z-40"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <a
          href="https://www.patreon.com/cw/Stickyandkawaii62"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline transition-colors block text-center"
        >
          Abonne-toi pour la gazette de Septembre jusqu'au 30-09
        </a>
      </div>
    </aside>
  );
};

