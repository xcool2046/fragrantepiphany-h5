# Database Schema

## Overview
This document outlines the core database tables used in the application.

## Tables

### `perfumes`
Stores perfume recommendations mapped to Tarot cards and Scene choices. Supports English and Chinese localization.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Primary Key |
| `card_id` | INT | Foreign Key to Cards (implied) |
| `card_name` | VARCHAR | Card Name (Chinese) |
| `scene_choice` | VARCHAR | Scene Choice (Chinese) |
| `scene_choice_en` | VARCHAR | Scene Choice (English) |
| `brand_name` | VARCHAR | Brand Name (Chinese) |
| `brand_name_en` | VARCHAR | Brand Name (English) |
| `product_name` | VARCHAR | Product Name (Chinese) |
| `product_name_en` | VARCHAR | Product Name (English) |
| `tags` | JSONB | Tags array (e.g. ["Fresh", "Floral"]) |
| `description` | TEXT | Description (Chinese) |
| `description_en` | TEXT | Description (English) |
| `quote` | TEXT | Quote (Chinese) |
| `quote_en` | TEXT | Quote (English) |
| `image_url` | TEXT | Path to image asset |
| `notes_top` | TEXT | Top Notes (Chinese) |
| `notes_top_en` | TEXT | Top Notes (English) |
| `notes_heart` | TEXT | Heart Notes (Chinese) |
| `notes_heart_en` | TEXT | Heart Notes (English) |
| `notes_base` | TEXT | Base Notes (Chinese) |
| `notes_base_en` | TEXT | Base Notes (English) |
| `sort_order` | INT | Display order |
| `status` | VARCHAR | Status (default: 'active') |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update time |

### `questions`
Stores questionnaire definitions (questions and options). User answers are NOT stored permanently.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Primary Key |
| `text` | TEXT | Question text |
| `options` | JSONB | Options array |
| `...` | ... | ... |

### `users`
Stores Admin users only. No C-end user accounts.

### `rules`
Maps Tarot cards to interpretation rules.

### `orders`
Stores Stripe payment orders.
