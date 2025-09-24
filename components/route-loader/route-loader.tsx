'use client';

import { useEffect, useState } from 'react';

import { usePathname } from 'next/navigation';

import './route-loader.css';

export default function RouteLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="route-div">
      <div className="route-div-inner" />
    </div>
  );
}
