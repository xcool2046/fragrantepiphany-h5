# Perfume API Design 香水推荐 API 设计

## Overview
获取用户的香水推荐数据（基于抽取的三张塔罗牌）。

## Endpoints

### GET `/api/perfume/chapters`

获取用户的三个香水推荐章节

**Request Parameters:**
```
cardIds: string (comma-separated card indices, e.g. "0,24,56")
```

**Response:**
```json
{
  "chapters": [
    {
      "id": 1,
      "order": 1,
      "cardName": "The Lovers",
      "sceneChoice": "A. Rose Garden",
      "brandName": "Jo Malone",
      "productName": "Red Roses Cologne",
      "tags": ["Fresh", "Floral", "Light"],
      "notes": {
        "top": "Fresh red rose, olive leaf, pink pepper",
        "heart": "Rose petals, peony, magnolia",
        "base": "White musk, amber, cedarwood"
      },
      "description": "Lovers drawn to this are experiencing...",
      "quote": "The fragrance of true beginnings",
      "imageUrl": "https://example.com/image.jpg"
    },
    ...
  ]
}
```

## Data Source

### Excel Schema
The data comes from `/perfume.xlsx` with the following structure:

| Column | Field | Example |
|--------|-------|---------|
| A | 塔罗牌 (Card Name) | 患者, 虐待师, 女祭司 |
| B | 气息选择 (Scene Choice) | A. 玫瑰园 / B. 暖木 / C. 咖啡馆 / D. 白皂 |
| C | 推荐香水 (Product Name) | Jo Malone Red Roses Cologne |
| D | 香调特点 (Notes) | 新鲜红玫瑰、榄榄、薄荷 |
| E | 感情方向推荐理由 (Description) | 患者的纯真开启新感受... |

**Additional fields needed:**
- Brand Name (品牌名) - Extract or add to Excel
- Tags (标签 1, 2, 3) - e.g. Fresh, Floral, Light
- Quote (一句励志话) - Short inspirational message
- Image URL (图片URL) - Reference to perfume image
- Top/Heart/Base Notes (前中后调) - Parse from column D

### Implementation Steps

1. **Create Perfume Table** (PostgreSQL/MySQL)
```sql
CREATE TABLE perfumes (
  id SERIAL PRIMARY KEY,
  card_name VARCHAR(255),
  scene_choice VARCHAR(50),
  brand_name VARCHAR(255),
  product_name VARCHAR(255),
  tag_1 VARCHAR(100),
  tag_2 VARCHAR(100),
  tag_3 VARCHAR(100),
  top_notes TEXT,
  heart_notes TEXT,
  base_notes TEXT,
  description TEXT,
  quote TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

2. **Seed Data from Excel**
   - Import Excel data into the perfumes table
   - Map each row to a perfume record
   - Ensure all fields are populated correctly

3. **Implement API Endpoint**
   - Accept `cardIds` parameter
   - Query perfumes table for matching cards
   - Return in specified JSON format
   - Cache results if needed

## Example Query

```python
# For cards [0, 24, 56], find matching perfumes from Excel/DB
# Return 3 recommended perfumes in order
```

## Translation Support

The API should support both English and Chinese:
- English: Default response format
- Chinese: Translate all text fields (productName, description, quote, etc.)

Optional: Add `language` parameter
```
GET /api/perfume/chapters?cardIds=0,24,56&language=en
```

## Frontend Integration

The frontend expects:
- chapters array with exactly 3 items
- All fields populated with non-null values
- Image URLs pointing to valid images
- UTF-8 encoding for Chinese text

## Testing

Use mock data for development:
- Frontend: `/frontend/src/data/perfumeData.ts`
- Once API is ready, remove fallback to mock data in `/frontend/src/api.ts`

## Status

🚀 Frontend UI: **READY** (using mock data)
⏳ Backend API: **PENDING**
- Need to import Excel data
- Need to create API endpoint
- Need to add translation support
