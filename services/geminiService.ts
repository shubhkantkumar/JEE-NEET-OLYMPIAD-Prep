import { GoogleGenAI, Type } from "@google/genai";
import { Question, Difficulty, Subject } from "../types";

const getClient = () => {
  // In a real app, never expose keys on client. This is for the demo environment.
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const generateQuestions = async (
  subject: Subject,
  chapter: string,
  difficulty: Difficulty,
  count: number = 5,
  mode: 'practice' | 'pyq' | 'olympiad' = 'practice'
): Promise<Question[]> => {
  try {
    const ai = getClient();
    
    let prompt = "";
    if (mode === 'pyq' || mode === 'olympiad') {
      const examFocus = mode === 'olympiad' 
        ? "prestigious Olympiads (NSEP, INPhO, RMO, INChO, NSEC) from the last 10 years" 
        : "previous JEE Main/Advanced or NEET exams from the last 20 years";
      
      const difficultyText = mode === 'olympiad' ? "Very Hard/Olympiad Level" : difficulty;

      prompt = `Generate ${count} authentic Past Year Questions (PYQs) for ${subject} - ${chapter}. 
      Source material: ${examFocus}.
      Difficulty: ${difficultyText}.
      Include the specific exam year source (e.g., "INPhO 2019", "JEE Adv 2020") in the 'year' field.
      
      CRITICAL REQUIREMENT for 'explanation':
      The explanation MUST use Markdown headers exactly as follows:
      ### Key Concept
      (Briefly state the physical/chemical concept involved)
      
      ### Formulas & Rules
      (List specific formulas or rules required)
      
      ### Step-by-Step Solution
      (Show the full derivation or logical steps to reach the answer)

      CRITICAL REQUIREMENT for 'videoQuery':
      Provide a specific YouTube search string to find a video solution for this exact concept or question (e.g. "Rotational Motion Rolling Friction derivation physics").
      
      Output JSON format with: text, options (array of 4 strings), correctOptionIndex (0-3 integer), explanation (string), year (string), videoQuery (string).`;
    } else {
      prompt = `Generate ${count} multiple choice questions for a ${difficulty} level student preparing for competitive exams. 
      Subject: ${subject}. 
      Chapter: ${chapter}.
      
      CRITICAL REQUIREMENT for 'explanation':
      The explanation MUST use Markdown headers exactly as follows:
      ### Key Concept
      ### Formulas
      ### Step-by-Step Solution
      
      Output JSON format including 'videoQuery'.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctOptionIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              year: { type: Type.STRING, description: "The exam year, e.g. 'JEE Main 2023' or 'NSEP 2015'" },
              videoQuery: { type: Type.STRING, description: "Search term for video solution"}
            },
            required: ["text", "options", "correctOptionIndex", "explanation", "videoQuery"]
          }
        }
      }
    });

    const rawData = JSON.parse(response.text || "[]");
    
    // Map to internal Question type and add IDs
    return rawData.map((q: any, index: number) => ({
      id: `gen-${Date.now()}-${index}`,
      text: q.text,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation,
      year: q.year || (mode === 'practice' ? undefined : 'Previous Year'),
      videoQuery: q.videoQuery || `${chapter} ${subject} ${mode} solution`,
      subject,
      chapter,
      difficulty
    }));

  } catch (error) {
    console.error("Failed to generate questions:", error);
    return [
      {
        id: 'fallback-1',
        text: `(API Error - using fallback) What is the unit of Force?`,
        options: ['Newton', 'Joule', 'Watt', 'Pascal'],
        correctOptionIndex: 0,
        explanation: '### Key Concept\nSI Units\n\n### Formulas\nF = ma\n\n### Step-by-Step Solution\nNewton is the SI unit of force defined as kg·m/s².',
        subject: subject,
        chapter: chapter,
        difficulty: difficulty,
        year: 'Sample',
        videoQuery: 'Force unit physics'
      }
    ];
  }
};

export const generateAnalysis = async (score: number, total: number, subject: string, weakTopics: string[]) => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `A student scored ${score}/${total} in a ${subject} test. Their potential weak areas might be related to: ${weakTopics.join(', ')}. 
      Give a 2-sentence encouraging summary and 3 specific actionable tips to improve. 
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tips: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {
      summary: "Great effort! Keep practicing to improve your accuracy.",
      tips: ["Review the chapter formulas.", "Practice more numericals.", "Analyze your mistakes."]
    };
  }
};

export const generateChapterNotes = async (subject: string, chapter: string): Promise<{content: string}> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create comprehensive study notes for ${subject} chapter: "${chapter}".
      Include:
      1. Key Concepts & Definitions
      2. Important Formulas (formatted clearly)
      3. Key Tricks or Mnemonics for JEE/NEET/Olympiads
      4. Two Solved Examples (Olympiad Level)
      
      Format the output as clean HTML (use <h3> for headings, <ul>/<li> for lists, <strong> for emphasis, <div class="formula"> for formulas). Do not include <html> or <body> tags, just the content div.`,
    });
    
    return { content: response.text || "<p>Notes generation failed.</p>" };
  } catch (e) {
    console.error(e);
    return { content: "<p>Could not generate notes at this time. Please try again.</p>" };
  }
};