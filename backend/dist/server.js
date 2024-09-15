"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 3000 || process.env.PORT;
app.use((0, cors_1.default)());
// Setup multer for file uploads
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
// Upload endpoint (Optional if you only use /process)
app.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded");
    }
    // Save the uploaded file temporarily
    const tempPath = path_1.default.join(__dirname, "uploads", req.file.originalname);
    fs_1.default.writeFileSync(tempPath, req.file.buffer);
    res.json({ filePath: tempPath });
});
app.post("/process", upload.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { brightness = 1, contrast = 1, rotation = 0, format = "jpg", } = req.body;
    try {
        // Convert to desired format
        const imageFormat = format === "png" ? "png" : "jpeg";
        const processedImage = yield (0, sharp_1.default)((_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer)
            .modulate({ brightness: parseFloat(brightness) })
            .linear(parseFloat(contrast), 0) // Adjust contrast
            .rotate(parseInt(rotation))
            .toFormat(imageFormat) // Convert to the selected format
            .toBuffer();
        res.type(imageFormat).send(processedImage);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error processing image");
    }
}));
app.get("/download", (req, res) => {
    const filePath = req.query.path;
    if (fs_1.default.existsSync(filePath)) {
        res.download(filePath);
    }
    else {
        res.status(404).send("File not found");
    }
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
