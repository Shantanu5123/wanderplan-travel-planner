import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { Coins, ChevronDown } from 'lucide-react';

export default function CurrencySelector() {
  const { selectedCurrency, currencyObj, currencies, changeCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="currency-selector-wrapper" ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        className="glass-pill-btn"
        title="Change Display Currency"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          padding: '0.45rem 0.85rem',
          borderRadius: '10px',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#f8fafc',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        }}
      >
        <span style={{ color: '#60a5fa', fontWeight: 800 }}>{currencyObj.symbol}</span>
        <span>{currencyObj.code}</span>
        <ChevronDown size={14} color="#94a3b8" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>

      {open && (
        <div
          className="glass-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '185px',
            background: 'rgba(15, 23, 42, 0.96)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '14px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            padding: '0.45rem',
            zIndex: 10050,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.2rem',
            animation: 'dropdownFade 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', padding: '0.4rem 0.65rem', letterSpacing: '0.04em' }}>
            Select Currency
          </div>
          {currencies.map((curr) => {
            const isSelected = selectedCurrency === curr.code;
            return (
              <button
                key={curr.code}
                onClick={() => {
                  changeCurrency(curr.code);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  color: isSelected ? '#60a5fa' : '#cbd5e1',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#cbd5e1';
                  }
                }}
              >
                <span>{curr.name}</span>
                <span style={{ fontWeight: 800, color: isSelected ? '#60a5fa' : '#94a3b8' }}>
                  {curr.symbol}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
