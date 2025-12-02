# Draw Page Overhaul (Performance & Immersion)

## 1. Design Philosophy: "The Digital Stage"
The Draw page has been redesigned to prioritize **high-performance immersion** over heavy graphical effects. The core concept is **"Stage Spotlight"**:
-   **Focus**: The user's attention is guided by light. Only the central card is fully illuminated; peripheral cards fade into darkness.
-   **Physicality**: Every interaction (scroll, click, land) provides instant, physical-like feedback (Haptics + Visual Flash).
-   **Atmosphere**: A departure from the app's general "Light Beige" theme into a "Mystical Dark" mode (`#1a1614` background) to enhance the tarot reading atmosphere.

## 2. Visual Specifications

### Color Palette (Dark Mode)
-   **Background**: Radial Gradient from Deep Purple-Brown (`#3E2D36` center) to Deep Black-Brown (`#0F0B0A` edge).
-   **Texture**: SVG Noise Overlay (Opacity 0.35) to simulate film grain/paper texture, preventing "digital flatness".
-   **Accents**:
    -   **Gold**: `#FFD700` (Flying Card Border, Slot Ripple Flash).
    -   **Warm White**: `rgba(255, 255, 255, 0.4)` (Click Flash).

### The "Spotlight" Technique
Instead of expensive real-time lighting calculations (which kill mobile FPS), we use a **Static Global Overlay**:
-   A `pointer-events-none` div sits at `z-index: 50`.
-   It has a radial gradient that is **Transparent in the center** and **Opaque Dark** at the edges.
-   **Cards** move underneath this overlay.
    -   **Center Card**: `z-index: 60` (Pops *above* the dark overlay -> Bright).
    -   **Side Cards**: `z-index: <50` (Stay *below* the dark overlay -> Dimmed).
-   **Result**: 60FPS performance with cinema-grade lighting depth.

## 3. Interactions

### Wheel (Right Panel)
-   **Scroll**: Heavy physics (high mass/damping) for a "solid" feel.
-   **Haptics**: `navigator.vibrate(5)` triggered on every card index change.
-   **Click**:
    -   **Flash**: Instant white overlay flash on the card.
    -   **Scale**: Card shrinks to `0.95`.

### Flight
-   **Path**: Direct interpolation from Wheel position to Slot position.
-   **Visuals**: Card rotates to 0deg, gains a glowing Gold Border, and floats at `z-index: 9999` (Absolute Top).
-   **Duration**: 0.5s (Snappy).

### Slots (Left Panel)
-   **Empty**: Breathing opacity animation (`0.4` <-> `0.8`).
-   **Landing**:
    -   **Ripple**: A gold ripple expands from the slot.
    -   **Flash**: The slot background flashes gold (`#FFD700`) upon impact.

## 4. Technical Implementation Details

### Z-Index Stacking Context (The "Sandwich")
1.  **Base Background**: `z-0`
2.  **Scene Container**: Auto (contains WheelCards)
    -   **Side Cards**: `z-40` (Dimmed)
    -   **Spotlight Overlay**: `z-50` (The Mask)
    -   **Center Card**: `z-60` (Bright/Interactive)
3.  **Flying Card**: `z-9999` + Moved to end of DOM (Guarantees visibility).

### Performance Optimizations
-   **No Blurs**: Removed all CSS `blur` and `backdrop-blur` filters during animation.
-   **No Shadows**: Removed expensive `box-shadow` from moving elements (baked into textures or static containers).
-   **Zero Layout Thrashing**: All animations use `transform` (GPU).

## 5. Future Improvements
-   **Sound**: Add subtle "click" and "whoosh" sound effects to match the haptics.
-   **Particles**: Add very lightweight canvas particles (dust motes) in the spotlight beam if device power permits.
