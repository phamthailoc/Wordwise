export default function ExampleSentences({
  examples = [],
  className = "example-box",
}) {
  if (!examples.length) return null;
  return (
    <div className={className}>
      <span>Ví dụ</span>
      <ul className="example-sentences">
        {examples.map((sentence, index) => (
          <li key={index}>{sentence}</li>
        ))}
      </ul>
    </div>
  );
}
