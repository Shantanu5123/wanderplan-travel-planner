import React, { createContext, useContext, useState, useEffect } from 'react';

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rateToUSD: 1.0 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToUSD: 86.5 },
  { code: 'EUR', symbol: '€', name: 'Euro', rateToUSD: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateToUSD: 0.79 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToUSD: 155.0 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToUSD: 1.55 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateToUSD: 1.40 },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateToUSD: 3.67 },
];

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem('wanderplan_currency') || 'USD';
  });

  const currencyObj = SUPPORTED_CURRENCIES.find((c) => c.code === selectedCurrency) || SUPPORTED_CURRENCIES[0];

  const changeCurrency = (code) => {
    setSelectedCurrency(code);
    localStorage.setItem('wanderplan_currency', code);
  };

  /**
   * Automatically converts any string or number containing a dollar value (e.g. "$15", "$650 - $850")
   * into the currently selected currency (e.g. "₹1,300", "₹56,225 - ₹73,525" or "€14").
   */
  const formatCost = (rawCost) => {
    if (!rawCost) return '';
    if (typeof rawCost !== 'string') rawCost = String(rawCost);

    // If it's free or has no numbers, return as-is
    if (rawCost.toLowerCase().includes('free') && !rawCost.match(/\d/)) {
      return rawCost;
    }

    if (currencyObj.code === 'USD') {
      return rawCost;
    }

    // Replace all dollar numbers (e.g. "$15", "$650 - $850", "15 USD") with converted currency
    return rawCost.replace(/\$?\s*(\d+[\d,]*(\.\d+)?)/g, (match, numberStr) => {
      const num = parseFloat(numberStr.replace(/,/g, ''));
      if (isNaN(num)) return match;
      const converted = Math.round(num * currencyObj.rateToUSD);
      // Format with locale commas
      return `${currencyObj.symbol}${converted.toLocaleString()}`;
    });
  };

  const value = {
    selectedCurrency,
    currencyObj,
    currencies: SUPPORTED_CURRENCIES,
    changeCurrency,
    formatCost,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
