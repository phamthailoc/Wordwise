export const categories = [
  "All",
  "Office",
  "Meetings",
  "Travel",
  "Purchasing",
  "Finance",
  "Human Resources",
];
export const partOfSpeechOptions = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "phrase",
];

// Translate labels only; keep the original values for API/database compatibility.
export const partOfSpeechLabels = {
  noun: "Danh từ",
  verb: "Động từ",
  adjective: "Tính từ",
  adverb: "Trạng từ",
  phrase: "Cụm từ",
};

const categoryLabels = {
  Office: "Văn phòng",
  Meetings: "Cuộc họp",
  Travel: "Du lịch",
  Purchasing: "Mua hàng",
  Finance: "Tài chính",
  "Human Resources": "Nhân sự",
  Logistics: "Hậu cần",
};

export function categoryLabel(category) {
  return categoryLabels[category] || category;
}
