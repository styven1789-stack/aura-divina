import { AuraMonogram } from '@/components/brand/Logo';

export default function Loading() {
  return (
    <div className="min-h-[60vh] hero-aura flex flex-col items-center justify-center gap-6">
      <div className="animate-pulse">
        <AuraMonogram size={80} />
      </div>
      <p className="font-serif text-xl text-ink-800">Preparando tu selección…</p>
      <div className="w-32 gold-divider" />
    </div>
  );
}
