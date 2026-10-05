const express = require("express");
const router = express.Router();

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GENERATE BLOG
router.post("/generate-blog", async (req, res) => {
  try {

    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({
        message: "Topic is required",
      });
    }

    const response =
      await client.chat.completions.create({
        model: "gpt-4.1-mini",

        messages: [
          {
            role: "system",
            content:
              "You are a helpful technical blog writer for students.",
          },

          {
            role: "user",
            content: `
Write a beginner-friendly technical blog on:

${topic}

Requirements:
- clear explanation
- beginner friendly
- examples
- conclusion
- use markdown formatting
`,
          },
        ],
      });

    res.json({
      content:
        response.choices[0].message.content,
    });

  } catch (err) {

    console.log("AI ERROR:", err);

    res.status(500).json({
      message: "AI generation failed",
    });
  }
});

module.exports = router;