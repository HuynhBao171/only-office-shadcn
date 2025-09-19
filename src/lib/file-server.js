const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 8080;

// Enable CORS cho tất cả routes
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware để log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files từ thư mục 'public/files'
app.use(
  "/files",
  express.static(path.join(__dirname, "public/files"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".xlsx") || filePath.endsWith(".xls")) {
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
      } else if (filePath.endsWith(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
      } else if (filePath.endsWith(".docx") || filePath.endsWith(".doc")) {
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
      } else if (filePath.endsWith(".pptx") || filePath.endsWith(".ppt")) {
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        );
      }
      res.setHeader("Cache-Control", "no-cache");
    },
  })
);

// Serve PDFTron WebViewer files
app.use("/webviewer", express.static(path.join(__dirname, "public/webviewer")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    viewer: "PDFTron WebViewer",
  });
});

// List files endpoint
app.get("/api/files", (req, res) => {
  const fs = require("fs");
  const filesDir = path.join(__dirname, "public/files");

  try {
    const files = fs.readdirSync(filesDir);
    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: "Cannot read files directory" });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "File not found" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `📁 PDFTron File Server is running on http://192.168.100.116:${PORT}`
  );
  console.log(
    `🔗 Files can be accessed at: http://192.168.100.116:${PORT}/files/`
  );
  console.log(`📊 WebViewer lib: http://192.168.100.116:${PORT}/webviewer/`);
  console.log(`📋 File list: http://192.168.100.116:${PORT}/api/files`);
});
