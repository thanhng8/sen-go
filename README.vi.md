# SEN · GO

[Tiếng Việt](README.vi.md) · [English](README.md)

Một game cờ vây 2D góc nhìn từ trên xuống, dựng bằng HTML, Three.js và JavaScript. Game hỗ trợ máy cục bộ chạy trong trình duyệt hoặc AI trực tuyến thông qua API.

## Giới thiệu

**SEN · GO** là game cờ vây chạy trực tiếp trong trình duyệt với giao diện Three.js. Bạn có thể chơi hoàn toàn cục bộ với thuật toán có sẵn hoặc sử dụng model AI qua API. Engine cục bộ luôn chịu trách nhiệm kiểm tra luật, tính hợp lệ của nước đi và kết quả ván đấu.

## Tính năng

- Ba kích thước bàn: **9×9**, **13×13** và **19×19**.
- Chọn chơi quân Đen hoặc Trắng.
- Hai loại đối thủ:
  - **Máy cục bộ:** không cần mạng hoặc API key, gồm ba cấp Dễ, Vừa và Khó.
  - **AI qua API:** sử dụng model do người chơi tự nhập.
- Hỗ trợ sáu gateway AI: OpenAI, Claude, Grok, Gemini, OpenRouter và Ollama Cloud.
- Ba bộ luật:
  - Luật Nhật Bản — tính điểm lãnh thổ, Komi 6.5.
  - Luật Trung Quốc — tính điểm diện tích, Komi 7.5.
  - Luật New Zealand — tính điểm diện tích, Komi 7.0 và cho phép tự sát.
- Kiểm tra bắt quân, tự sát, Ko đơn và siêu Ko bằng engine cục bộ.
- Hoàn tác, bỏ lượt, đầu hàng và tính điểm.
- Bốn theme, bốn kiểu bàn và bốn bộ quân.
- Tùy chỉnh font, cỡ chữ **16–26px** và màu chữ.
- Lưu cấu hình bằng `localStorage`.
- Hỗ trợ 15 ngôn ngữ: Việt, Anh, Trung giản thể, Nhật, Hàn, Tây Ban Nha, Pháp, Đức, Bồ Đào Nha, Nga, Ả Rập, Hindi, Indonesia, Thái và Thổ Nhĩ Kỳ.
- Hỗ trợ bố cục RTL cho tiếng Ả Rập.
- Giao diện responsive cho máy tính và thiết bị di động.

## Yêu cầu

- Node.js và npm.
- Một trình duyệt hiện đại hỗ trợ ES modules và WebGL.
- Chế độ máy cục bộ không cần kết nối Internet sau khi dự án đã được cài đặt.
- Chế độ AI cần kết nối Internet, API key hợp lệ và tài khoản còn hạn mức ở gateway tương ứng.

## Cài đặt và chạy

```bash
git clone https://github.com/thanhng8/sen-go.git
cd sen-go
npm install
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal, thường là:

```text
http://localhost:5173
```

Không nên mở trực tiếp `index.html` bằng `file://` vì dự án sử dụng ES modules.

## Cách chơi với máy cục bộ

1. Chọn kích thước bàn.
2. Trong phần **Đối thủ**, chọn **Máy cục bộ**.
3. Chọn quân Đen hoặc Trắng.
4. Chọn độ khó Dễ, Vừa hoặc Khó.
5. Chọn luật chơi.
6. Nhấn **Bắt đầu ván đấu**.

Toàn bộ việc chọn nước của máy và kiểm tra luật diễn ra trong trình duyệt, không gửi dữ liệu ra ngoài.

## Cách cấu hình và chơi với AI API

### 1. Nhập cấu hình AI

Mở **Settings / Cài đặt**, sau đó tìm phần **AI qua API**:

1. Chọn gateway.
2. Nhập chính xác tên model. Đây là trường tự do, game không giới hạn model vào một danh sách cố định.
3. Nhập API key của gateway đã chọn.
4. Đóng Settings. Provider, API key và tên model được tự động lưu trên trình duyệt này.

Ví dụ định dạng tên model thường gặp:

| Gateway | Ví dụ định dạng model |
|---|---|
| OpenAI | `gpt-...` |
| Claude | `claude-...` |
| Grok | `grok-...` |
| Gemini | `gemini-...` |
| OpenRouter | `provider/model-name` |
| Ollama Cloud | `model-name:cloud` |

Tên model thực tế phụ thuộc tài khoản và có thể thay đổi theo thời gian. Hãy lấy tên chính xác từ trang quản lý hoặc tài liệu của gateway.

### 2. Bắt đầu ván AI

1. Quay lại màn hình thiết lập.
2. Trong phần **Đối thủ**, chọn **AI qua API**.
3. Kiểm tra gateway và model hiển thị bên dưới.
4. Chọn bàn, màu quân và luật.
5. Nhấn **Bắt đầu ván đấu**.

Nếu thiếu API key hoặc tên model, game sẽ mở Settings và yêu cầu hoàn tất cấu hình trước.

### 3. Cơ chế lượt AI

Ở mỗi lượt AI, game gửi các thông tin sau tới gateway:

- Tên game cờ vây và kích thước bàn.
- Màu quân của AI.
- Bộ luật, cách tính điểm, Komi, luật Ko và quy tắc tự sát.
- Trạng thái bàn hiện tại.
- Số quân đã bắt, số lượt bỏ qua và lịch sử gần nhất.
- Danh sách các nước đi hợp lệ do engine cục bộ tạo ra.

AI phải chọn một nước trong danh sách hợp lệ hoặc bỏ lượt. Phản hồi được kiểm tra lại bằng `go-engine.js` trước khi đặt quân. Nếu API lỗi, hết thời gian hoặc trả nước không hợp lệ, máy cục bộ sẽ đi thay ở lượt đó để ván đấu không bị kẹt.

## Lưu ý về API key

API key và tên model được lưu trong `localStorage` với khóa:

```text
sen-go.preferences.v1
```

Điều này phù hợp khi chạy game trên máy tính cá nhân, nhưng cần lưu ý:

- Dữ liệu trong `localStorage` không được mã hóa.
- Không sử dụng API key quan trọng trên máy tính dùng chung.
- Không ghi API key trực tiếp vào source code hoặc commit lên GitHub.
- Có thể xóa key bằng nút **Khôi phục mặc định** trong Settings hoặc xóa dữ liệu trang web của trình duyệt.
- Mỗi lượt AI có thể tạo một request và phát sinh chi phí theo chính sách của gateway.
- Một số gateway hoặc môi trường trình duyệt có thể chặn request trực tiếp do CORS.

## Điều khiển

| Thao tác | Điều khiển |
|---|---|
| Đặt quân | Nhấp vào một giao điểm hợp lệ |
| Bỏ lượt | Nút **Bỏ lượt** hoặc phím `P` |
| Hoàn tác | Nút **Hoàn tác** hoặc phím `U` |
| Tính điểm | Nút **Tính điểm** |
| Đầu hàng | Nút **Đầu hàng** |
| Quay lại thiết lập | Nút SEN hoặc phím `Escape` |

## Cài đặt giao diện

Settings cho phép thay đổi trực tiếp:

- Ngôn ngữ.
- Theme giao diện.
- Nền bàn cờ.
- Bộ quân cờ.
- Font chữ.
- Cỡ chữ từ 16px đến 26px, mặc định 20px.
- Màu chữ chính.
- Gateway AI, API key và tên model.

Các thay đổi được áp dụng ngay và lưu trên trình duyệt.

## Lệnh phát triển

Chạy môi trường phát triển:

```bash
npm run dev
```

Build bản production:

```bash
npm run build
```

Kết quả build nằm trong thư mục `dist/`.

Kiểm tra lỗ hổng dependency:

```bash
npm audit --audit-level=moderate
```

## Cấu trúc dự án

```text
covay/
├── index.html                  # Giao diện setup, game và Settings
├── src/
│   ├── main.js                 # Điều phối UI và vòng đời ván đấu
│   ├── go-engine.js            # Luật, nước đi, bắt quân và tính điểm
│   ├── computer-player.js      # Máy cục bộ Dễ/Vừa/Khó
│   ├── ai-player.js            # Adapter cho sáu gateway AI
│   ├── board-view.js           # Bàn cờ Three.js
│   ├── preferences.js          # Chuẩn hóa và lưu Settings
│   ├── i18n.js                 # Bản địa hóa 15 ngôn ngữ
│   ├── rules-guide.js          # Nội dung hướng dẫn luật
│   └── styles.css              # Theme và responsive UI
└── package.json
```

## Xử lý sự cố AI

- **401/403:** API key không đúng, hết hiệu lực hoặc không có quyền dùng model.
- **429:** tài khoản hết hạn mức hoặc gateway đang giới hạn request.
- **Không tìm thấy model:** kiểm tra lại tên model, bao gồm cả tiền tố nhà cung cấp nếu gateway yêu cầu.
- **Timeout:** thử model nhanh hơn hoặc kiểm tra kết nối mạng.
- **Lỗi CORS/network:** gateway có thể không cho gọi trực tiếp từ trình duyệt. Khi đó cần dùng gateway khác hoặc bổ sung một local proxy.
- **AI trả nước không hợp lệ:** engine sẽ từ chối phản hồi và dùng máy cục bộ cho lượt đó.

## Giới hạn hiện tại

- Model ngôn ngữ tổng quát không phải engine cờ vây chuyên dụng, vì vậy sức chơi phụ thuộc model.
- Game chưa tự xác định nhóm chết khi kết thúc. Hãy bắt các nhóm chết khỏi bàn trước khi tính điểm.
- Chế độ AI trực tuyến phụ thuộc khả năng hoạt động, hạn mức và chính sách CORS của gateway.

## Giấy phép

Dự án được phát hành theo [Apache License 2.0](LICENSE).
