const axios = require('axios');
const logger = require('../utils/logger');
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function buildContext(hits = []) {
  return hits
    .map(h => `- (${h.score.toFixed(4)}) ${h.text}`)
    .join('\n');
}
async function callLLM(question, hits) {
  const context = buildContext(hits);

  const prompt = `
        You are a news answering assistant.

        Use ONLY the context below; Answer questions using the provided documents. If the information is not available, respond politely without hallucinating. For example, “I don’t have that information in the documents I can access, but I can help answer questions about the news articles and mention categories.

        Context:
        ${context}

        Question: ${question}
        `.trim();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful news assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error("OpenAI API call failed", err);
    throw err;
  }
}

async function callLLMStream(question, hits, onToken) {
  const full = await callLLM(question, hits);

  for (const char of full) {
    await new Promise(r => setTimeout(r, 15));
    onToken(char);
  }

  return full;
}


module.exports = { callLLM, callLLMStream };
