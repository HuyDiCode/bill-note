/**
 * English translation file
 */

export const enTranslations = {
  // Common UI elements
  common: {
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    update: "Update",
    search: "Search",
    filter: "Filter",
    loading: "Loading...",
    processing: "Processing...",
    noData: "No data available",
    back: "Back",
    next: "Next",
    finish: "Finish",
    done: "Done",
    yes: "Yes",
    no: "No",
    more: "More",
    less: "Less",
  },

  // Authentication
  auth: {
    login: "Log in",
    logout: "Log out",
    register: "Register",
    forgotPassword: "Forgot password?",
    resetPassword: "Reset password",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    username: "Username",
    loginSuccess: "Logged in successfully",
    logoutSuccess: "Logged out successfully",
    registerSuccess: "Registered successfully",
  },

  // Notes/Expenses
  notes: {
    title: "Notes",
    newNote: "New Note",
    editNote: "Edit Note",
    deleteNote: "Delete Note",
    noteTitle: "Title",
    noteDetails: "Details",
    date: "Date",
    category: "Category",
    store: "Store",
    total: "Total",
    items: "Items",
    noItems: "No items",
    addItem: "Add item",
    deleteItem: "Delete item",
    itemName: "Item name",
    quantity: "Quantity",
    unitPrice: "Unit price",
    totalPrice: "Total price",
    subtotal: "Subtotal",
    tax: "Tax",
    tip: "Tip",
    shareWith: "Share with",
    collaborators: "Collaborators",
    selectCategory: "Select category",
    noteSaved: "Note saved successfully",
    noteDeleted: "Note deleted successfully",
    confirmDelete: "Are you sure you want to delete this note?",
  },

  // Receipt scanning
  receipts: {
    scanReceipt: "Scan Receipt",
    uploadImage: "Upload Image",
    takePhoto: "Take Photo",
    confirmReceipt: "Confirm Receipt Information",
    storeName: "Store Name",
    storeAddress: "Store Address",
    date: "Date",
    time: "Time",
    itemList: "Item List",
    addItem: "Add Item",
    confidence: "Confidence: {{value}}%",
    lowConfidence: "Low confidence",
    confirmAndCreate: "Confirm and Create Note",
    scanComplete: "Scan complete",
    processingImage: "Processing image...",
    uploadingImage: "Uploading image...",
    viewOriginal: "View original image",
  },

  // Settings
  settings: {
    title: "Settings",
    language: "Language",
    theme: "Theme",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    systemMode: "System",
    currency: "Currency",
    notifications: "Notifications",
    profile: "Profile",
    account: "Account",
    privacy: "Privacy",
    help: "Help",
    about: "About",
    version: "Version",
    logout: "Log out",
  },

  // Error messages
  errors: {
    // Common errors
    UNKNOWN_ERROR: "An unknown error occurred",
    NETWORK_ERROR: "Network error. Please check your connection",
    SERVER_ERROR: "Server error. Please try again later",
    CLIENT_ERROR: "Client error. Please try again",
    VALIDATION_ERROR: "Please check your input and try again",

    // Auth errors
    UNAUTHORIZED: "You need to login to use this feature",
    INVALID_CREDENTIALS: "Invalid email or password",
    SESSION_EXPIRED: "Your session has expired. Please login again",
    PERMISSION_DENIED: "You don't have permission to perform this action",
    EMAIL_NOT_VERIFIED: "Please verify your email address first",

    // Image errors
    INVALID_IMAGE: "Invalid image file",
    PROCESSING_FAILED: "Failed to process the image",
    IMAGE_TOO_LARGE: "Image is too large. Maximum size is {{size}}MB",
    UNSUPPORTED_FORMAT:
      "Unsupported image format. Please use JPG, PNG, or HEIC",
    UPLOAD_FAILED: "Failed to upload image",
    STORAGE_ERROR: "Error storing the image",

    // Gemini API errors
    API_NOT_CONFIGURED: "Gemini API is not configured",
    EXTRACTION_FAILED: "Failed to extract receipt data",
    INVALID_REQUEST: "No image found in the request",
    LOW_CONFIDENCE: "Low confidence in the extracted data",
    NO_TEXT_DETECTED: "No text detected in the image",
    NOT_A_RECEIPT: "The image does not appear to be a receipt",

    // Note errors
    NOTE_NOT_FOUND: "Note not found",
    NOTE_CREATION_FAILED: "Failed to create note",
    NOTE_UPDATE_FAILED: "Failed to update note",
    NOTE_DELETE_FAILED: "Failed to delete note",
    COLLABORATOR_ERROR: "Error with collaborator operation",
  },
};
