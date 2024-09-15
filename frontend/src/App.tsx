import { useState } from "react";
import axios from "axios";
import Dropzone from "react-dropzone";
import "./App.css";

const App = () => {
  const [file, setFile] = useState<File | null>(null);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [format, setFormat] = useState("jpg"); // Added format state

  const handleDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  };

  const processImage = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("brightness", brightness.toString());
    formData.append("contrast", contrast.toString());
    formData.append("rotation", rotation.toString());
    formData.append("format", format); // Send format to backend

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/process`, // Use environment variable for API URL
        formData,
        { responseType: "blob" }
      );
      const previewUrl = URL.createObjectURL(response.data);
      setPreview(previewUrl);
    } catch (error) {
      console.error("Error processing image", error);
    }
  };

  const downloadImage = () => {
    if (!preview) return;

    const link = document.createElement("a");
    link.href = preview;
    link.setAttribute("download", `processed_image.${format}`); // Use selected format
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="App">
      <h1>Image Processing App</h1>

      <Dropzone onDrop={handleDrop}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} className="dropzone">
            <input {...getInputProps()} />
            {file ? <p>{file.name}</p> : <p>Drop image or click to upload</p>}
          </div>
        )}
      </Dropzone>

      {preview && (
        <div>
          <h2>Image Preview</h2>
          <img src={preview} alt="preview" style={{ width: "300px" }} />
        </div>
      )}

      <div className="controls">
        <label>Brightness: {brightness}</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={brightness}
          onChange={(e) => setBrightness(parseFloat(e.target.value))}
        />

        <label>Contrast: {contrast}</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={contrast}
          onChange={(e) => setContrast(parseFloat(e.target.value))}
        />

        <label>Rotation: {rotation}</label>
        <input
          type="range"
          min="0"
          max="360"
          step="1"
          value={rotation}
          onChange={(e) => setRotation(parseFloat(e.target.value))}
        />

        <label>Format:</label>
        <select value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="jpg">JPG</option>
          <option value="png">PNG</option>
        </select>
      </div>

      <button onClick={processImage}>Process Image</button>
      <button onClick={downloadImage}>Download Processed Image</button>
    </div>
  );
};

export default App;
