const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 8080;

// Simple CORS configuration - FIX LỖI
app.use(
  cors({
    origin: true, // Thay đổi từ "*" thành true
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    credentials: false,
    optionsSuccessStatus: 200,
  })
);

// Manual CORS headers as fallback
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }

  next();
});

// Middleware để log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve PDF.js worker files
app.use(
  "/pdfjs",
  express.static(path.join(__dirname, "../public/pdfjs"), {
    setHeaders: (res, filePath) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );

      if (filePath.endsWith(".mjs") || filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
      res.setHeader("Cache-Control", "public, max-age=31536000");
    },
  })
);

// Serve static files từ thư mục 'public/files'
app.use(
  "/files",
  express.static(path.join(__dirname, "public/files"), {
    setHeaders: (res, filePath) => {
      // Add CORS headers
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control"
      );

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
    viewer: "PDF.js + PDFTron WebViewer",
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
  console.log(`📁 File Server is running on http://192.168.100.116:${PORT}`);
  console.log(
    `🔗 Files can be accessed at: http://192.168.100.116:${PORT}/files/`
  );
  console.log(`📊 WebViewer lib: http://192.168.100.116:${PORT}/webviewer/`);
  console.log(`🔧 PDF.js worker: http://192.168.100.116:${PORT}/pdfjs/`);
  console.log(`📋 File list: http://192.168.100.116:${PORT}/api/files`);
  console.log(`✅ CORS configured for PDF.js compatibility`);
});
