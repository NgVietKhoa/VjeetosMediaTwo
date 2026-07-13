# Tài liệu thiết kế UI/UX & Animation — Web Phim

Hệ thống thiết kế dành cho giao diện web xem phim, xây dựng trên dữ liệu từ [API Ophim](./ophim-api-docs.md). Định hướng: **rạp chiếu về đêm** — tối, tương phản cao, ánh sáng vàng ấm như đèn máy chiếu rọi qua bóng tối phòng chiếu.

## Mục lục

1. [Định hướng thiết kế](#1-định-hướng-thiết-kế)
2. [Bảng màu](#2-bảng-màu)
3. [Typography](#3-typography)
4. [Khoảng cách & lưới bố cục](#4-khoảng-cách--lưới-bố-cục)
5. [Thành phần giao diện (Components)](#5-thành-phần-giao-diện-components)
6. [Animation & chuyển động](#6-animation--chuyển-động)
7. [Trạng thái rỗng, tải, lỗi](#7-trạng-thái-rỗng-tải-lỗi)
8. [Khả năng tiếp cận (Accessibility)](#8-khả-năng-tiếp-cận-accessibility)
9. [CSS tokens đầy đủ](#9-css-tokens-đầy-đủ)

---

## 1. Định hướng thiết kế

**Ý tưởng cốt lõi:** người dùng đang ngồi trong một phòng chiếu tối, ánh sáng duy nhất là luồng sáng từ máy chiếu (màu vàng ấm — `accent-gold`) và tấm màn nhung đỏ sẫm phía sau (`accent-crimson`, dùng rất tiết chế cho nhãn "Mới"/"Đang chiếu"). Nền không phải đen tuyệt đối mà là than chì lạnh, đủ sâu để poster và ảnh nổi bật.

**Nguyên tắc:**

- Nền tối là mặc định, không phải một "dark mode" phụ — toàn bộ hệ thống thiết kế xoay quanh nó.
- Chỉ một điểm nhấn màu chính (vàng đồng) cho hành động chính; đỏ cẩm chỉ dùng cho nhãn/trạng thái, không dùng cho nút bấm chính.
- Poster và ảnh backdrop là "ngôi sao" của giao diện — chữ và khung chỉ nên tôn lên, không cạnh tranh độ chú ý.
- Chuyển động phải có lý do: mô phỏng ánh sáng rọi, phim tua, hoặc phản hồi thao tác — không thêm hiệu ứng trang trí thừa.

**Yếu tố nhận diện (signature):** dải phân cách kiểu **lỗ tròn phim nhựa (sprocket holes)** dùng làm divider giữa các section, và **nhãn đánh giá dạng vé xem phim** (góc bo lệch, mép răng cưa nhẹ) cho điểm IMDb/TMDB.

---

## 2. Bảng màu

| Token                 | Hex                                                                | Vai trò                                                        |
| --------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------- |
| `--bg-void`           | `#0A0B0F`                                                          | Nền trang (gần đen, ám xanh lạnh — không phải đen thuần)       |
| `--bg-surface`        | `#14161D`                                                          | Nền card, panel, thanh điều hướng                              |
| `--bg-elevated`       | `#1D202B`                                                          | Nền modal, dropdown, trạng thái hover của card                 |
| `--border`            | `#262A36`                                                          | Viền mặc định, hairline                                        |
| `--border-strong`     | `#383D4D`                                                          | Viền khi hover/focus                                           |
| `--text-primary`      | `#F2F3F7`                                                          | Tiêu đề, nội dung chính                                        |
| `--text-secondary`    | `#9098AC`                                                          | Mô tả, metadata phụ                                            |
| `--text-muted`        | `#5B6178`                                                          | Placeholder, timestamp, số lượt xem                            |
| `--accent-gold`       | `#E3A73F`                                                          | Điểm nhấn chính: nút CTA, trạng thái active, sao đánh giá      |
| `--accent-gold-hover` | `#F0B85A`                                                          | Hover/active của `accent-gold`                                 |
| `--accent-crimson`    | `#C8483A`                                                          | Nhãn "Mới", "Đang chiếu", badge khẩn — dùng tiết chế           |
| `--accent-teal`       | `#3F9169`                                                          | Trạng thái "Hoàn thành", tick thành công — dùng rất hạn chế    |
| `--scrim`             | `linear-gradient(180deg, transparent 0%, rgba(10,11,15,0.9) 100%)` | Lớp phủ gradient trên ảnh backdrop/poster để chữ luôn đọc được |

### Nguyên tắc dùng màu

- **Tỷ lệ 90/8/2**: 90% diện tích là các sắc thái nền tối trung tính; 8% là văn bản; chỉ ~2% là `accent-gold`/`accent-crimson` — dành cho điểm cần chú ý nhất trên mỗi màn hình.
- Không dùng `accent-crimson` cho nút hành động chính (dễ đọc nhầm là cảnh báo lỗi) — chỉ dùng cho badge/nhãn.
- Chữ trên nền màu (badge, pill) luôn dùng sắc độ tối hơn của cùng tông màu hoặc `--bg-void`, không dùng đen thuần hay `--text-primary`.
- Ảnh luôn có `--scrim` phủ ở 1/3 dưới để đảm bảo tiêu đề/nút bấm đặt trên ảnh vẫn tương phản đủ (tối thiểu 4.5:1 theo WCAG AA).

---

## 3. Typography

| Vai trò                      | Font                                              | Khi dùng                                                                       |
| ---------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------ |
| Display (tiêu đề phim, hero) | **Fraunces** (serif biến thể, optical sizing lớn) | Tên phim ở hero, tiêu đề trang chi tiết — dùng tiết chế, không dùng cho UI phụ |
| UI / Body                    | **Manrope**                                       | Điều hướng, mô tả, nút bấm, form, toàn bộ giao diện còn lại                    |
| Utility / Mono               | **JetBrains Mono**                                | Số tập, độ phân giải (`HD`, `4K`), thời lượng, lượt xem, timestamp             |

Import (Google Fonts):

```html
<link
  href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Manrope:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

### Thang chữ (type scale)

| Cấp        | Font/Weight        | Size / Line-height                | Dùng cho                                |
| ---------- | ------------------ | --------------------------------- | --------------------------------------- |
| Display XL | Fraunces 600       | 48px / 1.1                        | Tên phim ở trang chi tiết               |
| Display L  | Fraunces 600       | 34px / 1.15                       | Tiêu đề hero trang chủ                  |
| Heading    | Manrope 700        | 22px / 1.3                        | Tiêu đề section ("Phim mới", "Đề xuất") |
| Subheading | Manrope 500        | 16px / 1.4                        | Tên phim trong poster card              |
| Body       | Manrope 400        | 15px / 1.6                        | Mô tả nội dung phim                     |
| Caption    | Manrope 400        | 13px / 1.4                        | Metadata: năm, quốc gia, thể loại       |
| Mono tag   | JetBrains Mono 500 | 12px / 1.2, letter-spacing 0.02em | `HD`, `T12`, `2019`, `1.2M lượt xem`    |

> **Lưu ý:** không dùng Fraunces cho đoạn văn dài (mô tả nội dung) — chỉ dùng cho tiêu đề ngắn, vì optical sizing lớn của font này giảm khả năng đọc ở size nhỏ.

---

## 4. Khoảng cách & lưới bố cục

- Đơn vị cơ sở: **4px**. Các khoảng cách chuẩn: `4, 8, 12, 16, 24, 32, 48, 64px`.
- Bán kính bo góc: `--radius-sm: 6px` (badge, input) · `--radius-md: 10px` (poster card, button) · `--radius-lg: 16px` (modal, panel lớn).
- Lưới poster: `grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))`, `gap: 16px`; ở mobile giảm `minmax` xuống `120px`.
- Hero backdrop: chiều cao `56vh` (desktop) / `40vh` (mobile), luôn có `--scrim` phủ đáy.
- Hàng ngang cuộn (rail) dùng `scroll-snap-type: x mandatory` với `scroll-padding: 24px`, ẩn scrollbar mặc định, hiện khi hover trên desktop.

---

## 5. Thành phần giao diện (Components)

### 5.1. Thanh điều hướng (Navbar)

- Nền `--bg-surface` với `backdrop-filter: blur(12px)` và độ mờ `rgba(10,11,15,0.75)` khi cuộn qua hero (hiệu ứng "kính mờ" nổi trên ảnh).
- Trạng thái active dùng gạch chân 2px `--accent-gold`, không đổi màu chữ toàn bộ mục (tránh gây rối ở nền tối).
- Ô tìm kiếm: nền `--bg-elevated`, viền `--border`, khi focus viền chuyển `--accent-gold` kèm `box-shadow: 0 0 0 3px rgba(227,167,63,0.15)`.

### 5.2. Poster card

```
┌───────────────────┐
│                    │  ← ảnh poster (tỷ lệ 2:3)
│     [badge góc]    │     badge góc trên-trái: chất lượng (HD/4K)
│                    │     badge góc trên-phải: tập mới nếu có
│ ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁ │  ← scrim gradient đáy ảnh
│ Tên phim           │
│ 2024 · Hành động   │
└───────────────────┘
```

- Trạng thái nghỉ: viền `1px solid --border`, không có bóng đổ (giữ giao diện phẳng, tối).
- Hover (desktop): scale nhẹ `1.04`, viền chuyển `--accent-gold`, icon play mờ dần hiện ở giữa ảnh, thời lượng transition `220ms` (xem mục 6).
- Badge chất lượng: nền `--bg-void`/70% opacity, chữ mono `--text-primary`, bo góc `--radius-sm`.
- Nhãn "Mới"/"Tập X": nền `--accent-crimson`, chữ `#FCEBEB` (Coral 50 tương phản), góc trên-phải, bo lệch một góc để gợi liên tưởng nhãn dán.

### 5.3. Nhãn đánh giá kiểu vé xem phim (signature element)

Badge điểm số IMDb/TMDB dùng hình dạng "vé xem phim" — hình chữ nhật với hai vết khía tròn nhỏ ở cạnh trái/phải (tạo bằng `radial-gradient` hoặc `clip-path`), nền `--bg-elevated`, số điểm màu `--accent-gold`, font mono.

```css
.rating-stub {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px 4px 8px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  font-family: "JetBrains Mono", monospace;
  color: var(--accent-gold);
  font-size: 12px;
}
.rating-stub::before,
.rating-stub::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 6px;
  height: 6px;
  background: var(--bg-void);
  border-radius: 50%;
  transform: translateY(-50%);
}
.rating-stub::before {
  left: -3px;
}
.rating-stub::after {
  right: -3px;
}
```

### 5.4. Dải phân cách sprocket (film strip divider)

Dùng giữa các section thay cho `<hr>` thông thường:

```css
.sprocket-divider {
  height: 20px;
  background-image: radial-gradient(
    circle,
    var(--border-strong) 2.5px,
    transparent 2.6px
  );
  background-size: 24px 20px;
  background-repeat: repeat-x;
  background-position: center;
  opacity: 0.5;
}
```

Chỉ dùng ở các điểm chuyển section lớn (ví dụ giữa "Phim mới" và "Bảng xếp hạng"), không lạm dụng ở mọi khoảng cách nhỏ.

### 5.5. Nút bấm (Buttons)

| Loại      | Nền                                | Chữ                                 | Dùng cho                          |
| --------- | ---------------------------------- | ----------------------------------- | --------------------------------- |
| Primary   | `--accent-gold`                    | `--bg-void` (chữ tối trên nền sáng) | "Xem phim", "Phát ngay"           |
| Secondary | trong suốt, viền `--border-strong` | `--text-primary`                    | "Thêm vào danh sách", "Chia sẻ"   |
| Ghost     | trong suốt, không viền             | `--text-secondary`                  | Hành động phụ trong danh sách tập |

Chỉ **một** nút Primary trên mỗi khung nhìn (ví dụ trang chi tiết phim: "Xem phim" là Primary duy nhất, các nút còn lại là Secondary/Ghost).

### 5.6. Chọn server & tập phim

- Server dạng chip cuộn ngang, chip active nền `--accent-gold`/15% opacity, viền `--accent-gold`.
- Danh sách tập: lưới số, tập đang xem có chấm tròn `--accent-gold` góc trên-phải; tập chưa xem viền `--border`; tập đã xem nền `--bg-elevated` mờ hơn để phân biệt.

### 5.7. Thanh điều khiển video (player)

- Nền thanh điều khiển: gradient tối dần từ trong suốt lên `rgba(10,11,15,0.85)` ở đáy khung hình (không che toàn bộ video).
- Thanh tiến trình: track `--border`, phần đã xem `--accent-gold`, chấm kéo (thumb) sáng `--accent-gold-hover` khi hover.
- Toàn bộ icon dùng nét mảnh (outline), không dùng icon filled để giữ cảm giác nhẹ trên nền video.

---

## 6. Animation & chuyển động

### 6.1. Token thời gian & easing

```css
--dur-instant: 100ms;
--dur-fast: 180ms;
--dur-base: 240ms;
--dur-slow: 400ms;
--dur-cinematic: 800ms; /* dùng riêng cho hiệu ứng hero */

--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

### 6.2. Các chuyển động chính

| Vị trí                     | Hiệu ứng                                                                                                 | Thời lượng/easing                                 | Ghi chú                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Hero backdrop              | Ken Burns — zoom chậm `scale(1 → 1.08)` liên tục, lặp vô hạn                                             | `20000ms linear`, `alternate`                     | Rất chậm, gần như không nhận ra — mô phỏng máy chiếu đang chạy, không gây xao nhãng |
| Hover poster card          | `transform: scale(1.04)` + nâng viền màu                                                                 | `var(--dur-fast) var(--ease-out)`                 | Icon play fade-in đồng thời `opacity 0 → 1`                                         |
| Poster grid load           | Stagger fade + dịch lên nhẹ (`translateY(8px) → 0`)                                                      | mỗi item lệch `40ms`, từng item `var(--dur-base)` | Giới hạn stagger tối đa ~10 item đầu để tránh cảm giác chậm                         |
| Chuyển trang (route)       | Crossfade + dịch nhẹ nội dung mới                                                                        | `var(--dur-base) var(--ease-in-out)`              | Không dùng hiệu ứng trượt ngang toàn trang — gây khó chịu ở danh sách dài           |
| Skeleton loading           | Shimmer quét sáng nhẹ trên khối `--bg-elevated`                                                          | `1500ms linear infinite`                          | Dải sáng dùng gradient `--border-strong` mờ, không dùng trắng thuần                 |
| Mở modal (chọn server/tập) | Scale từ `0.96 → 1` + fade                                                                               | `var(--dur-fast) var(--ease-out)`                 | Nền sau modal tối thêm (`--scrim` phủ full màn)                                     |
| Badge "Mới"                | Không animate liên tục (nhấp nháy liên tục gây mỏi mắt) — chỉ có hiệu ứng entrance một lần khi xuất hiện | `var(--dur-base)`                                 | Tránh hiệu ứng pulsing vô hạn cho badge tĩnh                                        |
| Thanh tiến trình video     | Cập nhật width mượt theo thời gian thực                                                                  | không cần transition riêng (đồng bộ `timeupdate`) | —                                                                                   |

### 6.3. Nguyên tắc chuyển động

- **Một khoảnh khắc được đầu tư kỹ hơn nhiều khoảnh khắc rời rạc**: hiệu ứng Ken Burns ở hero là điểm nhấn chuyển động chính của toàn site — phần còn lại (hover, load) nên nhanh và kín đáo (`180–240ms`).
- Không animate `box-shadow` hay các thuộc tính gây reflow nặng; ưu tiên `transform` và `opacity`.
- Luôn tôn trọng `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 7. Trạng thái rỗng, tải, lỗi

- **Không có kết quả tìm kiếm**: hình minh hoạ đơn giản (film reel rỗng), tiêu đề "Không tìm thấy phim phù hợp", gợi ý rút gọn từ khóa — không dùng câu chung chung "Đã có lỗi xảy ra".
- **Lỗi tải dữ liệu (API lỗi/404)**: giữ nguyên bố cục trang, hiển thị thông báo tại đúng vùng nội dung bị lỗi (không thay toàn màn hình bằng trang lỗi trắng xoá bố cục tối).
- **Đang tải danh sách phim**: dùng skeleton card đúng tỷ lệ poster (2:3) thay vì spinner toàn trang, để bố cục không "nhảy" khi dữ liệu về.

---

## 8. Khả năng tiếp cận (Accessibility)

- Độ tương phản văn bản chính (`--text-primary` trên `--bg-void`/`--bg-surface`) đạt tối thiểu **AA** (≥4.5:1); `--text-secondary` dùng cho nội dung phụ, không dùng cho văn bản quan trọng cần đọc nhanh.
- Trạng thái focus bàn phím luôn hiển thị rõ: `outline: 2px solid var(--accent-gold); outline-offset: 2px` — không bao giờ `outline: none` mà không thay thế.
- Icon-only button (play, thêm danh sách, tua) đều cần `aria-label` mô tả hành động bằng tiếng Việt.
- Video player: hỗ trợ điều khiển bằng bàn phím (space = play/pause, mũi tên = tua), phụ đề bật/tắt được, không tự động phát âm thanh khi chưa tương tác.
- Tôn trọng `prefers-reduced-motion` như mục 6.3.

---

## 9. CSS tokens đầy đủ

```css
:root {
  /* Màu nền */
  --bg-void: #0a0b0f;
  --bg-surface: #14161d;
  --bg-elevated: #1d202b;
  --border: #262a36;
  --border-strong: #383d4d;

  /* Chữ */
  --text-primary: #f2f3f7;
  --text-secondary: #9098ac;
  --text-muted: #5b6178;

  /* Điểm nhấn */
  --accent-gold: #e3a73f;
  --accent-gold-hover: #f0b85a;
  --accent-crimson: #c8483a;
  --accent-teal: #3f9169;
  --scrim: linear-gradient(180deg, transparent 0%, rgba(10, 11, 15, 0.9) 100%);

  /* Bo góc */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  /* Font */
  --font-display: "Fraunces", serif;
  --font-body: "Manrope", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Chuyển động */
  --dur-instant: 100ms;
  --dur-fast: 180ms;
  --dur-base: 240ms;
  --dur-slow: 400ms;
  --dur-cinematic: 800ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}

body {
  background: var(--bg-void);
  color: var(--text-primary);
  font-family: var(--font-body);
}
```
