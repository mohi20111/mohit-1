
import { GoogleGenAI, Type } from "@google/genai";
import { Question, HistoryEra } from "../types";

// Always use new GoogleGenAI({ apiKey: process.env.API_KEY })
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchQuestionsByQuery = async (query: string, era?: string, category?: string, difficulty?: string, questionType?: string): Promise<Question[]> => {
  // Use gemini-3-pro-preview for complex reasoning and specific factual generation tasks
  const model = 'gemini-3-pro-preview';
  
  // Specific instruction detection
  const isUPSC = query.toLowerCase().includes('upsc') || category?.toLowerCase().includes('upsc');
  const isRPSC = query.toLowerCase().includes('rpsc') || query.toLowerCase().includes('rajasthan') || category?.toLowerCase().includes('raj-ap') || category?.toLowerCase().includes('rajasthan');

  const prompt = `Act as Mohit Awasthi, Assistant Professor at CSJMU Kanpur and a renowned History expert. 
  Your goal is to provide 5 premium, authentic History MCQ questions strictly from the following archives:
  ${isRPSC ? 'RPSC Rajasthan Assistant Professor (History), RPSC Lecturer, and Rajasthan SET exams.' : 
    isUPSC ? 'UPSC History Optional Preliminary (Pre-2008) papers.' : 
    'UPSC Optional (Pre-2008), UPPSC Mains (Pre-2017), UGC NET, and RPSC/MPPSC Assistant Professor exams.'}

  CRITICAL: 
  - Ensure the Hindi is academic and grammatically perfect (प्रमाणिक हिन्दी).
  - For Rajasthan (RPSC) questions, include specific regional history if applicable (e.g., Mewar, Marwar, Rajasthan's role in 1857, etc.) as they appear in Assistant Professor exams.
  - Explanations must be at a research level, citing historians like G.N. Sharma or standard references.
  - Options must be precisely as they appeared in those official commission papers.

  Current Request Detail: ${query || 'Miscellaneous History Questions'}
  Target Exam Focus: ${isRPSC ? 'RPSC / Rajasthan Assistant Professor' : isUPSC ? 'UPSC History Optional PRE-2008' : category || 'Academic History'}
  Era Filter: ${era || 'All Eras'}
  Target Difficulty: ${difficulty || (isRPSC ? 'Hard (Assistant Prof Level)' : 'Mixed')}
  Specific Type Requested: ${questionType || 'Mixed types'}
  
  Requirements:
  1. Language: Academic Hindi (शुद्ध हिन्दी).
  2. Format: Options A, B, C, D clearly stated.
  3. Context: Include the specific exam name & year (e.g., RPSC Asst. Prof 2020, UPSC 1998, etc.).
  4. Accuracy: Must align with Official Commission Answer Keys.
  5. Schema: Valid JSON with 'id', 'questionText', 'options', 'correctOption', 'explanation', 'examName', 'year', 'topic', 'difficulty'.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              questionText: { type: Type.STRING },
              options: {
                type: Type.OBJECT,
                properties: {
                  A: { type: Type.STRING },
                  B: { type: Type.STRING },
                  C: { type: Type.STRING },
                  D: { type: Type.STRING },
                },
                required: ['A', 'B', 'C', 'D']
              },
              correctOption: { type: Type.STRING },
              explanation: { type: Type.STRING },
              examName: { type: Type.STRING },
              year: { type: Type.STRING },
              topic: { type: Type.STRING },
              difficulty: { type: Type.STRING, description: "One of 'Easy', 'Medium', 'Hard'" },
            },
            required: ['id', 'questionText', 'options', 'correctOption', 'explanation', 'examName', 'year', 'topic', 'difficulty']
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as Question[];
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
};
