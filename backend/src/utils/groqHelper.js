import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const MODEL = 'openai/gpt-oss-20b'; // or 'llama2-70b-4096', 'gemma-7b-it', etc

/**
 * Call Groq API with RAG context
 */
export const callGroqWithRAG = async (systemPrompt, userMessage) => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userMessage
                }
            ],
            model: MODEL,
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 0.9,
        });

        return completion.choices[0]?.message?.content || 'No response received';
    } catch (error) {
        console.error('Groq API Error:', error);
        throw new Error(`Failed to get response from Groq: ${error.message}`);
    }
};

/**
 * Transcribe voice/audio to text using Groq (if supported) or return placeholder
 * For now, we'll pass transcribed text from frontend
 */
export const processVoiceMessage = async (audioBuffer) => {
    // Note: Groq doesn't have native speech-to-text yet
    // Frontend should use Web Speech API or similar to convert audio to text
    // Backend receives the text, not audio
    return null; // Speech-to-text handled on frontend
};

/**
 * Stream response from Groq (for real-time responses)
 */
export const streamGroqResponse = async (systemPrompt, userMessage) => {
    try {
        const stream = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userMessage
                }
            ],
            model: MODEL,
            temperature: 0.7,
            max_tokens: 1024,
            stream: true,
        });

        return stream;
    } catch (error) {
        console.error('Groq Streaming Error:', error);
        throw error;
    }
};
