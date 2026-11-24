# video-factory — Kho video A–Z trên GitHub Actions


Kho chứa bộ thư viện làm video bằng code (theo danh sách 20 repo của @phocapaivn),
đóng gói để chạy trên GitHub Actions bất cứ lúc nào: bấm chạy workflow là máy GitHub
tự cài cả bộ, dựng video, trả file MP4. Không cài chết ở máy nào cả.


## Bộ stack (package.json)


- **Dựng video:** Remotion (+ @remotion/cli), React 19
- **Chuyển động:** GSAP, Anime.js, Motion
- **Thiết kế/tài sản:** Satori (HTML/CSS → ảnh), SVGO (dọn SVG)
- **Animation vector/tương tác:** Rive (@rive-app/react-canvas), dotLottie
- **3D:** Three.js, React Three Fiber, Drei, React Three Rapier (vật lý), React Postprocessing
- **Âm thanh/media:** Howler.js, MediaBunny
- **Chặng cuối:** FFmpeg (workflow tự cài bằng apt trước bước kiểm tra)


## Cách dùng


1. Vào tab **Actions** → workflow **render-demo** → **Run workflow**.
2. Chờ job xong (cài stack + render), tải video ở mục **Artifacts** (`demo-video`).


Video mẫu: `src/Demo.tsx` — khổ dọc 720×1280, 5 giây, 30fps.
Thêm mẫu mới: tạo component trong `src/`, đăng ký Composition trong `src/Root.tsx`.


## Lưu ý


- Máy GitHub không có GPU: video 2D/chuyển động render tốt; cảnh 3D nặng sẽ chậm hơn.
- Trần 1 job: 6 giờ (đặt timeout 60 phút cho bản mẫu). Trần job song song gói Free: 20.

