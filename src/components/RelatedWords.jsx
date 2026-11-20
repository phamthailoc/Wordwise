export default function RelatedWords({ relatedWords = {} }) {
  const synonyms = relatedWords.synonyms || [];
  const antonyms = relatedWords.antonyms || [];
  if (!synonyms.length && !antonyms.length) return null;

  return (
    <div className="related-words">
      {synonyms.length > 0 && (
        <div>
          <b>Đồng nghĩa</b>
          <span>{synonyms.join(", ")}</span>
        </div>
      )}
      {antonyms.length > 0 && (
        <div>
          <b>Trái nghĩa</b>
          <span>{antonyms.join(", ")}</span>
        </div>
      )}
    </div>
  );
}
