# Quy Tắc Kiến Trúc Frontend (Frontend Architecture Rules)

Áp dụng cho toàn bộ mã nguồn `NexCampus-FE/`.

---

## 1. Ranh giới phân tầng chuẩn (Layer Boundaries)

Mọi luồng dữ liệu tương tác API phải tuân thủ nghiêm ngặt mô hình 4 tầng:

```text
Component / Page
       │
       ▼
Domain Hook (hooks/)
       │
       ▼
API Service (services/)
       │
       ▼
Axios Client (lib/axios.ts)
```

### Chi tiết trách nhiệm từng tầng:
1. **Component / Page (`app/`, `components/`)**:
   - Chỉ đảm nhiệm việc hiển thị giao diện (UI), điều hướng người dùng và thu thập input.
   - **TUYỆT ĐỐI KHÔNG** import `axios` hoặc gọi trực tiếp API trong Component.
   - Sử dụng custom hook để lấy dữ liệu hoặc kích hoạt thao tác mutation.

2. **Domain Hook (`hooks/`)**:
   - Quản lý Server State thông qua **TanStack React Query** (`useQuery`, `useMutation`).
   - Xử lý cache, loading state, error state và side-effects sau khi mutation (hiển thị toast, chuyển trang, invalidate query).
   - Cung cấp dữ liệu đã được làm sạch cho Component.

3. **API Service (`services/`)**:
   - Chịu trách nhiệm cấu hình endpoint URL, HTTP method và định dạng payload/response.
   - Sử dụng instance `api` từ `lib/axios.ts`.
   - Trả về Promise chứa dữ liệu đã được định kiểu rõ ràng (`types/`).

4. **Axios Client (`lib/axios.ts`)**:
   - Quản lý baseURL, headers mặc định, tự động đính kèm Access Token in-memory.
   - Xử lý refresh token tập trung khi gặp lỗi `401 Unauthorized`.

---

## 2. Quy ước TanStack React Query

- **Cấu trúc Query Key nhất quán**:
  - Dùng mảng phân cấp theo domain và tham số:
    ```typescript
    // Ví dụ chuẩn
    ['tasks', 'list', queryParams]
    ['tasks', 'detail', taskId]
    ['weekly-evaluations', 'intern', internId]
    ```
- **Tự động Invalidate Cache khi Mutate thành công**:
  - Khi tạo/sửa/xóa một thực thể, trong `onSuccess` của `useMutation` BẮT BUỘC invalidate query key tương ứng để đồng bộ dữ liệu giao diện:
    ```typescript
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'list'] });
      toast.success('Thao tác thành công');
    }
    ```
- **Xử lý Optimistic Updates**: Chỉ áp dụng cho các thao tác nhỏ (như đánh dấu đã đọc thông báo) để tăng độ mượt mà.
