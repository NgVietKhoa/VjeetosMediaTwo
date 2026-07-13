# Tài liệu API Ophim

Tài liệu tham khảo đầy đủ cho API phim Ophim — dùng để tra cứu phim, tìm kiếm, lọc theo thể loại/quốc gia/năm, và lấy dữ liệu chi tiết (diễn viên, hình ảnh, từ khóa) từ TMDB.

## Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Base URL | `https://ophim1.com` |
| Định dạng dữ liệu | JSON |
| Mã hóa | UTF-8 |
| Phương thức HTTP | GET |
| Xác thực | Không yêu cầu |

Tất cả request nên gửi header:

```
accept: application/json
```

### Cấu trúc response chung

Phần lớn endpoint trả về theo dạng:

```json
{
  "status": "success",
  "message": "Lấy dữ liệu thành công",
  "data": { ... }
}
```

Một số endpoint chi tiết (images, peoples, keywords) dùng `success: true/false` thay vì `status`. Khi có lỗi (ví dụ không tìm thấy phim), response trả về:

```json
{
  "status": "error",
  "message": "Không tìm thấy phim"
}
```

### Phân trang

Các endpoint danh sách trả kèm object `params.pagination`:

```json
"pagination": {
  "currentPage": 1,
  "totalItems": 100,
  "totalItemsPerPage": 24,
  "totalPages": 5
}
```

---

## Mục lục

1. [Danh sách phim trang chủ](#1-danh-sách-phim-trang-chủ)
2. [Danh sách phim theo bộ lọc](#2-danh-sách-phim-theo-bộ-lọc)
3. [Tìm kiếm phim](#3-tìm-kiếm-phim)
4. [Danh sách thể loại](#4-danh-sách-thể-loại)
5. [Danh sách phim theo thể loại](#5-danh-sách-phim-theo-thể-loại)
6. [Danh sách quốc gia](#6-danh-sách-quốc-gia)
7. [Danh sách phim theo quốc gia](#7-danh-sách-phim-theo-quốc-gia)
8. [Danh sách năm phát hành](#8-danh-sách-năm-phát-hành)
9. [Danh sách phim theo năm phát hành](#9-danh-sách-phim-theo-năm-phát-hành)
10. [Chi tiết phim](#10-chi-tiết-phim)
11. [Hình ảnh phim (TMDB)](#11-hình-ảnh-phim-tmdb)
12. [Thông tin diễn viên (TMDB)](#12-thông-tin-diễn-viên-tmdb)
13. [Từ khóa phim (TMDB)](#13-từ-khóa-phim-tmdb)
14. [Mã lỗi & xử lý ngoại lệ](#14-mã-lỗi--xử-lý-ngoại-lệ)
15. [Ghi chú thực thi](#15-ghi-chú-thực-thi)
16. [Định dạng xuất nguồn phim (Embed / M3U8)](#16-định-dạng-xuất-nguồn-phim-embed--m3u8)

---

## 1. Danh sách phim trang chủ

Lấy danh sách phim nổi bật/mới cập nhật hiển thị ở trang chủ.

```
GET /v1/api/home
```

### Ví dụ request

```javascript
const options = { method: 'GET', headers: { accept: 'application/json' } };

fetch('https://ophim1.com/v1/api/home', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```bash
curl -s "https://ophim1.com/v1/api/home" -H "accept: application/json"
```

### Response mẫu

```json
{
  "status": "success",
  "message": "Lấy dữ liệu thành công",
  "data": {
    "seoOnPage": {
      "titleHead": "Xem phim online miễn phí",
      "descriptionHead": "Xem phim online chất lượng cao miễn phí"
    },
    "items": [
      {
        "_id": "66f8e123456789abcdef",
        "name": "Tên phim",
        "slug": "ten-phim",
        "origin_name": "Original Name",
        "alternative_names": ["Tên khác 1", "Tên khác 2"],
        "type": "series",
        "thumb_url": "https://example.com/thumb.jpg",
        "poster_url": "https://example.com/poster.jpg",
        "year": 2024,
        "category": [
          { "id": "action", "name": "Hành động", "slug": "hanh-dong" }
        ],
        "country": [
          { "id": "us", "name": "Mỹ", "slug": "my" }
        ]
      }
    ],
    "params": {
      "pagination": {
        "currentPage": 1,
        "totalItems": 100,
        "totalItemsPerPage": 24
      }
    },
    "APP_DOMAIN_CDN_IMAGE": "https://img.ophim.cc/uploads/movies/",
    "APP_DOMAIN_FRONTEND": "https://ophim1.com"
  }
}
```

> **Lưu ý:** `APP_DOMAIN_CDN_IMAGE` là tiền tố cần nối với `thumb_url`/`poster_url` nếu các trường này trả về dạng đường dẫn tương đối (`/thumb.jpg`) thay vì URL đầy đủ.

---

## 2. Danh sách phim theo bộ lọc

Lấy danh sách phim theo một danh mục định sẵn (phim mới, phim bộ, phim lẻ...).

```
GET /v1/api/danh-sach/{slug}
```

### Tham số

| Tham số | Bắt buộc | Kiểu | Mô tả | Ví dụ |
|---|---|---|---|---|
| `slug` | ✅ | string (path) | Một trong: `phim-moi`, `phim-bo`, `phim-le`, `tv-shows`, `hoat-hinh`, `phim-vietsub`, `phim-thuyet-minh`, `phim-long-tieng`, `phim-bo-dang-chieu`, `phim-bo-hoan-thanh`, `phim-sap-chieu`, `subteam`, `phim-chieu-rap` | `phim-chieu-rap` |
| `page` | ❌ | number | Số trang (mặc định `1`) | `1` |
| `limit` | ❌ | number | Số phim/trang (mặc định `24`) | `24` |
| `sort_field` | ❌ | string | `modified.time` \| `year` \| `_id` | `modified.time` |
| `sort_type` | ❌ | string | `desc` \| `asc` | `desc` |
| `category` | ❌ | string | Lọc theo 1+ thể loại (phân tách bằng dấu phẩy) | `hanh-dong,tinh-cam` |
| `country` | ❌ | string | Lọc theo 1+ quốc gia (phân tách bằng dấu phẩy) | `trung-quoc,han-quoc` |
| `year` | ❌ | string | Lọc theo năm sản xuất | `2026` |

### Ví dụ request

```javascript
const options = { method: 'GET', headers: { accept: 'application/json' } };

fetch('https://ophim1.com/v1/api/danh-sach/phim-moi?page=1&limit=24&sort_field=modified.time&sort_type=desc', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

### Response mẫu

```json
{
  "status": "success",
  "message": "Lấy dữ liệu thành công",
  "data": {
    "seoOnPage": {
      "titleHead": "Danh sách phim mới",
      "descriptionHead": "Xem phim mới nhất được cập nhật"
    },
    "titlePage": "Phim mới",
    "breadCrumb": [
      { "name": "Trang chủ", "slug": "", "isCurrent": false },
      { "name": "Phim mới", "isCurrent": true }
    ],
    "items": ["..."],
    "params": {
      "pagination": {
        "currentPage": 1,
        "totalItems": 100,
        "totalItemsPerPage": 24,
        "totalPages": 5
      }
    }
  }
}
```

---

## 3. Tìm kiếm phim

Tìm kiếm phim theo từ khóa.

```
GET /v1/api/tim-kiem
```

### Tham số

| Tham số | Bắt buộc | Kiểu | Mô tả | Ví dụ |
|---|---|---|---|---|
| `keyword` | ✅ | string | Từ khóa tìm kiếm (tối thiểu 2 ký tự) | `avengers` |
| `page` | ❌ | number | Số trang (mặc định `1`) | `1` |
| `limit` | ❌ | number | Số phim/trang (mặc định `24`) | `24` |

### Ví dụ request

```javascript
const options = { method: 'GET', headers: { accept: 'application/json' } };

fetch('https://ophim1.com/v1/api/tim-kiem?keyword=avengers', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

### Response mẫu

```json
{
  "status": "success",
  "message": "Tìm kiếm thành công",
  "data": {
    "seoOnPage": {
      "titleHead": "Tìm kiếm: avengers",
      "descriptionHead": "Kết quả tìm kiếm cho từ khóa 'avengers'"
    },
    "titlePage": "Tìm kiếm: avengers",
    "breadCrumb": [
      { "name": "Trang chủ", "slug": "", "isCurrent": false },
      { "name": "Tìm kiếm", "isCurrent": true }
    ],
    "items": ["..."],
    "params": {
      "keyword": "avengers",
      "pagination": {
        "currentPage": 1,
        "totalItems": 15,
        "totalItemsPerPage": 20,
        "totalPages": 1
      }
    }
  }
}
```

> **Lưu ý:** nếu `keyword` rỗng hoặc dưới 2 ký tự, nên tự kiểm tra ở phía client trước khi gọi API để tránh request thừa.

---

## 4. Danh sách thể loại

Lấy toàn bộ danh sách thể loại phim (dùng để build filter UI hoặc tra `slug` cho tham số `category`).

```
GET /v1/api/the-loai
```

### Response mẫu

```json
{
  "status": "success",
  "data": [
    { "_id": "...", "slug": "hanh-dong", "name": "Hành động" },
    { "_id": "...", "slug": "tinh-cam", "name": "Tình cảm" }
  ]
}
```

---

## 5. Danh sách phim theo thể loại

Lấy danh sách phim thuộc một thể loại cụ thể, có thể lọc thêm theo quốc gia/năm.

```
GET /v1/api/the-loai/{slug}
```

### Tham số

| Tham số | Bắt buộc | Kiểu | Mô tả | Ví dụ |
|---|---|---|---|---|
| `slug` | ✅ | string (path) | Slug thể loại | `hanh-dong` |
| `page` | ❌ | number | Số trang (mặc định `1`) | `1` |
| `limit` | ❌ | number | Số phim/trang (mặc định `24`) | `24` |
| `sort_field` | ❌ | string | `modified.time` \| `year` \| `_id` | `modified.time` |
| `sort_type` | ❌ | string | `desc` \| `asc` | `desc` |
| `country` | ❌ | string | Lọc theo 1+ quốc gia | `trung-quoc,han-quoc` |
| `year` | ❌ | string | Lọc theo năm sản xuất | `2026` |

### Ví dụ request

```javascript
const options = { method: 'GET', headers: { accept: 'application/json' } };

fetch('https://ophim1.com/v1/api/the-loai/hanh-dong?page=1&country=han-quoc', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

### Response mẫu

```json
{
  "status": "success",
  "message": "Lấy dữ liệu thành công",
  "data": {
    "seoOnPage": {
      "titleHead": "Danh sách phim hành động",
      "descriptionHead": "Xem phim hành động được cập nhật"
    },
    "titlePage": "Phim hành động",
    "breadCrumb": [
      { "name": "Trang chủ", "slug": "", "isCurrent": false },
      { "name": "Phim hành động", "isCurrent": true }
    ],
    "items": ["..."],
    "params": {
      "pagination": {
        "currentPage": 1,
        "totalItems": 100,
        "totalItemsPerPage": 24,
        "totalPages": 5
      }
    }
  }
}
```

---

## 6. Danh sách quốc gia

Lấy toàn bộ danh sách quốc gia (dùng để build filter UI hoặc tra `slug` cho tham số `country`).

```
GET /v1/api/quoc-gia
```

### Ví dụ request

```javascript
const options = { method: 'GET', headers: { accept: 'application/json' } };

fetch('https://ophim1.com/v1/api/quoc-gia', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

### Response mẫu

```json
{
  "status": "success",
  "data": [
    { "_id": "...", "slug": "han-quoc", "name": "Hàn Quốc" },
    { "_id": "...", "slug": "trung-quoc", "name": "Trung Quốc" }
  ]
}
```

---

## 7. Danh sách phim theo quốc gia

Lấy danh sách phim thuộc một quốc gia cụ thể.

```
GET /v1/api/quoc-gia/{slug}
```

### Tham số

| Tham số | Bắt buộc | Kiểu | Mô tả | Ví dụ |
|---|---|---|---|---|
| `slug` | ✅ | string (path) | Slug quốc gia | `han-quoc` |
| `page` | ❌ | number | Số trang (mặc định `1`) | `1` |
| `limit` | ❌ | number | Số phim/trang (mặc định `24`) | `24` |
| `sort_field` | ❌ | string | `modified.time` \| `year` \| `_id` | `modified.time` |
| `sort_type` | ❌ | string | `desc` \| `asc` | `desc` |
| `year` | ❌ | string | Lọc theo năm sản xuất | `2026` |

### Ví dụ request

```javascript
const options = { method: 'GET', headers: { accept: 'application/json' } };

fetch('https://ophim1.com/v1/api/quoc-gia/han-quoc?page=1', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

### Response mẫu

```json
{
  "status": "success",
  "message": "Lấy dữ liệu thành công",
  "data": {
    "seoOnPage": {
      "titleHead": "Danh sách phim hàn quốc",
      "descriptionHead": "Xem phim hàn quốc được cập nhật"
    },
    "titlePage": "Phim hàn quốc",
    "breadCrumb": [
      { "name": "Trang chủ", "slug": "", "isCurrent": false },
      { "name": "Phim hàn quốc", "isCurrent": true }
    ],
    "items": ["..."],
    "params": {
      "pagination": {
        "currentPage": 1,
        "totalItems": 100,
        "totalItemsPerPage": 24,
        "totalPages": 5
      }
    }
  }
}
```

---

## 8. Danh sách năm phát hành

Lấy toàn bộ danh sách năm có phim (dùng để build filter UI).

```
GET /v1/api/nam-phat-hanh
```

### Response mẫu

```json
{
  "status": "success",
  "data": [
    { "_id": "...", "slug": "2025", "name": "2025" },
    { "_id": "...", "slug": "2024", "name": "2024" },
    { "_id": "...", "slug": "2023", "name": "2023" }
  ]
}
```

---

## 9. Danh sách phim theo năm phát hành

Lấy danh sách phim theo năm phát hành cụ thể, có thể lọc thêm theo thể loại/quốc gia.

```
GET /v1/api/nam-phat-hanh/{year}
```

### Tham số

| Tham số | Bắt buộc | Kiểu | Mô tả | Ví dụ |
|---|---|---|---|---|
| `year` | ✅ | string (path) | Năm phát hành | `2025` |
| `page` | ❌ | number | Số trang (mặc định `1`) | `1` |
| `limit` | ❌ | number | Số phim/trang (mặc định `24`) | `24` |
| `sort_field` | ❌ | string | `modified.time` \| `year` \| `_id` | `modified.time` |
| `sort_type` | ❌ | string | `desc` \| `asc` | `desc` |
| `category` | ❌ | string | Lọc theo 1+ thể loại | `hanh-dong,tinh-cam` |
| `country` | ❌ | string | Lọc theo 1+ quốc gia | `han-quoc,trung-quoc` |

### Ví dụ request

```javascript
const options = { method: 'GET', headers: { accept: 'application/json' } };

fetch('https://ophim1.com/v1/api/nam-phat-hanh/2025?category=hanh-dong', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

### Response mẫu

```json
{
  "status": "success",
  "message": "Lấy dữ liệu thành công",
  "data": {
    "seoOnPage": {
      "titleHead": "Danh sách phim năm 2025",
      "descriptionHead": "Xem phim năm 2025 được cập nhật"
    },
    "titlePage": "Phim năm 2025",
    "breadCrumb": [
      { "name": "Trang chủ", "slug": "", "isCurrent": false },
      { "name": "Phim năm 2025", "isCurrent": true }
    ],
    "items": ["..."],
    "params": {
      "pagination": {
        "currentPage": 1,
        "totalItems": 100,
        "totalItemsPerPage": 24,
        "totalPages": 5
      }
    }
  }
}
```

---

## 10. Chi tiết phim

Lấy toàn bộ thông tin chi tiết một phim, bao gồm nội dung, tập phim, link xem, và metadata TMDB/IMDb.

```
GET /v1/api/phim/{slug}
```

### Tham số

| Tham số | Bắt buộc | Kiểu | Mô tả | Ví dụ |
|---|---|---|---|---|
| `slug` | ✅ | string (path) | Slug của phim | `tro-choi-con-muc` |

### Ví dụ request

```javascript
const options = { method: 'GET', headers: { accept: 'application/json' } };

fetch('https://ophim1.com/v1/api/phim/tro-choi-con-muc', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

### Response mẫu — 200 OK

```json
{
  "status": "success",
  "message": "Lấy dữ liệu thành công",
  "data": {
    "item": {
      "_id": "66f8e123456789abcdef",
      "name": "Trò Chơi Con Mực",
      "slug": "tro-choi-con-muc",
      "origin_name": "Trò Chơi Con Mực",
      "alternative_names": ["Trò Chơi Con Mực", "Trò Chơi Con Mực 2"],
      "content": "Mô tả nội dung phim...",
      "type": "single",
      "status": "completed",
      "thumb_url": "/thumb.jpg",
      "poster_url": "/poster.jpg",
      "trailer_url": "https://youtube.com/watch?v=xyz",
      "time": "181 phút",
      "episode_current": "Full",
      "episode_total": "1",
      "quality": "HD",
      "lang": "Vietsub",
      "lang_key": ["vs", "tm"],
      "year": 2019,
      "view": 1000000,
      "actor": ["Robert Downey Jr.", "Chris Evans"],
      "director": ["Anthony Russo", "Joe Russo"],
      "category": ["..."],
      "country": ["..."],
      "episodes": [
        {
          "server_name": "VIP",
          "is_ai": false,
          "server_data": [
            {
              "name": "Full",
              "slug": "full",
              "filename": "tro-choi-con-muc-full",
              "link_embed": "https://player.example.com/embed/xyz",
              "link_m3u8": "https://example.com/video.m3u8"
            }
          ]
        }
      ],
      "tmdb": {
        "type": "movie",
        "id": "299534",
        "vote_average": 8.4,
        "vote_count": 20000
      },
      "imdb": {
        "id": "tt4154796",
        "vote_average": 8.4,
        "vote_count": 1000000
      }
    },
    "seoOnPage": "{...}",
    "breadCrumb": "[...]"
  }
}
```

### Response mẫu — 404 Not Found

```json
{
  "status": "error",
  "message": "Không tìm thấy phim"
}
```

### Giải thích các trường quan trọng

| Trường | Mô tả |
|---|---|
| `type` | `single` (phim lẻ) hoặc `series` (phim bộ) |
| `status` | Trạng thái phát sóng: `completed`, `ongoing`,... |
| `episode_current` / `episode_total` | Tập hiện tại đã cập nhật / tổng số tập |
| `lang_key` | Danh sách loại phụ đề/thuyết minh có sẵn (`vs` = vietsub, `tm` = thuyết minh...) |
| `episodes[].server_data[]` | Danh sách link phát cho từng server; dùng `link_m3u8` để phát HLS hoặc `link_embed` để nhúng player |

---

## 11. Hình ảnh phim (TMDB)

Lấy bộ hình ảnh HD (backdrop, poster) từ TMDB cho một phim.

```
GET /v1/api/phim/{slug}/images
```

### Tham số

| Tham số | Bắt buộc | Kiểu | Mô tả | Ví dụ |
|---|---|---|---|---|
| `slug` | ✅ | string (path) | Slug của phim | `tro-choi-con-muc` |

### Ví dụ request

```javascript
const options = { method: 'GET', headers: { accept: 'application/json' } };

fetch('https://ophim1.com/v1/api/phim/tro-choi-con-muc/images', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

### Response mẫu — 200 OK

```json
{
  "success": true,
  "message": "Lấy dữ liệu thành công",
  "data": {
    "tmdb_id": 299534,
    "tmdb_type": "movie",
    "ophim_id": "66f8e123456789abcdef",
    "slug": "tro-choi-con-muc",
    "imdb_id": "tt4154796",
    "image_sizes": {
      "backdrop": {
        "original": "original",
        "w1280": "w1280",
        "w780": "w780",
        "w300": "w300"
      },
      "poster": {
        "original": "original",
        "w780": "w780",
        "w342": "w342",
        "w185": "w185"
      }
    },
    "images": [
      {
        "width": 1920,
        "height": 1080,
        "aspect_ratio": 1.778,
        "type": "backdrop",
        "file_path": "/n6bUvigpRFqSwmPp1m2YADdbRBc.jpg"
      }
    ]
  }
}
```

> **Cách dựng URL ảnh đầy đủ:** TMDB yêu cầu ghép `base_url + size + file_path`. Ví dụ cơ bản:
> `https://image.tmdb.org/t/p/{size}{file_path}`
> Trong đó `{size}` lấy từ `image_sizes.backdrop`/`image_sizes.poster` (ví dụ `w1280`) và `{file_path}` lấy từ từng phần tử trong `images[]`.

---

## 12. Thông tin diễn viên (TMDB)

Lấy danh sách diễn viên/đoàn làm phim kèm ảnh chân dung từ TMDB.

```
GET /v1/api/phim/{slug}/peoples
```

### Tham số

| Tham số | Bắt buộc | Kiểu | Mô tả | Ví dụ |
|---|---|---|---|---|
| `slug` | ✅ | string (path) | Slug của phim | `tro-choi-con-muc` |

### Ví dụ request

```javascript
const options = { method: 'GET', headers: { accept: 'application/json' } };

fetch('https://ophim1.com/v1/api/phim/tro-choi-con-muc/peoples', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

### Response mẫu — 200 OK

```json
{
  "success": true,
  "message": "Lấy dữ liệu thành công",
  "data": {
    "tmdb_id": 299534,
    "tmdb_type": "movie",
    "ophim_id": "66f8e123456789abcdef",
    "slug": "tro-choi-con-muc",
    "imdb_id": "tt4154796",
    "profile_sizes": {
      "h632": "h632",
      "original": "original",
      "w185": "w185",
      "w45": "w45"
    },
    "peoples": [
      {
        "tmdb_people_id": 3223,
        "adult": false,
        "gender": 2,
        "gender_name": "Nam",
        "name": "Robert Downey Jr.",
        "original_name": "Robert Downey Jr.",
        "character": "Tony Stark / Iron Man",
        "known_for_department": "Acting",
        "profile_path": "/5qHNjhtjMD4YWH3UP0rm4tKwxCL.jpg"
      }
    ]
  }
}
```

> Tương tự mục 11, dùng `profile_sizes` + `profile_path` để dựng URL ảnh chân dung đầy đủ qua TMDB image CDN.

---

## 13. Từ khóa phim (TMDB)

Lấy danh sách từ khóa/tag liên quan đến phim từ TMDB (song ngữ Anh–Việt).

```
GET /v1/api/phim/{slug}/keywords
```

### Tham số

| Tham số | Bắt buộc | Kiểu | Mô tả | Ví dụ |
|---|---|---|---|---|
| `slug` | ✅ | string (path) | Slug của phim | `tro-choi-con-muc` |

### Ví dụ request

```javascript
const options = { method: 'GET', headers: { accept: 'application/json' } };

fetch('https://ophim1.com/v1/api/phim/tro-choi-con-muc/keywords', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

### Response mẫu — 200 OK

```json
{
  "success": true,
  "message": "Lấy dữ liệu thành công",
  "data": {
    "tmdb_id": 299534,
    "tmdb_type": "movie",
    "ophim_id": "66f8e123456789abcdef",
    "slug": "tro-choi-con-muc",
    "imdb_id": "tt4154796",
    "keywords": [
      {
        "tmdb_keyword_id": 9715,
        "name": "superhero",
        "name_vn": "siêu anh hùng"
      }
    ]
  }
}
```

---

## 14. Mã lỗi & xử lý ngoại lệ

| HTTP Status | `status`/`success` | Trường hợp | Cách xử lý đề xuất |
|---|---|---|---|
| 200 | `success` / `true` | Request thành công | Đọc `data` như bình thường |
| 404 | `error` | Slug phim/thể loại/quốc gia không tồn tại | Hiển thị "Không tìm thấy" thay vì render dữ liệu rỗng |
| 4xx khác | `error` | Tham số không hợp lệ (ví dụ `keyword` quá ngắn) | Validate tham số ở client trước khi gọi |
| 5xx | — | Lỗi server / quá tải | Retry có backoff, không retry liên tục ngay lập tức |

### Mẫu xử lý lỗi (JavaScript)

```javascript
async function fetchOphim(url) {
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    const json = await res.json();

    if (json.status === 'error' || json.success === false) {
      throw new Error(json.message || 'Yêu cầu thất bại');
    }
    return json.data;
  } catch (err) {
    console.error('Ophim API error:', err.message);
    throw err;
  }
}
```

---

## 15. Ghi chú thực thi

- **Không cần API key**: tất cả endpoint đều là public GET request.
- **Slug là khóa chính**: hầu hết endpoint chi tiết dùng `slug` (không phải `_id`) để truy vấn — lấy `slug` từ kết quả danh sách/tìm kiếm trước khi gọi endpoint chi tiết.
- **Đa thể loại/quốc gia**: tham số `category` và `country` chấp nhận nhiều giá trị phân tách bằng dấu phẩy, không có khoảng trắng (ví dụ `hanh-dong,tinh-cam`, không phải `hanh-dong, tinh-cam`).
- **Ảnh tương đối vs tuyệt đối**: `thumb_url`/`poster_url` ở endpoint chi tiết phim đôi khi trả về dạng đường dẫn tương đối (`/thumb.jpg`); cần nối với `APP_DOMAIN_CDN_IMAGE` (lấy từ endpoint `/v1/api/home`) để có URL đầy đủ.
- **Dữ liệu TMDB là optional**: endpoint `images`, `peoples`, `keywords` phụ thuộc vào việc phim có `tmdb_id` liên kết hay không; nếu phim không có dữ liệu TMDB, các trường mảng (`images`, `peoples`, `keywords`) có thể trả về rỗng.
- **Phân trang**: luôn kiểm tra `totalPages` trước khi gọi trang tiếp theo để tránh request thừa ngoài phạm vi dữ liệu.
- **Rate limiting**: tài liệu gốc không công bố giới hạn tốc độ cụ thể; nên tự giới hạn tần suất gọi (ví dụ debounce khi tìm kiếm) để tránh bị chặn IP.

---

## 16. Định dạng xuất nguồn phim (Embed / M3U8)

Ngoài dữ liệu JSON trả về từ endpoint [chi tiết phim](#10-chi-tiết-phim) (mảng `episodes[].server_data[]`), hệ thống quản trị Ophim cho phép xuất nhanh danh sách link nguồn của một server dưới dạng văn bản thuần (plain text), mỗi tập trên một dòng. Định dạng này thường dùng để copy/paste nhanh sang công cụ khác hoặc import hàng loạt.

### 16.1. Cú pháp chung

```
{STT}|{template_đã_render}
```

- Mỗi dòng tương ứng với một tập phim (`server_data[]` item), đánh số thứ tự tăng dần hoặc giảm dần tùy chế độ sắp xếp (**Tăng dần** / **Giảm dần**).
- Ký tự phân tách giữa số thứ tự và nội dung là dấu gạch đứng `|` (pipe), **không có khoảng trắng** hai bên.
- "Template" là chuỗi định dạng do người dùng cấu hình, có thể chèn biến bằng cú pháp `{tên_biến}`.

### 16.2. Các biến hỗ trợ trong template

Các biến này ánh xạ trực tiếp tới các trường trong object `server_data[]` của endpoint chi tiết phim ([mục 10](#10-chi-tiết-phim)):

| Biến | Ánh xạ tới trường API | Mô tả |
|---|---|---|
| `{name}` | `server_data[].name` | Tên tập (ví dụ `Full`, `Tập 1`) |
| `{slug}` | `server_data[].slug` | Slug của tập |
| `{filename}` | `server_data[].filename` | Tên file nội bộ |
| `{link_embed}` | `server_data[].link_embed` | Link nhúng player (iframe) |
| `{link_m3u8}` | `server_data[].link_m3u8` | Link phát trực tiếp định dạng HLS |

### 16.3. Hai chế độ xuất

#### a) Nguồn Embed

Template mặc định:

```
{name}|{link_embed}
```

Ví dụ kết quả xuất (6 tập, đánh số tăng dần):

```
1|https://vip.opstream10.com/share/eebf8c4112978252010dbe58d06ad568
2|https://vip.opstream10.com/share/5a088882ef212556521816f6ccab00c9b
3|https://vip.opstream10.com/share/4a333cef27064666cb534d210b8d2c76
4|https://vip.opstream10.com/share/a854d36a4afe77df29f4c42eb35af078
5|https://vip.opstream10.com/share/c04ee68bad31e814e67c402f57dbf1d2
6|https://vip.opstream10.com/share/9c72beb8516560029a65e588f5302db3
```

> Lưu ý: dòng ví dụ hiển thị `{name}|{link_embed}` nhưng khi `name` là `1`, `2`, `3`... trùng với số thứ tự nên phần "số thứ tự" và phần "tên tập" trông giống nhau trên UI — về bản chất đây vẫn là 2 giá trị riêng (số thứ tự do hệ thống sinh, `name` lấy từ dữ liệu tập).

#### b) Nguồn M3U8

Template mặc định:

```
{name}|{link_m3u8}
```

Ví dụ kết quả xuất:

```
1|https://vip.opstream10.com/20260616/33924_eebf8c41/index.m3u8
2|https://vip.opstream10.com/20260618/33933_5a088882/index.m3u8
3|https://vip.opstream10.com/20260623/33943_4a333cef/index.m3u8
4|https://vip.opstream10.com/20260701/33958_a854d36a/index.m3u8
5|https://vip.opstream10.com/20260706/33975_c04ee68b/index.m3u8
6|https://vip.opstream10.com/20260713/33989_9c72beb8/index.m3u8
```

### 16.4. Sắp xếp

Hai nút điều khiển thứ tự dòng xuất:

| Nút | Hiệu ứng |
|---|---|
| **Tăng dần** | Tập 1 → Tập N (STT tăng dần từ trên xuống) |
| **Giảm dần** | Tập N → Tập 1 (STT giảm dần từ trên xuống) |

### 16.5. Cách dựng chuỗi xuất từ dữ liệu API

Có thể tái tạo định dạng này ở phía client bằng cách lấy `episodes[].server_data[]` từ response endpoint [chi tiết phim](#10-chi-tiết-phim) rồi map qua template:

```javascript
function exportSourceList(serverData, template = '{name}|{link_embed}', order = 'asc') {
  const list = order === 'asc' ? serverData : [...serverData].reverse();

  return list
    .map((ep, idx) => {
      const line = template
        .replace('{name}', ep.name)
        .replace('{slug}', ep.slug)
        .replace('{filename}', ep.filename)
        .replace('{link_embed}', ep.link_embed)
        .replace('{link_m3u8}', ep.link_m3u8);
      return `${idx + 1}|${line}`;
    })
    .join('\n');
}

// Ví dụ dùng với dữ liệu từ /v1/api/phim/{slug}
// const serverData = data.item.episodes[0].server_data;
// console.log(exportSourceList(serverData, '{name}|{link_m3u8}', 'asc'));
```

> **Lưu ý:** template ví dụ trên (`{name}|{link_embed}`) đã bao gồm sẵn phần `{name}`; nếu muốn giữ đúng định dạng UI gốc (số thứ tự do hệ thống sinh, không phải giá trị `name` gốc), nên tách riêng phần số thứ tự (`idx + 1`) khỏi phần render template như đoạn code trên.

### 16.6. Phân tích ngược (parse) chuỗi xuất về JSON

Nếu cần chuyển ngược từ định dạng text này về danh sách object để gọi lại các API khác (ví dụ đối chiếu với `server_data`), có thể parse như sau:

```javascript
function parseSourceList(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [stt, ...rest] = line.split('|');
      return { stt: Number(stt), link: rest.join('|') };
    });
}
```

> Dùng `rest.join('|')` thay vì lấy phần tử thứ 2 để tránh mất dữ liệu nếu chính link chứa ký tự `|` (hiếm gặp nhưng an toàn hơn).