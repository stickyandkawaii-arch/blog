import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Table as TableIcon,
  MoreHorizontal,
  Code,
  ChevronDown,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Type,
  Plus,
  Trash2,
  X,
  Check,
  Palette
} from 'lucide-react';

interface ShopifyHtmlEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export const ShopifyHtmlEditor: React.FC<ShopifyHtmlEditorProps> = ({
  value,
  onChange,
  placeholder = 'Rédigez votre contenu HTML ici...'
}) => {
  // Mode: false = Visual WYSIWYG, true = Raw HTML Code
  const [showHtmlCode, setShowHtmlCode] = useState(false);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<string[]>([value || '']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState<'format' | 'color' | 'align' | 'table' | 'more' | 'ai' | null>(null);

  // Modals
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkText, setLinkText] = useState('');
  const [linkNewTab, setLinkNewTab] = useState(true);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  // Editable div ref
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sync internal contenteditable with value prop
  useEffect(() => {
    if (!showHtmlCode && editorRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, showHtmlCode]);

  // Record history snapshot helper
  const recordHistory = (newHtml: string) => {
    setHistory((prevHistory) => {
      const currentSnapshot = prevHistory[historyIndex];
      if (currentSnapshot === newHtml) return prevHistory;
      const sliced = prevHistory.slice(0, historyIndex + 1);
      const next = [...sliced, newHtml];
      if (next.length > 50) next.shift(); // Limit max history depth
      return next;
    });
    setHistoryIndex((prevIdx) => {
      const slicedLen = history.slice(0, prevIdx + 1).length;
      return Math.min(slicedLen, 49);
    });
  };

  // Handle input in visual mode
  const handleVisualInput = () => {
    if (editorRef.current) {
      isInternalChange.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html);
      recordHistory(html);
    }
  };

  // Undo handler
  const handleUndo = () => {
    if (!showHtmlCode) {
      document.execCommand('undo', false);
      if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        onChange(html);
      }
    }
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevContent = history[prevIndex];
      setHistoryIndex(prevIndex);
      onChange(prevContent);
      if (!showHtmlCode && editorRef.current) {
        editorRef.current.innerHTML = prevContent;
      }
    }
    setActiveDropdown(null);
  };

  // Redo handler
  const handleRedo = () => {
    if (!showHtmlCode) {
      document.execCommand('redo', false);
      if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        onChange(html);
      }
    }
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextContent = history[nextIndex];
      setHistoryIndex(nextIndex);
      onChange(nextContent);
      if (!showHtmlCode && editorRef.current) {
        editorRef.current.innerHTML = nextContent;
      }
    }
    setActiveDropdown(null);
  };

  // Helper to execute document commands
  const execCmd = (command: string, valueArg: string | undefined = undefined) => {
    if (showHtmlCode) {
      if (command === 'insertUnorderedList') {
        insertHtmlAtCursor('<ul>\n  <li>Élément 1</li>\n  <li>Élément 2</li>\n</ul>');
      } else if (command === 'insertOrderedList') {
        insertHtmlAtCursor('<ol>\n  <li>Premier élément</li>\n  <li>Deuxième élément</li>\n</ol>');
      }
      setActiveDropdown(null);
      return;
    }

    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, valueArg);
    handleVisualInput();
    setActiveDropdown(null);
  };

  // Helper to insert HTML snippet at current selection or end
  const insertHtmlAtCursor = (htmlSnippet: string) => {
    if (showHtmlCode) {
      onChange(value + '\n' + htmlSnippet);
      return;
    }

    if (editorRef.current) {
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const el = document.createElement('div');
        el.innerHTML = htmlSnippet;
        const frag = document.createDocumentFragment();
        let node: Node | null;
        let lastNode: Node | null = null;
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        if (lastNode) {
          range.setStartAfter(lastNode);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      } else {
        editorRef.current.innerHTML += htmlSnippet;
      }
      handleVisualInput();
    }
  };

  // Format block (Paragraph, H1, H2, H3, H4, Quote)
  const setFormatBlock = (tag: string) => {
    if (tag === 'p') execCmd('formatBlock', '<p>');
    else if (tag === 'h1') execCmd('formatBlock', '<h1>');
    else if (tag === 'h2') execCmd('formatBlock', '<h2>');
    else if (tag === 'h3') execCmd('formatBlock', '<h3>');
    else if (tag === 'h4') execCmd('formatBlock', '<h4>');
    else if (tag === 'blockquote') execCmd('formatBlock', '<blockquote>');
    setActiveDropdown(null);
  };

  // Apply text color
  const applyTextColor = (colorHex: string) => {
    execCmd('foreColor', colorHex);
    setActiveDropdown(null);
  };

  // Insert Link
  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl) return;
    const label = linkText.trim() || linkUrl;
    const targetAttr = linkNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
    const linkHtml = `<a href="${linkUrl}"${targetAttr} class="text-[#7c3aed] font-semibold underline hover:text-[#5b21b6] transition-colors">${label}</a>`;
    insertHtmlAtCursor(linkHtml);
    setIsLinkModalOpen(false);
    setLinkUrl('https://');
    setLinkText('');
  };

  // Insert Image
  const handleInsertImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;
    const imgHtml = `<img src="${imageUrl}" alt="${imageAlt || 'Image'}" class="max-w-full h-auto rounded-2xl my-4 border border-[#e5dbf7] shadow-xs" />`;
    insertHtmlAtCursor(imgHtml);
    setIsImageModalOpen(false);
    setImageUrl('');
    setImageAlt('');
  };

  // Insert Video Embed
  const handleInsertVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;
    let embedUrl = videoUrl;
    if (videoUrl.includes('youtube.com/watch?v=')) {
      embedUrl = videoUrl.replace('watch?v=', 'embed/');
    } else if (videoUrl.includes('youtu.be/')) {
      embedUrl = videoUrl.replace('youtu.be/', 'youtube.com/embed/');
    }
    const videoHtml = `<div className="my-4 aspect-video rounded-2xl overflow-hidden border border-[#e5dbf7] shadow-xs"><iframe src="${embedUrl}" class="w-full h-full" frameborder="0" allowfullscreen></iframe></div>`;
    insertHtmlAtCursor(videoHtml);
    setIsVideoModalOpen(false);
    setVideoUrl('');
  };

  // Table operations matching Shopify Image 3 dropdown
  const handleInsertTable = () => {
    const tableHtml = `
<table class="w-full my-6 border-collapse border border-[#e5dbf7] rounded-2xl overflow-hidden text-sm">
  <thead>
    <tr class="bg-gradient-to-r from-purple-100/90 to-pink-100/90 text-[#3D2E39] font-bold">
      <th class="p-3 border border-[#e5dbf7] text-left">Article / Produit</th>
      <th class="p-3 border border-[#e5dbf7] text-left">Finition</th>
      <th class="p-3 border border-[#e5dbf7] text-left">Format</th>
    </tr>
  </thead>
  <tbody>
    <tr class="hover:bg-purple-50/40 transition-colors">
      <td class="p-3 border border-[#e5dbf7]">Sticker Chat Stellaires ✨</td>
      <td class="p-3 border border-[#e5dbf7]">Holographique</td>
      <td class="p-3 border border-[#e5dbf7]">7 x 7 cm</td>
    </tr>
    <tr class="bg-[#faf8fc] hover:bg-purple-50/40 transition-colors">
      <td class="p-3 border border-[#e5dbf7]">Washi Tape Sakura 🌸</td>
      <td class="p-3 border border-[#e5dbf7]">Dorure Or Rose</td>
      <td class="p-3 border border-[#e5dbf7]">15 mm x 10 m</td>
    </tr>
  </tbody>
</table>
<p><br></p>
`.trim();
    insertHtmlAtCursor(tableHtml);
    setActiveDropdown(null);
  };

  // Modify Table Helpers
  const findParentTag = (tagName: string): HTMLElement | null => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node: Node | null = sel.getRangeAt(0).startContainer;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName.toLowerCase() === tagName.toLowerCase()) {
        return node as HTMLElement;
      }
      node = node.parentNode;
    }
    return null;
  };

  const handleInsertRowAbove = () => {
    const tr = findParentTag('tr');
    if (tr) {
      const cellCount = tr.children.length;
      const newTr = document.createElement('tr');
      newTr.className = 'hover:bg-purple-50/40 transition-colors';
      for (let i = 0; i < cellCount; i++) {
        const td = document.createElement('td');
        td.className = 'p-3 border border-[#e5dbf7]';
        td.innerHTML = 'Nouvelle cellule';
        newTr.appendChild(td);
      }
      tr.parentNode?.insertBefore(newTr, tr);
      handleVisualInput();
    } else {
      handleInsertTable();
    }
    setActiveDropdown(null);
  };

  const handleInsertRowBelow = () => {
    const tr = findParentTag('tr');
    if (tr) {
      const cellCount = tr.children.length;
      const newTr = document.createElement('tr');
      newTr.className = 'hover:bg-purple-50/40 transition-colors';
      for (let i = 0; i < cellCount; i++) {
        const td = document.createElement('td');
        td.className = 'p-3 border border-[#e5dbf7]';
        td.innerHTML = 'Nouvelle cellule';
        newTr.appendChild(td);
      }
      tr.parentNode?.insertBefore(newTr, tr.nextSibling);
      handleVisualInput();
    } else {
      handleInsertTable();
    }
    setActiveDropdown(null);
  };

  const handleInsertColBefore = () => {
    const td = findParentTag('td') || findParentTag('th');
    const table = findParentTag('table');
    if (td && table) {
      const colIdx = (td as HTMLTableCellElement).cellIndex;
      const rows = table.querySelectorAll('tr');
      rows.forEach((row) => {
        const isHeader = row.parentNode?.nodeName.toLowerCase() === 'thead';
        const newCell = document.createElement(isHeader ? 'th' : 'td');
        newCell.className = isHeader ? 'p-3 border border-[#e5dbf7] text-left font-bold' : 'p-3 border border-[#e5dbf7]';
        newCell.innerHTML = isHeader ? 'Colonne' : 'Donnée';
        const targetCell = row.children[colIdx];
        if (targetCell) {
          row.insertBefore(newCell, targetCell);
        } else {
          row.appendChild(newCell);
        }
      });
      handleVisualInput();
    }
    setActiveDropdown(null);
  };

  const handleInsertColAfter = () => {
    const td = findParentTag('td') || findParentTag('th');
    const table = findParentTag('table');
    if (td && table) {
      const colIdx = (td as HTMLTableCellElement).cellIndex;
      const rows = table.querySelectorAll('tr');
      rows.forEach((row) => {
        const isHeader = row.parentNode?.nodeName.toLowerCase() === 'thead';
        const newCell = document.createElement(isHeader ? 'th' : 'td');
        newCell.className = isHeader ? 'p-3 border border-[#e5dbf7] text-left font-bold' : 'p-3 border border-[#e5dbf7]';
        newCell.innerHTML = isHeader ? 'Colonne' : 'Donnée';
        const targetCell = row.children[colIdx];
        if (targetCell) {
          row.insertBefore(newCell, targetCell.nextSibling);
        } else {
          row.appendChild(newCell);
        }
      });
      handleVisualInput();
    }
    setActiveDropdown(null);
  };

  const handleDeleteRow = () => {
    const tr = findParentTag('tr');
    if (tr) {
      tr.remove();
      handleVisualInput();
    }
    setActiveDropdown(null);
  };

  const handleDeleteCol = () => {
    const td = findParentTag('td') || findParentTag('th');
    const table = findParentTag('table');
    if (td && table) {
      const colIdx = (td as HTMLTableCellElement).cellIndex;
      const rows = table.querySelectorAll('tr');
      rows.forEach((row) => {
        if (row.children[colIdx]) {
          row.children[colIdx].remove();
        }
      });
      handleVisualInput();
    }
    setActiveDropdown(null);
  };

  const handleDeleteTable = () => {
    const table = findParentTag('table');
    if (table) {
      table.remove();
      handleVisualInput();
    }
    setActiveDropdown(null);
  };

  const kawaiiColors = [
    { name: 'Satan Violet', hex: '#7c3aed' },
    { name: 'Rose Bonbon', hex: '#db2777' },
    { name: 'Lilas Doux', hex: '#9333ea' },
    { name: 'Menthe Fraîche', hex: '#059669' },
    { name: 'Miel Doré', hex: '#d97706' },
    { name: 'Bleu Céleste', hex: '#2563eb' },
    { name: 'Gris Sombre', hex: '#334155' },
  ];

  return (
    <div className="w-full border border-[#e5dbf7] rounded-3xl bg-white shadow-xs relative">
      
      {/* SHOPIFY STYLE TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 sm:p-2.5 bg-[#faf8fc] border-b border-[#e5dbf7] select-none text-slate-700 rounded-t-3xl">
        
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          
          {/* 1. Sparkles (AI Magic assist) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'ai' ? null : 'ai')}
              className="p-2 rounded-xl text-purple-700 hover:bg-purple-100/70 transition-colors cursor-pointer flex items-center gap-1"
              title="Générer du contenu avec l'IA"
            >
              <Sparkles className="w-4 h-4 fill-purple-200 text-purple-600" />
            </button>
            {activeDropdown === 'ai' && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-[#e5dbf7] rounded-2xl shadow-xl z-30 p-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    insertHtmlAtCursor('<p>✨ <strong>Note créative :</strong> Tous nos produits sont fabriqués artisanalement dans notre atelier avec une attention particulière portée aux détails kawaii.</p>');
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left p-2 hover:bg-purple-50 rounded-xl font-medium"
                >
                  ✨ Insérer un encadré créatif
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleInsertTable();
                  }}
                  className="w-full text-left p-2 hover:bg-purple-50 rounded-xl font-medium"
                >
                  📊 Insérer un tableau comparatif
                </button>
              </div>
            )}
          </div>

          {/* Undo (Annuler / Revenir en arrière) */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
              historyIndex > 0
                ? 'text-slate-700 hover:bg-white hover:text-purple-700 hover:shadow-xs'
                : 'text-slate-300 cursor-not-allowed opacity-50'
            }`}
            title="Annuler / Revenir en arrière (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>

          {/* Redo (Rétablir) */}
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
              historyIndex < history.length - 1
                ? 'text-slate-700 hover:bg-white hover:text-purple-700 hover:shadow-xs'
                : 'text-slate-300 cursor-not-allowed opacity-50'
            }`}
            title="Rétablir / Répéter (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 my-auto mx-0.5" />

          {/* 2. Format Dropdown (Paragraphe v) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'format' ? null : 'format')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#3D2E39] hover:bg-white hover:shadow-xs transition-all cursor-pointer flex items-center gap-1 border border-transparent hover:border-[#e5dbf7]"
            >
              <span>Paragraphe</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {activeDropdown === 'format' && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-[#e5dbf7] rounded-2xl shadow-xl z-30 p-1.5 text-xs space-y-0.5">
                <button
                  type="button"
                  onClick={() => setFormatBlock('p')}
                  className="w-full text-left px-3 py-2 hover:bg-purple-50 rounded-xl font-medium flex items-center gap-2"
                >
                  <Type className="w-3.5 h-3.5 text-slate-500" />
                  <span>Paragraphe (Texte)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormatBlock('h1')}
                  className="w-full text-left px-3 py-2 hover:bg-purple-50 rounded-xl font-bold flex items-center gap-2 text-lg text-[#3D2E39]"
                >
                  <Heading1 className="w-4 h-4 text-purple-600" />
                  <span>Titre 1</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormatBlock('h2')}
                  className="w-full text-left px-3 py-2 hover:bg-purple-50 rounded-xl font-bold flex items-center gap-2 text-base text-[#3D2E39]"
                >
                  <Heading2 className="w-4 h-4 text-purple-600" />
                  <span>Titre 2</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormatBlock('h3')}
                  className="w-full text-left px-3 py-2 hover:bg-purple-50 rounded-xl font-bold flex items-center gap-2 text-sm text-[#4c1d95]"
                >
                  <Heading3 className="w-4 h-4 text-purple-600" />
                  <span>Titre 3</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormatBlock('h4')}
                  className="w-full text-left px-3 py-2 hover:bg-purple-50 rounded-xl font-semibold flex items-center gap-2 text-xs text-[#4c1d95]"
                >
                  <Heading4 className="w-4 h-4 text-purple-600" />
                  <span>Titre 4</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormatBlock('blockquote')}
                  className="w-full text-left px-3 py-2 hover:bg-purple-50 rounded-xl font-medium italic flex items-center gap-2"
                >
                  <Quote className="w-3.5 h-3.5 text-amber-600" />
                  <span>Citation</span>
                </button>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-200 my-auto mx-0.5" />

          {/* 3. Bold (B) */}
          <button
            type="button"
            onClick={() => execCmd('bold')}
            className="p-1.5 rounded-lg hover:bg-white hover:text-purple-700 hover:shadow-xs transition-all cursor-pointer font-bold text-sm"
            title="Gras (B)"
          >
            <Bold className="w-4 h-4" />
          </button>

          {/* 4. Italic (I) */}
          <button
            type="button"
            onClick={() => execCmd('italic')}
            className="p-1.5 rounded-lg hover:bg-white hover:text-purple-700 hover:shadow-xs transition-all cursor-pointer text-sm"
            title="Italique (I)"
          >
            <Italic className="w-4 h-4" />
          </button>

          {/* 5. Underline (U) */}
          <button
            type="button"
            onClick={() => execCmd('underline')}
            className="p-1.5 rounded-lg hover:bg-white hover:text-purple-700 hover:shadow-xs transition-all cursor-pointer text-sm"
            title="Souligné (U)"
          >
            <Underline className="w-4 h-4" />
          </button>

          {/* 6. Text Color (A v) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'color' ? null : 'color')}
              className="p-1.5 rounded-lg hover:bg-white hover:text-purple-700 hover:shadow-xs transition-all cursor-pointer flex items-center gap-0.5"
              title="Couleur du texte"
            >
              <div className="flex items-center">
                <span className="font-bold underline text-xs">A</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </button>
            {activeDropdown === 'color' && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-[#e5dbf7] rounded-2xl shadow-xl z-30 grid grid-cols-4 gap-1.5">
                {kawaiiColors.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => applyTextColor(col.hex)}
                    className="w-7 h-7 rounded-full border border-slate-200 transition-transform hover:scale-110 cursor-pointer shadow-xs"
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-200 my-auto mx-0.5" />

          {/* 7. Alignment dropdown (☰ v) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'align' ? null : 'align')}
              className="p-1.5 rounded-lg hover:bg-white hover:text-purple-700 hover:shadow-xs transition-all cursor-pointer flex items-center gap-0.5"
              title="Alignement du texte"
            >
              <AlignLeft className="w-4 h-4" />
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {activeDropdown === 'align' && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-[#e5dbf7] rounded-2xl shadow-xl z-30 p-1 text-xs space-y-0.5">
                <button
                  type="button"
                  onClick={() => execCmd('justifyLeft')}
                  className="w-full text-left px-3 py-1.5 hover:bg-purple-50 rounded-xl font-medium flex items-center gap-2"
                >
                  <AlignLeft className="w-3.5 h-3.5" /> Alignés à gauche
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('justifyCenter')}
                  className="w-full text-left px-3 py-1.5 hover:bg-purple-50 rounded-xl font-medium flex items-center gap-2"
                >
                  <AlignCenter className="w-3.5 h-3.5" /> Centrer
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('justifyRight')}
                  className="w-full text-left px-3 py-1.5 hover:bg-purple-50 rounded-xl font-medium flex items-center gap-2"
                >
                  <AlignRight className="w-3.5 h-3.5" /> Alignés à droite
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('justifyFull')}
                  className="w-full text-left px-3 py-1.5 hover:bg-purple-50 rounded-xl font-medium flex items-center gap-2"
                >
                  <AlignJustify className="w-3.5 h-3.5" /> Justifier
                </button>
              </div>
            )}
          </div>

          {/* Liste à puces */}
          <button
            type="button"
            onClick={() => execCmd('insertUnorderedList')}
            className="p-1.5 rounded-lg hover:bg-white hover:text-purple-700 hover:shadow-xs transition-all cursor-pointer text-slate-700"
            title="Liste à puces"
          >
            <List className="w-4 h-4" />
          </button>

          {/* Liste numérotée */}
          <button
            type="button"
            onClick={() => execCmd('insertOrderedList')}
            className="p-1.5 rounded-lg hover:bg-white hover:text-purple-700 hover:shadow-xs transition-all cursor-pointer text-slate-700"
            title="Liste numérotée"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          {/* 8. Link (🔗) */}
          <button
            type="button"
            onClick={() => setIsLinkModalOpen(true)}
            className="p-1.5 rounded-lg hover:bg-white hover:text-purple-700 hover:shadow-xs transition-all cursor-pointer"
            title="Insérer un lien (URL)"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          {/* 9. Image (🖼️) */}
          <button
            type="button"
            onClick={() => setIsImageModalOpen(true)}
            className="p-1.5 rounded-lg hover:bg-white hover:text-purple-700 hover:shadow-xs transition-all cursor-pointer"
            title="Insérer une image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* 10. Video (▶️) */}
          <button
            type="button"
            onClick={() => setIsVideoModalOpen(true)}
            className="p-1.5 rounded-lg hover:bg-white hover:text-purple-700 hover:shadow-xs transition-all cursor-pointer"
            title="Insérer une vidéo (YouTube, iframe)"
          >
            <Video className="w-4 h-4" />
          </button>

          {/* 11. Table dropdown (▦ v) - SHOPIFY IMAGE 3 DESIGN */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'table' ? null : 'table')}
              className="px-2 py-1.5 rounded-xl hover:bg-white hover:text-purple-700 hover:shadow-xs transition-all cursor-pointer flex items-center gap-1 border border-transparent hover:border-[#e5dbf7]"
              title="Options de Tableau"
            >
              <TableIcon className="w-4 h-4" />
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {activeDropdown === 'table' && (
              <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-1 w-60 bg-white border border-[#e5dbf7] rounded-2xl shadow-2xl z-30 p-2 text-xs font-medium space-y-1 text-slate-700 divide-y divide-slate-100">
                <div className="pb-1">
                  <button
                    type="button"
                    onClick={handleInsertTable}
                    className="w-full text-left px-3 py-2 hover:bg-purple-50 rounded-xl font-bold text-[#4C2882] flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Insérer un tableau</span>
                  </button>
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={handleInsertRowAbove}
                    className="w-full text-left px-3 py-1.5 hover:bg-purple-50 rounded-xl transition-colors"
                  >
                    Insérer une rangée au-dessus
                  </button>
                  <button
                    type="button"
                    onClick={handleInsertRowBelow}
                    className="w-full text-left px-3 py-1.5 hover:bg-purple-50 rounded-xl transition-colors"
                  >
                    Insérer une ligne en dessous
                  </button>
                  <button
                    type="button"
                    onClick={handleInsertColBefore}
                    className="w-full text-left px-3 py-1.5 hover:bg-purple-50 rounded-xl transition-colors"
                  >
                    Insérer une colonne avant
                  </button>
                  <button
                    type="button"
                    onClick={handleInsertColAfter}
                    className="w-full text-left px-3 py-1.5 hover:bg-purple-50 rounded-xl transition-colors"
                  >
                    Insérer une colonne après
                  </button>
                </div>

                <div className="pt-1 space-y-0.5 text-rose-600">
                  <button
                    type="button"
                    onClick={handleDeleteRow}
                    className="w-full text-left px-3 py-1.5 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    Supprimer la ligne
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCol}
                    className="w-full text-left px-3 py-1.5 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    Supprimer la colonne
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteTable}
                    className="w-full text-left px-3 py-1.5 hover:bg-rose-50 rounded-xl transition-colors font-bold"
                  >
                    Supprimer le tableau
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 12. More Options (...) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'more' ? null : 'more')}
              className="p-1.5 rounded-lg hover:bg-white hover:text-purple-700 hover:shadow-xs transition-all cursor-pointer"
              title="Plus d'options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {activeDropdown === 'more' && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-[#e5dbf7] rounded-2xl shadow-xl z-30 p-1.5 text-xs space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    execCmd('insertUnorderedList');
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-purple-50 rounded-xl font-medium flex items-center gap-2"
                >
                  <List className="w-3.5 h-3.5" /> Liste à puces
                </button>
                <button
                  type="button"
                  onClick={() => {
                    execCmd('insertOrderedList');
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-purple-50 rounded-xl font-medium flex items-center gap-2"
                >
                  <ListOrdered className="w-3.5 h-3.5" /> Liste numérotée
                </button>
                <button
                  type="button"
                  onClick={() => {
                    insertHtmlAtCursor('<hr className="my-6 border-t border-[#e5dbf7]" />');
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-purple-50 rounded-xl font-medium flex items-center gap-2"
                >
                  <span className="font-bold">―</span> Ligne horizontale
                </button>
              </div>
            )}
          </div>

        </div>

        {/* 13. HTML CODE VIEW TOGGLE BUTTON (</>) */}
        <button
          type="button"
          onClick={() => {
            setShowHtmlCode(!showHtmlCode);
            setActiveDropdown(null);
          }}
          className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
            showHtmlCode 
              ? 'bg-[#4C2882] text-white border-[#4C2882] shadow-xs' 
              : 'bg-white hover:bg-purple-50 text-slate-700 border-[#e5dbf7]'
          }`}
          title="Afficher le code HTML (Code Source)"
        >
          <Code className="w-3.5 h-3.5" />
          <span>{showHtmlCode ? 'Visuel' : '</> HTML'}</span>
        </button>

      </div>

      {/* EDITOR AREA */}
      <div className="relative min-h-[360px]">
        {showHtmlCode ? (
          /* RAW HTML CODE EDITOR MODE */
          <div className="p-4 bg-[#1e1e2e] text-slate-100 font-mono text-xs leading-relaxed min-h-[360px] rounded-b-3xl">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-700/60 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5 font-bold text-purple-300">
                <Code className="w-3.5 h-3.5 text-purple-400" /> Mode Code Source HTML
              </span>
              <span>Modifications HTML directes autorisées</span>
            </div>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="<h2>Mon Titre</h2><p>Mon paragraphe...</p><table>...</table>"
              className="w-full min-h-[300px] p-2 bg-transparent text-slate-100 font-mono text-xs focus:outline-hidden resize-y leading-relaxed"
              spellCheck={false}
            />
          </div>
        ) : (
          /* VISUAL WYSIWYG MODE */
          <div
            ref={editorRef}
            contentEditable
            onInput={handleVisualInput}
            onBlur={handleVisualInput}
            className="p-5 min-h-[360px] focus:outline-hidden text-sm text-[#3D2E39] font-sans leading-relaxed prose prose-purple shopify-editor-content max-w-none overflow-y-auto"
            style={{ minHeight: '360px' }}
          />
        )}
      </div>

      {/* MODAL LINK */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full border border-[#e5dbf7] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-[#e5dbf7]">
              <h3 className="font-bold text-[#3D2E39] text-base flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-purple-600" /> Insérer un lien web
              </h3>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleInsertLink} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">URL de destination *</label>
                <input
                  type="url"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://exemple.com/mon-produit"
                  className="w-full px-3 py-2 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Texte à afficher</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Ex: Découvrir notre boutique"
                  className="w-full px-3 py-2 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="linkNewTabCheck"
                  checked={linkNewTab}
                  onChange={(e) => setLinkNewTab(e.target.checked)}
                  className="rounded-md border-[#e5dbf7] text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="linkNewTabCheck" className="font-medium text-slate-700">Ouvrir dans un nouvel onglet</label>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5dbf7]">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#4C2882] text-white font-bold hover:bg-[#3D206A]"
                >
                  Insérer le lien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IMAGE */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full border border-[#e5dbf7] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-[#e5dbf7]">
              <h3 className="font-bold text-[#3D2E39] text-base flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-600" /> Insérer une image
              </h3>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleInsertImage} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">URL de l'image *</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://site.com/image.jpg"
                  className="w-full px-3 py-2 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Légende / Texte alternatif (Alt)</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Ex: Planche de stickers holographiques"
                  className="w-full px-3 py-2 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5dbf7]">
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#4C2882] text-white font-bold hover:bg-[#3D206A]"
                >
                  Insérer l'image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VIDEO */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full border border-[#e5dbf7] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-[#e5dbf7]">
              <h3 className="font-bold text-[#3D2E39] text-base flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-600" /> Insérer une vidéo
              </h3>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleInsertVideo} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">URL de la vidéo YouTube ou d'intégration *</label>
                <input
                  type="url"
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5dbf7]">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#4C2882] text-white font-bold hover:bg-[#3D206A]"
                >
                  Insérer la vidéo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
