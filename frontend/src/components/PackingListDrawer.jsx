import React, { useState, useEffect } from 'react';
import { 
  Luggage, 
  Check, 
  Shirt, 
  Briefcase, 
  Laptop, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  RotateCcw
} from 'lucide-react';

const DEFAULT_PACKING_LIST = {
  clothing: [
    'Comfortable walking sneakers / trail shoes',
    'Breathable moisture-wicking layers',
    'Lightweight rain jacket / compact windbreaker',
    'Evening casual dinner attire',
    'Extra pair of socks and undergarments',
  ],
  essentials: [
    'Travel-sized toiletries & sun protection (SPF 50+)',
    'Prescription medications & small first-aid kit',
    'Refillable insulated water bottle',
    'Microfiber travel towel & sunglasses',
    'Lip balm & hand sanitizer',
  ],
  tech: [
    'Universal plug travel adapter',
    'High-capacity portable power bank (10,000+ mAh)',
    'Smartphone charging cables & e-reader',
    'Noise-canceling earphones / headphones',
  ],
  documents: [
    'Valid Passport / Government Photo ID',
    'Offline mobile boarding passes & hotel confirmations',
    'Travel insurance policy document',
    'Primary and backup international credit/debit cards',
  ],
};

export default function PackingListDrawer({ packingList, tripId, destination }) {
  const [isOpen, setIsOpen] = useState(false);
  const storageKey = `wanderplan_packing_${tripId || destination || 'default'}`;

  // Merge provided AI packing list with defaults if any category is empty
  const list = {
    clothing: packingList?.clothing?.length ? packingList.clothing : DEFAULT_PACKING_LIST.clothing,
    essentials: packingList?.essentials?.length ? packingList.essentials : DEFAULT_PACKING_LIST.essentials,
    tech: packingList?.tech?.length ? packingList.tech : DEFAULT_PACKING_LIST.tech,
    documents: packingList?.documents?.length ? packingList.documents : DEFAULT_PACKING_LIST.documents,
  };

  const [checkedItems, setCheckedItems] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(checkedItems));
    } catch (e) {}
  }, [checkedItems, storageKey]);

  const toggleItem = (category, item) => {
    const key = `${category}:${item}`;
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const resetAll = () => {
    setCheckedItems({});
  };

  // Compute completed count
  const allItems = [
    ...list.clothing.map((i) => `clothing:${i}`),
    ...list.essentials.map((i) => `essentials:${i}`),
    ...list.tech.map((i) => `tech:${i}`),
    ...list.documents.map((i) => `documents:${i}`),
  ];
  const completedCount = allItems.filter((k) => checkedItems[k]).length;
  const progressPercent = allItems.length ? Math.round((completedCount / allItems.length) * 100) : 0;

  const categories = [
    { id: 'clothing', label: 'Clothing & Apparel', icon: <Shirt size={16} color="#38bdf8" />, items: list.clothing },
    { id: 'essentials', label: 'Toiletries & Essentials', icon: <Briefcase size={16} color="#34d399" />, items: list.essentials },
    { id: 'tech', label: 'Tech & Electronics', icon: <Laptop size={16} color="#f59e0b" />, items: list.tech },
    { id: 'documents', label: 'Passports & Documents', icon: <FileText size={16} color="#a78bfa" />, items: list.documents },
  ];

  return (
    <div className="packing-drawer-card">
      <div 
        className="packing-drawer-header"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="packing-icon-pill">
            <Luggage size={18} color="#38bdf8" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Smart AI Packing Checklist
              </h3>
              <span className="ai-tag-pill">
                <Sparkles size={11} /> Tailored to {destination}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
              {completedCount} of {allItems.length} items packed ({progressPercent}%)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Progress Mini Bar */}
          <div className="packing-mini-progress">
            <div className="packing-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>

          <button className="packing-toggle-btn" aria-label="Toggle Packing Drawer">
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="packing-drawer-body">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
            <button 
              onClick={resetAll} 
              className="btn-text-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              <RotateCcw size={12} /> Reset Checkboxes
            </button>
          </div>

          <div className="packing-categories-grid">
            {categories.map((cat) => (
              <div key={cat.id} className="packing-category-block">
                <div className="category-title">
                  {cat.icon}
                  <span>{cat.label}</span>
                </div>

                <div className="packing-items-list">
                  {cat.items.map((item, idx) => {
                    const key = `${cat.id}:${item}`;
                    const isChecked = Boolean(checkedItems[key]);
                    return (
                      <label 
                        key={idx} 
                        className={`packing-item-row ${isChecked ? 'item-checked' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleItem(cat.id, item);
                        }}
                      >
                        <div className={`custom-checkbox ${isChecked ? 'checked' : ''}`}>
                          {isChecked && <Check size={12} strokeWidth={3.5} color="#030712" />}
                        </div>
                        <span className="item-text">{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
