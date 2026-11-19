// Only this file needs to know the API endpoint and response format.
async function readResponse(response) {
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Không thể tải dữ liệu. Vui lòng thử lại.");
  return data;
}

export async function getVocabulary(signal) {
  return readResponse(await fetch("/api/vocabulary", { signal }));
}

export async function createVocabulary(word) {
  return readResponse(
    await fetch("/api/vocabulary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(word),
    }),
  );
}

export async function updateVocabulary(id, word) {
  return readResponse(
    await fetch(`/api/vocabulary/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(word),
    }),
  );
}

export async function deleteVocabulary(id) {
  return readResponse(
    await fetch(`/api/vocabulary/${id}`, { method: "DELETE" }),
  );
}

export async function importVocabulary(words) {
  return readResponse(
    await fetch("/api/vocabulary/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ words }),
    }),
  );
}
