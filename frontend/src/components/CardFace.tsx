import { memo } from 'react'
import clsx from 'clsx'

// Load all card images eagerly
const cardImages = import.meta.glob('../assets/cards/*.jpg', { eager: true, as: 'url' })

interface CardFaceProps {
    id: number;
    variant?: 'wheel' | 'slot';
    side?: 'front' | 'back';
    vertical?: boolean;
}

export const CardFace = memo(({ id, variant = 'wheel', side = 'back', vertical = false }: CardFaceProps) => {
    // Get real image path
    // ID is 0-77 (from array index), but files are 01.jpg - 78.jpg
    // So file index = id + 1
    const fileIndex = String(id + 1).padStart(2, '0')
    // Vite's import.meta.glob returns keys relative to the current file
    // Ensure the key matches exactly what's on disk
    const imageKey = `../assets/cards/${fileIndex}.jpg`
    const imagePath = cardImages[imageKey]
    
    // Use 'NO.' prefix as requested
    const numberLabel = `NO.${fileIndex}`
    const isWheel = variant === 'wheel'
    // Show badge on back side OR if explicitly requested (though usually back side has the number)
    // The user request implies number is on the back.
    const showBadge = side === 'back'

    return (
        <div className={clsx(
            "w-full h-full rounded-lg overflow-hidden relative transition-all",
            "bg-[#14100F]",
            // Only apply radial gradient background if showing back or if image missing
            (side === 'back' || !imagePath) && "bg-[radial-gradient(circle_at_center,#2E241D_0%,#0F0B0A_100%)]",
            "border border-[#8B5A2B]/40" 
        )}>
            {side === 'front' && imagePath ? (
                <img 
                    src={imagePath} 
                    alt={`Card ${id}`} 
                    className="w-full h-full object-cover"
                />
            ) : (
                // Back Side (SVG Design) - Default
                <>
                    {/* 1. Starfield Texture */}
                    <div className="absolute inset-0 opacity-30" 
                         style={{
                             backgroundImage: `radial-gradient(#D4A373 0.8px, transparent 0.8px)`,
                             backgroundSize: '16px 16px'
                         }}>
                    </div>
        
                    {/* 2. Art Deco Structure */}
                    <div className="absolute inset-0 p-1 z-10">
                        {/* Removed drop-shadow from SVG for performance */}
                        {/* If vertical, we change viewBox and rotate content to fill the slot */}
                        <svg 
                            viewBox={vertical ? "0 0 90 140" : "0 0 140 90"} 
                            className="w-full h-full" 
                            preserveAspectRatio={vertical ? "none" : "xMidYMid meet"}
                        >
                            <defs>
                                <linearGradient id={`decoGold-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8B5A2B" />
                                    <stop offset="40%" stopColor="#F5D0A9" />
                                    <stop offset="60%" stopColor="#8B5A2B" />
                                    <stop offset="100%" stopColor="#F5D0A9" />
                                </linearGradient>
                            </defs>
                            
                            <g
                                stroke={`url(#decoGold-${id})`}
                                strokeWidth="1.5"
                                fill="none"
                                strokeLinecap="square"
                                transform={vertical ? "translate(90, 0) rotate(90)" : ""}
                            >
                                <rect x="2" y="2" width="136" height="86" rx="4" />
                                <rect x="5" y="5" width="130" height="80" rx="2" opacity="0.6" />
                                <path d="M 5 25 Q 25 45 5 65" opacity="0.8" />
                                <path d="M 135 25 Q 115 45 135 65" opacity="0.8" />
                                <path d="M 70 10 L 110 45 L 70 80 L 30 45 Z" />
                                <circle cx="50" cy="45" r="18" opacity="0.5" />
                                <circle cx="90" cy="45" r="18" opacity="0.5" />
                                <circle cx="70" cy="45" r="4" fill={`url(#decoGold-${id})`} stroke="none" />
                                <line x1="5" y1="5" x2="30" y2="30" opacity="0.3" />
                                <line x1="5" y1="85" x2="30" y2="60" opacity="0.3" />
                                <line x1="135" y1="5" x2="110" y2="30" opacity="0.3" />
                                <line x1="135" y1="85" x2="110" y2="60" opacity="0.3" />
                            </g>
                        </svg>
                    </div>
                </>
            )}

            {showBadge && (
                <div
                    className={clsx(
                        "absolute z-30 pointer-events-none select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]",
                        // Positioning: 
                        // For vertical cards (slots), top-right is top-right.
                        // For horizontal cards (wheel), top-right is top-right.
                        // But if the SVG content is rotated, does "top-right" change?
                        // The container is the div. The SVG is just decoration.
                        // So absolute positioning is relative to the div.
                        // If vertical=true (slot), the div is vertical (w < h). Top-right is correct.
                        // If vertical=false (wheel), the div is horizontal (w > h). Top-right is correct.
                        // However, previous code had rotation logic: `transform: isVerticalLayout ? 'rotate(90deg)' : 'none'`
                        // If the card is physically vertical but the design is horizontal rotated 90deg, then top-right of the design might be bottom-right of the div?
                        // Let's assume standard positioning first.
                        "top-2 right-2"
                    )}
                >
                    <div
                        className={clsx(
                            "relative rounded-full border border-[#F5D0A9]/70 bg-[#0F0B0A]/80 shadow-[0_8px_20px_rgba(0,0,0,0.45)] backdrop-blur-[2px]",
                            "px-2 py-[2px]"
                        )}
                    >
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/15 via-transparent to-transparent opacity-80" />
                        <span
                            className={clsx(
                                "relative block text-center text-[#F7E6CE] uppercase leading-none font-semibold font-sans",
                                // Adjust font size for NO.XX
                                isWheel ? "text-[8px] tracking-[0.1em]" : "text-[9px] tracking-[0.1em]"
                            )}
                            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }}
                        >
                            {numberLabel}
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
})
