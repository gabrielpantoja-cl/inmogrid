'use client';

import dynamic from 'next/dynamic';

const SofiaChatInterface = dynamic(
  () => import('@/features/sofia/components/SofiaChatInterface'),
  { ssr: false }
);

export default function SofiaClientWrapper() {
  return <SofiaChatInterface />;
}
