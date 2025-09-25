'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import './route-loader.css';

export default function RouteLoader() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Store originals
    const originalPush = router.push;
    const originalReplace = router.replace;

    // Patch push
    router.push = async (
      href: Parameters<typeof originalPush>[0],
      options?: Parameters<typeof originalPush>[1]
    ) => {
      setLoading(true);
      try {
        await originalPush(href, options);
      } finally {
        setLoading(false);
      }
    };

    // Patch replace
    router.replace = async (
      href: Parameters<typeof originalReplace>[0],
      options?: Parameters<typeof originalReplace>[1]
    ) => {
      setLoading(true);
      try {
        await originalReplace(href, options);
      } finally {
        setLoading(false);
      }
    };

    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [router]);

  if (!loading) return null;

  return (
    <div className="route-div">
      <div className="route-div-inner" />
    </div>
  );
}
