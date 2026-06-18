'use client';

import { useEffect } from 'react';

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    // Fire and forget view tracking
    fetch(`http://localhost:4000/api/startups/${slug}/view`, { method: 'POST' })
      .catch(console.error);
  }, [slug]);

  return null; // This component does not render anything
}
