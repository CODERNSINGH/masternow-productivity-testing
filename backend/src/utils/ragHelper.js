/**
 * Split text into chunks with overlap for better context
 */
export const chunkText = (text, chunkSize = 500, overlapSize = 100) => {
    const chunks = [];
    let index = 0;

    while (index < text.length) {
        const end = Math.min(index + chunkSize, text.length);
        const chunk = text.substring(index, end).trim();
        
        if (chunk.length > 0) {
            chunks.push(chunk);
        }
        
        index += chunkSize - overlapSize;
    }

    return chunks;
};

/**
 * Calculate simple similarity score between two strings (term overlap)
 * Used for basic semantic retrieval without ML
 */
const calculateSimilarity = (query, text) => {
    const queryTokens = query.toLowerCase().split(/\W+/).filter(t => t && t.length > 2);
    const textTokens = text.toLowerCase().split(/\W+/).filter(t => t && t.length > 2);
    
    const querySet = new Set(queryTokens);
    const matches = textTokens.filter(token => querySet.has(token)).length;
    
    return matches / (queryTokens.length || 1);
};

/**
 * Retrieve most relevant chunks from document chunks
 */
export const retrieveRelevantChunks = (query, chunks, topK = 3) => {
    const scored = chunks.map((chunk, idx) => ({
        index: idx,
        content: chunk,
        score: calculateSimilarity(query, chunk)
    }));

    // Sort by score and get top K
    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(item => item.content);
};

/**
 * Prepare context from relevant chunks for LLM
 */
export const prepareContext = (chunks) => {
    if (!chunks || chunks.length === 0) {
        return "No relevant documents found.";
    }
    return chunks.map((chunk, idx) => `[Document Chunk ${idx + 1}]\n${chunk}`).join("\n\n");
};

/**
 * Create a RAG prompt combining user query with document context
 */
export const createRAGPrompt = (userQuery, documentContext, includeOwnKnowledge = true) => {
    let systemPrompt = `You are a helpful AI assistant with access to uploaded documents.
Use the following document excerpts to answer the user's question accurately and concisely.
If the answer is not in the documents, use your own knowledge to help, but always indicate when you're using outside knowledge.

## IMPORTANT FORMATTING INSTRUCTIONS:
- Use markdown formatting for all responses
- Use **bold** for important terms and concepts
- Use # for headings, ## for subheadings, ### for sub-subheadings
- Use bullet points (- or •) for lists
- Use numbered lists (1. 2. 3.) for sequential steps
- Use tables (| Column 1 | Column 2 |) for structured data comparisons
- Use \`code\` for technical terms or file names
- Use > for blockquotes or important callouts
- Organize complex information hierarchically with clear structure
- Add blank lines between sections for readability
- Keep paragraphs short and scannable

Document Context:
${documentContext}

---

`;

    if (!includeOwnKnowledge) {
        systemPrompt = `You are a helpful AI assistant. Use ONLY the following document excerpts to answer questions.
If the answer is not in the documents, say "I cannot find this information in the uploaded documents."

## IMPORTANT FORMATTING INSTRUCTIONS:
- Use markdown formatting for all responses
- Use **bold** for important terms and concepts
- Use # for headings, ## for subheadings, ### for sub-subheadings
- Use bullet points (- or •) for lists
- Use numbered lists (1. 2. 3.) for sequential steps
- Use tables (| Column 1 | Column 2 |) for structured data comparisons
- Use \`code\` for technical terms or file names
- Use > for blockquotes or important callouts
- Organize complex information hierarchically with clear structure
- Add blank lines between sections for readability
- Keep paragraphs short and scannable

Document Context:
${documentContext}

---

`;
    }

    return {
        system: systemPrompt,
        userMessage: userQuery
    };
};
