export default function RelatedWords({ relatedWords = {} }) {
  const synonyms = relatedWords.synonyms || [];
  const antonyms = relatedWords.antonyms || [];
  if (!synonyms.length && !antonyms.length) return null;

  return (
    <div className="related-words">
      {synonyms.length > 0 && (
        <div>
          <b>Synonyms</b>
          <span>{synonyms.join(", ")}</span>
        </div>
      )}
      {antonyms.length > 0 && (
        <div>
          <b>Antonyms</b>
          <span>{antonyms.join(", ")}</span>
        </div>
      )}
    </div>
  );
}
