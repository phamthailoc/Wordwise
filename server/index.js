import "dotenv/config";
import express from "express";
import cors from "cors";
import vocabularyRoutes from "./routes/vocabularyRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.get("/api/health", (_request, response) => response.json({ status: "ok" }));
app.use("/api/vocabulary", vocabularyRoutes);
app.use((error, _request, response, _next) => {
  if (error.type === "entity.too.large") {
    return response
      .status(413)
      .json({ message: "Dữ liệu quá lớn. Mỗi lượt tối đa 100 từ và 1 MB." });
  }
  if (error.type === "entity.parse.failed") {
    return response.status(400).json({ message: "Dữ liệu JSON không hợp lệ." });
  }
  console.error(error);
  response.status(500).json({ message: "Đã có lỗi xảy ra. Vui lòng thử lại." });
});

app.listen(port, () =>
  console.log(`API đang chạy tại http://localhost:${port}`),
);
