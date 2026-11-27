import React, { createContext, useContext, useState, useEffect } from 'react';

const RouterContext = createContext(null);

export function HashRouter({ children }) {
  const getPath = () => window.location.hash.replace(/^#/, '') || '/';
  const [currentPath, setCurrentPath] = useState(getPath());

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(getPath());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (to) => {
    window.location.hash = to;
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a HashRouter');
  }
  return context;
}

export function Link({ to, children, className = '', onClick }) {
  const { navigate } = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) onClick(e);
    navigate(to);
  };

  return (
    <a href={`#${to}`} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
