# Data Mapping & Image Order

> [!IMPORTANT]
> The Tarot card images in this project do **NOT** follow the standard Tarot ordering (Majors -> Wands -> Cups -> Swords -> Pentacles).
> They follow a custom order based on the actual filenames in `frontend/src/assets/cards`.

## Global Image Order
The system maps Card IDs (0-77) to Images based on the following sequence:

1.  **Majors (0-21)**: 
    *   **Special Note**: Image `01.jpg` is **The Magician** (Code 01). Image `02.jpg` is **The Fool** (Code 02).
    *   *Standard usually has Fool as 0, but here they are swapped/shifted.*
2.  **Swords (22-35)**:
    *   Images `22.jpg` - `35.jpg` correspond to the **Swords** suit (Ace -> King).
    *   *Standard usually places Wands here.*
3.  **Pentacles (36-49)**:
    *   Images `36.jpg` - `49.jpg` correspond to the **Pentacles** suit (Ace -> King).
    *   *Standard usually places Cups here.*
4.  **Wands (50-63)**:
    *   Images `50.jpg` - `63.jpg` correspond to the **Wands** suit (Ace -> King).
    *   *Standard usually places Swords here.*
5.  **Cups (64-77)**:
    *   Images `64.jpg` - `77.jpg` correspond to the **Cups** suit (Ace -> King).
    *   *Standard usually places Pentacles here.*

## Database Mapping
The `cards` table and `tarot_interpretations` table have been patched (via `fix_tarot_data_v2.ts`) to align with this **Image Order**.
-   Code `22` -> Name "Ace of Swords" -> Text from Excel "Ace of Swords".
-   Code `50` -> Name "Ace of Wands" -> Text from Excel "Ace of Wands".

**DO NOT** revert the card mapping to "Standard Order" without renaming the image files, otherwise images and text will mismatch.
