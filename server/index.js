import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import vocabularyRoutes from './routes/vocabularyRoutes.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
app.use('/api/vocabulary', vocabularyRoutes);
app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
});

app.listen(port, () => console.log(`API đang chạy tại http://localhost:${port}`));
