import express from "express";
import multer from "multer";
import cors from "cors";
import Tesseract from "tesseract.js";
import fetch from "node-fetch";

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

    const audioResponse = await fetch(
  "https://api.elevenlabs.io/v1/text-to-speech/mGboHvCVOXWYeFL8KTR0",
  {
    method: "POST",
    headers: {
      "xi-api-key": "sk_07c0cc43e188f47e95905b365aac8d7aa77b8c07c43d81fd",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: speech,
      model_id: "eleven_multilingual_v2"
    })
  }
);

const audioBuffer = await audioResponse.arrayBuffer();
const audioBase64 = Buffer.from(audioBuffer).toString("base64");

res.json({
  results: [result],
  speech,
  audio: audioBase64
});
    });

  } catch (err) {
    res.status(500).json({ error: "Error processing" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
