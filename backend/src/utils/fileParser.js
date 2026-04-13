import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extract text from PDF buffer
 */
export const extractTextFromPDF = async (buffer) => {
    try {
        const data = await pdfParse(buffer);
        return data.text;
    } catch (error) {
        throw new Error(`PDF parsing failed: ${error.message}`);
    }
};

/**
 * Extract text from Word document buffer
 */
export const extractTextFromWord = async (buffer) => {
    try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    } catch (error) {
        throw new Error(`Word document parsing failed: ${error.message}`);
    }
};

/**
 * Extract text based on file type
 */
export const extractText = async (buffer, fileType) => {
    if (fileType === 'pdf' || fileType === 'application/pdf') {
        return extractTextFromPDF(buffer);
    } else if (
        fileType === 'word' ||
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileType === 'application/msword'
    ) {
        return extractTextFromWord(buffer);
    } else {
        throw new Error(`Unsupported file type: ${fileType}`);
    }
};
