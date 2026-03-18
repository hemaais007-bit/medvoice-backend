import express from "express";
import multer from "multer";
import cors from "cors";
import Tesseract from "tesseract.js";

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/scan", upload.single("image"), async (req, res) => {
  try {
    const { data: { text } } = await Tesseract.recognize(
      req.file.path,
      "eng+tam"
    );

    let value = (text.match(/\d+/) || [0])[0];

    let result = {
      name: "இரத்த சர்க்கரை",
      value: value,
      range: "70 - 140",
      status: value > 140 ? "high" : "normal"
    };

    let speech = `உங்கள் ரிப்போர்ட் முடிவுகள். 
    இரத்த சர்க்கரை ${value}. 
    இது ${result.status === "high" ? "அதிகம்" : "சாதாரணம்"}.`;

    res.json({
      results: [result],
      speech
    });

  } catch (err) {
    res.status(500).json({ error: "Error processing" });
  }
});

app.listen(3000, () => console.log("Server running"));
