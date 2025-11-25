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
    // Position logic:
    // Wheel (Landscape): Top-Right -> x=125, y=18
    // Slot (Rotated 90deg): Top-Left (local) -> Top-Right (global) -> x=15, y=18
    const textPos = variant === 'wheel' ? { x: 125, y: 18 } : { x: 15, y: 18 }

    // Get real image path
    // ID is 0-77 (from array index), but files are 01.jpg - 78.jpg
    // So file index = id + 1
    const fileIndex = String(id + 1).padStart(2, '0')
    const imagePath = cardImages[`../assets/cards/${fileIndex}.jpg`]

    return (
        <div className={clsx(
            "w-full h-full rounded-lg overflow-hidden relative shadow-2xl transition-all",
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
                                <linearGradient id="decoGold" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8B5A2B" />
                                    <stop offset="40%" stopColor="#F5D0A9" />
                                    <stop offset="60%" stopColor="#8B5A2B" />
                                    <stop offset="100%" stopColor="#F5D0A9" />
                                </linearGradient>
                            </defs>
                            
                            <g
                                stroke="url(#decoGold)"
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
                                <circle cx="70" cy="45" r="4" fill="url(#decoGold)" stroke="none" />
                                <line x1="5" y1="5" x2="30" y2="30" opacity="0.3" />
                                <line x1="5" y1="85" x2="30" y2="60" opacity="0.3" />
                                <line x1="135" y1="5" x2="110" y2="30" opacity="0.3" />
                                <line x1="135" y1="85" x2="110" y2="60" opacity="0.3" />
                            </g>
        
                            {/* Number Display */}
                            <g transform={vertical ? `translate(${textPos.y}, ${140 - textPos.x}) rotate(90)` : `translate(${textPos.x}, ${textPos.y})`}>
                                 {/* Corner Accent - Subtle */}
                                 <path d="M -8 -8 L 8 -8 L 8 8" fill="none" stroke="url(#decoGold)" strokeWidth="0.5" opacity="0.6" transform={variant === 'wheel' ? "" : "rotate(-90)"} />

                                 <text
                                    x="0"
                                    y="5"
                                    textAnchor="middle"
                                    fill="#F5D0A9"
                                    fontSize="8"
                                    fontFamily="serif"
                                    fontWeight="400"
                                    letterSpacing="0.5"
                                    opacity="0.85"
                                    style={{
                                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
                                    }}
                                >
                                    NO.{String(id + 1).padStart(2, '0')}
                                </text>
                            </g>
                        </svg>
                    </div>
                </>
            )}

            {/* 3. Subtle Ambient Glow (Overlay on top of image too for atmosphere) */}
            <div className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay opacity-30 bg-[radial-gradient(circle_at_50%_0%,rgba(245,208,169,0.4)_0%,transparent_60%)]" />
        </div>
    )
})
