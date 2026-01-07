'use client';

interface SprintCounterProps {
    current: number;
    total: number;
    progress: number;
}

export function SprintCounter({ current, total }: SprintCounterProps) {
    return (
        <div
            className="fixed top-0 left-0 right-0 z-50 flex justify-center py-3 bg-zinc-950/90 backdrop-blur-sm"
            style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
        >
            <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold text-lg">{current}</span>
                <span className="text-zinc-600">/</span>
                <span className="text-zinc-400 text-lg">{total}</span>

                {/* Progress dots */}
                <div className="flex gap-1 ml-2">
                    {Array.from({ length: Math.min(total, 5) }).map((_, i) => {
                        const segmentSize = total / 5;
                        const filled = current >= (i + 1) * segmentSize;
                        return (
                            <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full transition-colors ${filled ? 'bg-emerald-400' : 'bg-zinc-700'
                                    }`}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
