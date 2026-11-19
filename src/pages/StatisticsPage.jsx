export default function StatisticsPage({ words, knownIds }) {
  const knownCount = words.filter((word) => knownIds.includes(word.id)).length;
  const topics = [...new Set(words.map((word) => word.category))].sort();
  return (
    <section>
      <h1>Thống kê</h1>
      <p className="muted">
        Tiến độ học tính trong phiên đang mở; tải lại trang sẽ bắt đầu phiên
        mới.
      </p>
      <div className="statistics-grid">
        <article>
          <strong>{words.length}</strong>
          <span>Từ trong thư viện</span>
        </article>
        <article>
          <strong>{topics.length}</strong>
          <span>Category</span>
        </article>
        <article>
          <strong>{knownCount}</strong>
          <span>Đánh dấu đã nhớ trong phiên</span>
        </article>
      </div>
      <h2>Từ vựng theo category</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Số từ</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((topic) => (
            <tr key={topic}>
              <td>{topic}</td>
              <td>{words.filter((word) => word.category === topic).length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
