const axios = require('axios');
const logger = require('../utils/logger');


async function callLLM(question, hits) {
    // Build context
    const context = (hits || []).map(h => `- ${h.id || ''}: ${h.text || JSON.stringify(h)}`).join('\n');
    const prompt = `Answer using ONLY the context below. If not present, say you don't know.\n\nContext:\n${context}\n\nQuestion: ${question}`;


    // If using Gemini, call its REST endpoint here. This is a placeholder that returns a canned answer.
    // Replace with real API call and auth headers.
    logger.info('Calling LLM with prompt of length ' + prompt.length);
    // TODO: implement real Gemini API call
    return `<<LLM answer placeholder>>\n(You should replace callLLM with real API call to Gemini or other LLM)`;
}


async function callLLMStream(question, hits, onToken) {
    // Placeholder streaming implementation: split placeholder into tokens and call onToken
    const answer = await callLLM(question, hits);
    const tokens = answer.split(/\s+/);
    for (const t of tokens) {
        await new Promise(r => setTimeout(r, 30));
        onToken(t + ' ');
    }
}


module.exports = { callLLM, callLLMStream };