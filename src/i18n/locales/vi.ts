/**
 * Vietnamese translation file
 */

export const viTranslations = {
  // Common UI elements
  common: {
    cancel: "Hủy",
    confirm: "Xác nhận",
    save: "Lưu",
    delete: "Xóa",
    edit: "Chỉnh sửa",
    create: "Tạo mới",
    update: "Cập nhật",
    search: "Tìm kiếm",
    filter: "Lọc",
    loading: "Đang tải...",
    processing: "Đang xử lý...",
    noData: "Không có dữ liệu",
    back: "Quay lại",
    next: "Tiếp theo",
    finish: "Hoàn thành",
    done: "Xong",
    yes: "Có",
    no: "Không",
    more: "Xem thêm",
    less: "Thu gọn",
  },

  // Authentication
  auth: {
    login: "Đăng nhập",
    logout: "Đăng xuất",
    register: "Đăng ký",
    forgotPassword: "Quên mật khẩu?",
    resetPassword: "Đặt lại mật khẩu",
    email: "Email",
    password: "Mật khẩu",
    confirmPassword: "Xác nhận mật khẩu",
    username: "Tên đăng nhập",
    loginSuccess: "Đăng nhập thành công",
    logoutSuccess: "Đăng xuất thành công",
    registerSuccess: "Đăng ký thành công",
  },

  // Notes/Expenses
  notes: {
    title: "Ghi chú",
    newNote: "Tạo ghi chú mới",
    editNote: "Chỉnh sửa ghi chú",
    deleteNote: "Xóa ghi chú",
    noteTitle: "Tiêu đề",
    noteDetails: "Chi tiết",
    date: "Ngày",
    category: "Danh mục",
    store: "Cửa hàng",
    total: "Tổng cộng",
    items: "Các mục",
    noItems: "Không có mục nào",
    addItem: "Thêm mục",
    deleteItem: "Xóa mục",
    itemName: "Tên mục",
    quantity: "Số lượng",
    unitPrice: "Đơn giá",
    totalPrice: "Thành tiền",
    subtotal: "Tạm tính",
    tax: "Thuế",
    tip: "Tiền tip",
    shareWith: "Chia sẻ với",
    collaborators: "Người cộng tác",
    selectCategory: "Chọn danh mục",
    noteSaved: "Ghi chú đã được lưu thành công",
    noteDeleted: "Ghi chú đã được xóa thành công",
    confirmDelete: "Bạn có chắc chắn muốn xóa ghi chú này không?",
  },

  // Receipt scanning
  receipts: {
    scanReceipt: "Quét hóa đơn",
    uploadImage: "Tải ảnh hóa đơn",
    takePhoto: "Chụp ảnh",
    confirmReceipt: "Xác nhận thông tin hóa đơn",
    storeName: "Cửa hàng",
    storeAddress: "Địa chỉ",
    date: "Ngày",
    time: "Giờ",
    itemList: "Danh sách mục",
    addItem: "Thêm mục",
    confidence: "Độ tin cậy: {{value}}%",
    lowConfidence: "Độ tin cậy thấp",
    confirmAndCreate: "Xác nhận và tạo ghi chú",
    scanComplete: "Quét hoàn tất",
    processingImage: "Đang xử lý ảnh...",
    uploadingImage: "Đang tải ảnh lên...",
    viewOriginal: "Xem ảnh gốc",
  },

  // Settings
  settings: {
    title: "Cài đặt",
    language: "Ngôn ngữ",
    theme: "Giao diện",
    darkMode: "Chế độ tối",
    lightMode: "Chế độ sáng",
    systemMode: "Hệ thống",
    currency: "Tiền tệ",
    notifications: "Thông báo",
    profile: "Hồ sơ",
    account: "Tài khoản",
    privacy: "Quyền riêng tư",
    help: "Trợ giúp",
    about: "Giới thiệu",
    version: "Phiên bản",
    logout: "Đăng xuất",
  },

  // Error messages
  errors: {
    // Common errors
    UNKNOWN_ERROR: "Đã xảy ra lỗi không xác định",
    NETWORK_ERROR: "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối của bạn",
    SERVER_ERROR: "Lỗi máy chủ. Vui lòng thử lại sau",
    CLIENT_ERROR: "Lỗi ứng dụng. Vui lòng thử lại",
    VALIDATION_ERROR: "Vui lòng kiểm tra thông tin nhập liệu và thử lại",

    // Auth errors
    UNAUTHORIZED: "Bạn cần đăng nhập để sử dụng tính năng này",
    INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng",
    SESSION_EXPIRED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại",
    PERMISSION_DENIED: "Bạn không có quyền thực hiện thao tác này",
    EMAIL_NOT_VERIFIED: "Vui lòng xác minh địa chỉ email của bạn trước",

    // Image errors
    INVALID_IMAGE: "Tệp hình ảnh không hợp lệ",
    PROCESSING_FAILED: "Không thể xử lý hình ảnh",
    IMAGE_TOO_LARGE: "Kích thước ảnh quá lớn. Kích thước tối đa là {{size}}MB",
    UNSUPPORTED_FORMAT:
      "Định dạng ảnh không được hỗ trợ. Vui lòng sử dụng JPG, PNG hoặc HEIC",
    UPLOAD_FAILED: "Tải ảnh lên thất bại",
    STORAGE_ERROR: "Lỗi khi lưu trữ hình ảnh",

    // Gemini API errors
    API_NOT_CONFIGURED: "Gemini API chưa được cấu hình",
    EXTRACTION_FAILED: "Không thể trích xuất dữ liệu từ hóa đơn",
    INVALID_REQUEST: "Không tìm thấy hình ảnh trong yêu cầu",
    LOW_CONFIDENCE: "Độ tin cậy của dữ liệu trích xuất thấp",
    NO_TEXT_DETECTED: "Không phát hiện văn bản trong hình ảnh",
    NOT_A_RECEIPT: "Hình ảnh không phải là hóa đơn",

    // Note errors
    NOTE_NOT_FOUND: "Không tìm thấy ghi chú",
    NOTE_CREATION_FAILED: "Tạo ghi chú thất bại",
    NOTE_UPDATE_FAILED: "Cập nhật ghi chú thất bại",
    NOTE_DELETE_FAILED: "Xóa ghi chú thất bại",
    COLLABORATOR_ERROR: "Lỗi khi thao tác với người cộng tác",
  },
};
