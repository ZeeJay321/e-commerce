'use client';

import { useEffect, useState } from 'react';

import LoadingSpinner from '@/components/loading/loading-spinner';

const Page = () => {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    setIsRendered(true);
  }, []);

  if (!isRendered) {
    return <LoadingSpinner />;
  }

  return (
    'hello'
  );
};

export default Page;
