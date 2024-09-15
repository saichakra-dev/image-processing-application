import express from "express";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import cors from "cors";

const app = express();
const PORT = 3000 || process.env.PORT;

app.use(cors());

// Setup multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload endpoint (Optional if you only use /process)
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  // Save the uploaded file temporarily
  const tempPath = path.join(__dirname, "uploads", req.file.originalname);
  fs.writeFileSync(tempPath, req.file.buffer);

  res.json({ filePath: tempPath });
});

app.post("/process", upload.single("image"), async (req, res) => {
  const {
    brightness = 1,
    contrast = 1,
    rotation = 0,
    format = "jpg",
  } = req.body;

  try {
    // Convert to desired format
    const imageFormat = format === "png" ? "png" : "jpeg";
    const processedImage = await sharp(req.file?.buffer)
      .modulate({ brightness: parseFloat(brightness) })
      .linear(parseFloat(contrast), 0) // Adjust contrast
      .rotate(parseInt(rotation))
      .toFormat(imageFormat) // Convert to the selected format
      .toBuffer();

    res.type(imageFormat).send(processedImage);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing image");
  }
});

app.get("/download", (req, res) => {
  const filePath = req.query.path as string;

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send("File not found");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
