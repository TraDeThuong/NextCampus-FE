# Quy Chuẩn Chuyển Đổi Ngôn Ngữ & Theme (i18n & Theme Guidelines)

Áp dụng cho toàn bộ repository `NexCampus-FE/`.

---

## 🌐 1. Chuyển Đổi Ngôn Ngữ Anh - Việt (Internationalization - i18n)

### 1.1. Công nghệ & Cấu trúc Routing
- Sử dụng thư viện **`next-intl`** (phiên bản `4.x`) kết hợp cấu trúc thư mục App Router động: `app/[locale]/...`.
- Cấu hình tại `i18n/routing.ts`:
  - 2 ngôn ngữ được hỗ trợ:
    * `vi` (**Tiếng Việt**): Ngôn ngữ mặc định (`defaultLocale: "vi"`).
    * `en` (**Tiếng Anh**): Dành cho người dùng quốc tế.
  - Định dạng URL: `localePrefix: "as-needed"` (tiếng Việt không cần prefix, tiếng Anh có tiền tố `/en/...`).

### 1.2. Cơ chế Hoạt Động & Chuyển Đổi (Language Switching)
- **Tải dữ liệu dịch**:
  - Dữ liệu dịch được phân theo namespace trong thư mục `messages/vi/*.json` và `messages/en/*.json`.
  - Tải đồng thời qua hàm `loadLocaleMessages()` và truyền vào `providers/LocaleProvider.tsx`.
- **Hook chuyển đổi**:
  - Sử dụng hook tùy chỉnh `useLocaleSwitcher()`:
    ```tsx
    const { locale, setLocale } = useLocaleSwitcher();
    const toggleLanguage = () => {
      setLocale(locale === "vi" ? "en" : "vi");
    };
    ```
  - Khi đổi locale:
    * Cập nhật thuộc tính `document.documentElement.lang = newLocale`.
    * Cập nhật URL trình duyệt thông qua `window.history.replaceState()` để đổi locale tức thì mà **không gây reload trang** hay mất dữ liệu form đang nhập dở.
    * Gắn cờ ngôn ngữ trên Header: `🇻🇳 VN` và `🇺🇸 EN`.

### 1.3. Quy Tắc Lập Trình & Typography Tiếng Việt
- **Tuyệt đối không hardcode text**:
  - Mọi chuỗi ký tự hiển thị trên giao diện (tiêu đề, placeholder, nút bấm, thông báo lỗi, tooltip) bắt buộc phải sử dụng qua hook `useTranslations()`:
    ```tsx
    const t = useTranslations("tasks");
    return <button>{t("createTask")}</button>;
    ```
- **Xử lý Font chữ Tiếng Việt**:
  - Tiếng Việt có nhiều dấu thanh phức tạp; hệ thống đã cấu hình CSS đặc thù trong `app/globals.css`:
    ```css
    html[lang="vi"] body {
      font-family: var(--font-body-vi), sans-serif;
    }
    html[lang="vi"] h1, html[lang="vi"] h2, html[lang="vi"] h3 {
      font-family: var(--font-heading-vi), sans-serif;
    }
    ```
  - Đảm bảo các ký tự tiếng Việt có dấu không bị nhảy font (glyph mismatch) hoặc lệch line-height so với tiếng Anh.

---

## 🌓 2. Chuyển Đổi Sáng / Tối / Theo Hệ Thống (Theme Mode: Light / Dark / System)

### 2.1. Ba Chế Độ Giao Diện (Theme Modes)
1. **Sáng (Light Mode)**:
   - Phù hợp môi trường làm việc ban ngày hoặc văn phòng nhiều ánh sáng.
   - Nền sáng dịu (`--background: #F8FAFC` / `#FFFFFF`), chữ tối tương phản cao (`--foreground: #0F172A`), đường viền mỏng tinh tế (`--border: #E2E8F0`), bóng đổ mềm mại (`shadow-sm`).
2. **Tối (Dark Mode) — Đặc Trưng NexCampus**:
   - Phù hợp làm việc buổi tối, phong cách công nghệ cao Glassmorphism.
   - Nền tối sâu (`--background: #060816` / `#0B1020`), chữ sáng dịu mắt (`--foreground: #F8FAFC`), hiệu ứng chữ kim loại bạc `.metal-text`, các thẻ card kính mờ (`bg-white/5 backdrop-blur-xl border border-white/10`).
3. **Theo Hệ Thống (System Mode)**:
   - Tự động phát hiện và đồng bộ theo cài đặt giao diện của hệ điều hành (Windows, macOS, iOS, Android) của người dùng.

### 2.2. Cơ Chế Kỹ Thuật (Architecture & Implementation)
- **Class Root `.dark`**:
  - Áp dụng class `.dark` trực tiếp lên thẻ `<html>`:
    * Khi ở chế độ Dark: `<html className="dark">`.
    * Khi ở chế độ Light: `<html className="">` (gỡ bỏ class `dark`).
- **Lưu Trữ Lựa Chọn Người Dùng**:
  - Lưu giá trị `'light' | 'dark' | 'system'` trong `localStorage` với key `nexcampus-theme` (hoặc `theme`).
- **Lắng Nghe Sự Kiện Hệ Thống (System Listener)**:
  - Khi người dùng chọn `system`, hệ thống sử dụng `window.matchMedia('(prefers-color-scheme: dark)')`:
    ```tsx
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (savedTheme === "system") {
        document.documentElement.classList.toggle("dark", e.matches);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    ```
- **Chống Nhấp Nháy Giao Diện (Prevent Flash of Unstyled Content - FOUC)**:
  - Bắt buộc có một đoạn inline script nhỏ chạy đồng bộ trong thẻ `<head>` của `layout.tsx` trước khi React render:
    ```html
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var theme = localStorage.getItem('nexcampus-theme') || 'system';
              var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
              if (isDark) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          })();
        `,
      }}
    />
    ```

### 2.3. Quy Chuẩn Sử Dụng Semantic Color Tokens trong Tailwind 4
- **KHÔNG hardcode màu cứng** (như `bg-[#060816]` hay `text-black`):
  - Luôn sử dụng semantic CSS variables được ánh xạ trong `@theme` (`app/globals.css`):
    * Nền trang: `bg-background`
    * Màu chữ chính: `text-foreground`
    * Màu chữ phụ/mờ: `text-muted-foreground`
    * Nền thẻ Card: `bg-card`
    * Đường viền: `border-border`
- **Sử dụng linh hoạt tiền tố `dark:` khi cần tùy chỉnh chuyên sâu**:
  - Ví dụ: `bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10`.
- **Tương thích hiệu ứng Metal / Glassmorphism**:
  - Ở Light mode: Giảm độ bóng gương, tăng độ tương phản của chữ.
  - Ở Dark mode: Tận dụng lớp nền `backdrop-blur-md` kết hợp dải màu bạc `metal-text` tạo cảm giác sang trọng, cao cấp.

### 2.4. Quy Chuẩn Thứ Tự Nút Điều Khiển (Theme & Language Toggle Order)
- **QUY TẮC BẮT BUỘC ĐỒNG BỘ 100%**:
  Trên mọi thanh điều hướng Header, thanh Action Bar, Auth layout, Onboarding layout, trang 404 (`not-found.tsx`), trang báo lỗi (`error.tsx`):
  * **Nút chỉnh Sáng/Tối (`<ThemeToggle />`) BẮT BUỘC ĐỨNG TRƯỚC (bên trái)**.
  * **Nút chuyển đổi Ngôn ngữ (`<LanguageToggle />`) BẮT BUỘC ĐỨNG SAU (bên phải)**.
  * Cấu trúc chuẩn:
    ```tsx
    {/* Theme Switcher trước, Language Switcher sau */}
    <ThemeToggle />
    <LanguageToggle />
    ```

---

## 🎯 3. Quy Chuẩn Đa Ngôn Ngữ (i18n) Cho Các Trang Độc Lập & Xác Thực
1. **Tuyệt đối KHÔNG hardcode văn bản**:
   - Các trang xác thực (`/login`, `/forgot-password`, `/reset-password`), trang 404 (`app/not-found.tsx`), trang báo lỗi hệ thống (`app/error.tsx`) phải sử dụng 100% qua `useTranslations(...)`.
2. **Tính toàn vẹn song ngữ giữa 2 bộ từ điển**:
   - Mọi key mới được định nghĩa trong `messages/vi/*.json` bắt buộc phải có key tương ứng trong `messages/en/*.json` (các namespace `auth`, `notFound`, `error` nằm trong `common.json`).
3. **Cơ chế Client Component cho Trang 404**:
   - `app/not-found.tsx` đóng vai trò bọc Server Component, bên trong render Client Component `components/common/NotFoundContent.tsx`.
   - `NotFoundContent` gọi `useTranslations("notFound")` để khi người dùng nhấn nút cờ đổi ngôn ngữ, tiêu đề, mô tả và nút bấm sẽ chuyển đổi tức thì trong 0ms mà không cần tải lại trang.
4. **Đồng bộ Server Components qua `router.refresh()`**:
   - Trong `LocaleProvider.tsx`, khi `setLocale` được kích hoạt, ngoài việc cập nhật state React và lưu cookie `NEXT_LOCALE` / `locale`, phải gọi `router.refresh()` để thông báo Next.js cập nhật các Server Components đang đọc locale từ cookie.

