export const WILAYAS = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار",
  "البليدة", "البويرة", "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر",
  "الجلفة", "جيجل", "سطيف", "سعيدة", "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة",
  "قسنطينة", "المدية", "مستغانم", "المسيلة", "معسكر", "ورقلة", "وهران", "البيض",
  "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", "تيسمسيلت", "الوادي",
  "خنشلة", "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنتة",
  "غرداية", "غليزان", "تميمون", "برج باجي مختار", "أولاد جلال", "بني عباس",
  "عين صالح", "عين قزام", "تقرت", "جانت", "المغير", "المنيعة"
]

export const LEVELS_BRANCHES = [
  // Primary
  { id: "p1", name: "السنة الأولى ابتدائي", category: "ابتدائي", has_branches: false },
  { id: "p2", name: "السنة الثانية ابتدائي", category: "ابتدائي", has_branches: false },
  { id: "p3", name: "السنة الثالثة ابتدائي", category: "ابتدائي", has_branches: false },
  { id: "p4", name: "السنة الرابعة ابتدائي", category: "ابتدائي", has_branches: false },
  { id: "p5", name: "السنة الخامسة ابتدائي", category: "ابتدائي", has_branches: false },
  // Middle
  { id: "m1", name: "السنة الأولى متوسط", category: "متوسط", has_branches: false },
  { id: "m2", name: "السنة الثانية متوسط", category: "متوسط", has_branches: false },
  { id: "m3", name: "السنة الثالثة متوسط", category: "متوسط", has_branches: false },
  { id: "m4", name: "السنة الرابعة متوسط", category: "متوسط", has_branches: false },
  // Secondary
  { id: "s1", name: "السنة أولى ثانوي (جذع مشترك)", category: "ثانوي", has_branches: true },
  { id: "s2", name: "السنة ثانية ثانوي", category: "ثانوي", has_branches: true },
  { id: "s3", name: "السنة ثالثة ثانوي", category: "ثانوي", has_branches: true },
]

export const BRANCHES = [
  { id: "sc", name: "علوم تجريبية", level_ids: ["s1", "s2", "s3"] },
  { id: "math", name: "رياضيات", level_ids: ["s1", "s2", "s3"] },
  { id: "tech", name: "تقني رياضي", level_ids: ["s1", "s2", "s3"] },
  { id: "eco", name: "تسيير واقتصاد", level_ids: ["s1", "s2", "s3"] },
  { id: "lit", name: "آداب وفلسفة", level_ids: ["s1", "s2", "s3"] },
  { id: "lang", name: "لغات أجنبية", level_ids: ["s1", "s2", "s3"] },
  { id: "sharia", name: "شريعة", level_ids: ["s1", "s2", "s3"] },
]

export const SUBSCRIPTION_PLANS = [
  {
    id: "انطلاقة",
    name: "انطلاقة",
    max_registrations: 50,
    max_teachers_per_subject: 1,
    has_badge: false,
    has_priority: false,
    has_advanced_stats: false,
    has_export: false,
  },
  {
    id: "نمو",
    name: "نمو",
    max_registrations: -1,
    max_teachers_per_subject: -1,
    has_badge: true,
    has_priority: false,
    has_advanced_stats: true,
    has_export: false,
  },
  {
    id: "احترافية",
    name: "احترافية",
    max_registrations: -1,
    max_teachers_per_subject: -1,
    has_badge: true,
    has_priority: true,
    has_advanced_stats: true,
    has_export: true,
  },
]
