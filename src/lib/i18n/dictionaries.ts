export type Lang = "id" | "en";

const id = {
  // Landing
  landingTagline: "Kelola keuangan pribadi dan bersama keluarga dalam satu aplikasi yang mudah dipakai.",
  landingStart: "Mulai sekarang",
  landingHaveAccount: "Saya sudah punya akun",
  landingFeaturePersonal: "Keuangan pribadi",
  landingFeatureFamily: "Space keluarga",
  landingFeatureTransfer: "Transfer antar space",

  // Auth
  loginTitle: "Masuk ke akun Anda",
  loginSubmit: "Masuk",
  loginNoAccount: "Belum punya akun?",
  loginSignupLink: "Daftar",
  signupTitle: "Buat akun baru",
  signupSubmit: "Daftar",
  signupHaveAccount: "Sudah punya akun?",
  signupLoginLink: "Masuk",
  fieldName: "Nama",
  fieldEmail: "Email",
  fieldPassword: "Password",
  fieldPasswordHint: "Minimal 6 karakter",

  // Invite
  inviteTitle: "Undangan Space",
  inviteDescription: "Anda diundang untuk bergabung ke sebuah collaborative space di Finora.",
  inviteJoin: "Gabung",
  inviteSignupCta: "Daftar untuk gabung",
  inviteLoginCta: "Sudah punya akun? Masuk",
  joinWithCode: "Gabung pakai kode",
  joinWithCodeTitle: "Gabung dengan kode undangan",
  joinWithCodeDescription: "Punya kode undangan dari keluarga? Masukkan di sini untuk gabung ke space mereka.",
  fieldInviteCode: "Kode undangan",

  // App shell
  signOut: "Keluar",
  space: "Space",
  createCollabSpace: "Buat collaborative space",
  close: "Tutup",

  // New space
  newSpaceTitle: "Buat collaborative space",
  newSpaceDescription: 'Contoh: "Keluarga Badz" atau "Aku & Istri".',
  fieldSpaceName: "Nama space",
  createSpace: "Buat space",
  back: "Kembali",

  // Bottom nav
  mainNav: "Navigasi utama",
  navHome: "Beranda",
  navTransactions: "Transaksi",
  navAccounts: "Account",
  navMore: "Lainnya",
  navAddIncome: "Pemasukan",
  navAddExpense: "Pengeluaran",
  navAddTransfer: "Transfer",
  navAddClose: "Tutup menu tambah",
  navAddOpen: "Tambah transaksi",

  // Dashboard
  totalBalance: "Total saldo",
  accountsSectionTitle: "Account",
  seeAll: "Lihat semua",
  emptyAccountsTitle: "Belum ada account",
  emptyAccountsDescription: "Tambahkan account seperti bank, e-wallet, atau tunai untuk mulai mencatat.",
  addAccount: "Tambah account",
  recentTransactions: "Transaksi terbaru",
  emptyTransactionsTitle: "Belum ada transaksi",
  emptyTransactionsDescription: "Catat pemasukan atau pengeluaran pertama Anda.",

  // Accounts
  accountsTitle: "Account",
  newAccount: "Baru",
  newAccountTitle: "Account baru",
  editAccountTitle: "Edit account",
  fieldAccountName: "Nama account",
  fieldAccountType: "Jenis",
  fieldProvider: "Provider (opsional)",
  fieldAccountNumber: "Nomor rekening (opsional)",
  fieldInitialBalance: "Saldo awal",
  archiveAccount: "Arsipkan account ini",
  inactive: "nonaktif",
  accountTypeCash: "Tunai",
  accountTypeBank: "Bank",
  accountTypeEwallet: "E-wallet",
  accountTypeSaving: "Tabungan",
  accountTypeOther: "Lainnya",

  // Transactions
  transactionsTitle: "Transaksi",
  newTransaction: "Baru",
  newIncomeTitle: "Pemasukan baru",
  newExpenseTitle: "Pengeluaran baru",
  editTransactionTitle: "Edit transaksi",
  fieldType: "Jenis",
  typeExpense: "Pengeluaran",
  typeIncome: "Pemasukan",
  fieldAccount: "Account",
  fieldCategory: "Kategori (opsional)",
  fieldAmount: "Jumlah",
  fieldDate: "Tanggal",
  fieldNote: "Catatan (opsional)",
  save: "Simpan",
  deleteTransaction: "Hapus transaksi ini",
  needAccountFirst: "Buat account dulu sebelum mencatat transaksi.",

  // Transfer
  transferTitle: "Transfer",
  needAccountBeforeTransfer: "Buat account dulu sebelum transfer.",
  fieldFromAccount: "Dari account",
  fieldToAccount: "Ke account",
  sendTransfer: "Kirim transfer",
  personalSuffix: "(personal)",

  // Categories
  categoriesTitle: "Kategori",
  newCategory: "Baru",
  newCategoryTitle: "Kategori baru",
  incomeSection: "Pemasukan",
  expenseSection: "Pengeluaran",

  // More
  moreTitle: "Lainnya",
  moreSpaceSection: "Space ini",
  moreAccountSection: "Akun",
  menuCategories: "Kategori",
  menuSpaceSettings: "Pengaturan space",
  menuMembers: "Anggota",
  menuInvites: "Undangan",
  menuProfile: "Profil",
  menuAppearance: "Tampilan",
  menuLanguage: "Bahasa",

  // Space settings
  spaceSettingsTitle: "Pengaturan space",
  manageMembers: "Kelola anggota",
  manageInvites: "Kelola undangan",
  deleteSpace: "Hapus space ini",
  membersTitle: "Anggota",
  you: "(kamu)",
  removeMember: "Hapus",
  invitesTitle: "Undangan",
  newMemberRole: "Role anggota baru",
  createInviteLink: "Buat link",
  usedTimes: "dipakai",
  revoked: "dicabut",
  revoke: "Cabut",
  emptyInvitesTitle: "Belum ada undangan",
  copyLink: "Salin link",
  shareLink: "Bagikan",
  linkCopied: "Tersalin!",

  // Profile
  profileTitle: "Profil",

  // Appearance
  appearanceTitle: "Tampilan",
  appearanceDescription: "Pilih tema yang paling nyaman di mata Anda.",
  themeLight: "Terang",
  themeDark: "Gelap",
  themeSystem: "Ikuti sistem",

  // Language
  languageTitle: "Bahasa",
  languageDescription: "Pilih bahasa yang Anda inginkan untuk seluruh aplikasi.",
  languageId: "Indonesia",
  languageEn: "English",

  // Onboarding
  onboardingSkip: "Lewati",
  onboardingNext: "Lanjut",
  onboardingBack: "Kembali",
  onboardingStart: "Mulai pakai Finora",
  menuTutorial: "Lihat tutorial",
  onboarding1Title: "Selamat datang di Finora",
  onboarding1Desc: "Kelola keuangan pribadi dan bersama keluarga, semua dalam satu aplikasi. Yuk kenalan sebentar sebelum mulai.",
  onboarding2Title: "Space Personal & Family",
  onboarding2Desc: "Anda otomatis punya Space Personal sendiri. Bisa juga buat atau gabung Family Space untuk kelola keuangan bareng keluarga — pindah space lewat tombol \"Space\" di atas.",
  onboarding3Title: "Catat transaksi gampang",
  onboarding3Desc: "Tekan tombol + di tengah bawah untuk catat Pemasukan atau Pengeluaran kapan saja.",
  onboarding4Title: "Transfer antar space",
  onboarding4Desc: "Dari Family Space, Anda bisa transfer langsung ke wallet Personal anggota lain — misalnya kirim uang belanja dari kas keluarga ke dompet pribadi pasangan.",
  onboarding5Title: "Semua siap!",
  onboarding5Desc: "Sekarang Anda bisa mulai mencatat keuangan. Lupa caranya? Buka lagi tutorial ini kapan saja dari menu Lainnya → Lihat tutorial.",
};

const en: typeof id = {
  // Landing
  landingTagline: "Manage your personal and family finances in one easy-to-use app.",
  landingStart: "Get started",
  landingHaveAccount: "I already have an account",
  landingFeaturePersonal: "Personal finances",
  landingFeatureFamily: "Family space",
  landingFeatureTransfer: "Cross-space transfers",

  // Auth
  loginTitle: "Sign in to your account",
  loginSubmit: "Sign in",
  loginNoAccount: "Don't have an account?",
  loginSignupLink: "Sign up",
  signupTitle: "Create a new account",
  signupSubmit: "Sign up",
  signupHaveAccount: "Already have an account?",
  signupLoginLink: "Sign in",
  fieldName: "Name",
  fieldEmail: "Email",
  fieldPassword: "Password",
  fieldPasswordHint: "At least 6 characters",

  // Invite
  inviteTitle: "Space Invitation",
  inviteDescription: "You've been invited to join a collaborative space on Finora.",
  inviteJoin: "Join",
  inviteSignupCta: "Sign up to join",
  inviteLoginCta: "Already have an account? Sign in",
  joinWithCode: "Join with a code",
  joinWithCodeTitle: "Join with an invite code",
  joinWithCodeDescription: "Got an invite code from family? Enter it here to join their space.",
  fieldInviteCode: "Invite code",

  // App shell
  signOut: "Sign out",
  space: "Space",
  createCollabSpace: "Create collaborative space",
  close: "Close",

  // New space
  newSpaceTitle: "Create collaborative space",
  newSpaceDescription: 'For example: "The Smith Family" or "Me & My Spouse".',
  fieldSpaceName: "Space name",
  createSpace: "Create space",
  back: "Back",

  // Bottom nav
  mainNav: "Main navigation",
  navHome: "Home",
  navTransactions: "Transactions",
  navAccounts: "Accounts",
  navMore: "More",
  navAddIncome: "Income",
  navAddExpense: "Expense",
  navAddTransfer: "Transfer",
  navAddClose: "Close add menu",
  navAddOpen: "Add transaction",

  // Dashboard
  totalBalance: "Total balance",
  accountsSectionTitle: "Accounts",
  seeAll: "See all",
  emptyAccountsTitle: "No accounts yet",
  emptyAccountsDescription: "Add an account like a bank, e-wallet, or cash to start tracking.",
  addAccount: "Add account",
  recentTransactions: "Recent transactions",
  emptyTransactionsTitle: "No transactions yet",
  emptyTransactionsDescription: "Record your first income or expense.",

  // Accounts
  accountsTitle: "Accounts",
  newAccount: "New",
  newAccountTitle: "New account",
  editAccountTitle: "Edit account",
  fieldAccountName: "Account name",
  fieldAccountType: "Type",
  fieldProvider: "Provider (optional)",
  fieldAccountNumber: "Account number (optional)",
  fieldInitialBalance: "Initial balance",
  archiveAccount: "Archive this account",
  inactive: "inactive",
  accountTypeCash: "Cash",
  accountTypeBank: "Bank",
  accountTypeEwallet: "E-wallet",
  accountTypeSaving: "Savings",
  accountTypeOther: "Other",

  // Transactions
  transactionsTitle: "Transactions",
  newTransaction: "New",
  newIncomeTitle: "New income",
  newExpenseTitle: "New expense",
  editTransactionTitle: "Edit transaction",
  fieldType: "Type",
  typeExpense: "Expense",
  typeIncome: "Income",
  fieldAccount: "Account",
  fieldCategory: "Category (optional)",
  fieldAmount: "Amount",
  fieldDate: "Date",
  fieldNote: "Note (optional)",
  save: "Save",
  deleteTransaction: "Delete this transaction",
  needAccountFirst: "Create an account first before recording a transaction.",

  // Transfer
  transferTitle: "Transfer",
  needAccountBeforeTransfer: "Create an account first before transferring.",
  fieldFromAccount: "From account",
  fieldToAccount: "To account",
  sendTransfer: "Send transfer",
  personalSuffix: "(personal)",

  // Categories
  categoriesTitle: "Categories",
  newCategory: "New",
  newCategoryTitle: "New category",
  incomeSection: "Income",
  expenseSection: "Expense",

  // More
  moreTitle: "More",
  moreSpaceSection: "This space",
  moreAccountSection: "Account",
  menuCategories: "Categories",
  menuSpaceSettings: "Space settings",
  menuMembers: "Members",
  menuInvites: "Invites",
  menuProfile: "Profile",
  menuAppearance: "Appearance",
  menuLanguage: "Language",

  // Space settings
  spaceSettingsTitle: "Space settings",
  manageMembers: "Manage members",
  manageInvites: "Manage invites",
  deleteSpace: "Delete this space",
  membersTitle: "Members",
  you: "(you)",
  removeMember: "Remove",
  invitesTitle: "Invites",
  newMemberRole: "New member role",
  createInviteLink: "Create link",
  usedTimes: "used",
  revoked: "revoked",
  revoke: "Revoke",
  emptyInvitesTitle: "No invites yet",
  copyLink: "Copy link",
  shareLink: "Share",
  linkCopied: "Copied!",

  // Profile
  profileTitle: "Profile",

  // Appearance
  appearanceTitle: "Appearance",
  appearanceDescription: "Choose the theme that's most comfortable for your eyes.",
  themeLight: "Light",
  themeDark: "Dark",
  themeSystem: "System",

  // Language
  languageTitle: "Language",
  languageDescription: "Choose your preferred language for the whole app.",
  languageId: "Indonesia",
  languageEn: "English",

  // Onboarding
  onboardingSkip: "Skip",
  onboardingNext: "Next",
  onboardingBack: "Back",
  onboardingStart: "Start using Finora",
  menuTutorial: "View tutorial",
  onboarding1Title: "Welcome to Finora",
  onboarding1Desc: "Manage your personal and family finances, all in one app. Let's take a quick look before you start.",
  onboarding2Title: "Personal & Family Spaces",
  onboarding2Desc: "You automatically get your own Personal Space. You can also create or join a Family Space to manage money together — switch spaces with the \"Space\" button up top.",
  onboarding3Title: "Recording transactions is easy",
  onboarding3Desc: "Tap the + button at the bottom center to record an Income or Expense anytime.",
  onboarding4Title: "Transfer between spaces",
  onboarding4Desc: "From a Family Space, you can transfer directly to another member's Personal wallet — for example sending grocery money from the family fund to your partner's personal wallet.",
  onboarding5Title: "You're all set!",
  onboarding5Desc: "You can now start tracking your finances. Forgot how something works? Reopen this tutorial anytime from More → View tutorial.",
};

export const dictionaries = { id, en };
export type Dictionary = typeof id;
