
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { KBPath, RAGSource, AgentResult, Stakeholder } from "../types";

// Always use a named parameter for apiKey and obtain it from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const querySitterAgent = async (
  country: string,
  question: string,
  kbPaths: KBPath[],
  ragSources: RAGSource[]
): Promise<AgentResult> => {
  // Construct context strings for paths
  const kbSummary = kbPaths.map(p => `[FOLDER] ${p.name} (${p.files.length} files available) - Path: ${p.path}`).join('\n');
  
  // Format RAG sources with URLs to guide the search
  const ragContext = ragSources
    .filter(s => s.active)
    .map(s => `- ${s.name}: ${s.url}`)
    .join('\n');

  const systemInstruction = `
    You are "Sitter", a world-class technical support agent for a complex SaaS organization.
    
    CONTEXT:
    1. LOCAL KNOWLEDGE BASE (Primary Source):
    ${kbSummary}
    
    2. TRUSTED EXTERNAL RAG SOURCES (Secondary Source):
    ${ragContext}
    
    INSTRUCTIONS:
    - First, analyze the attached Local Knowledge Base files to answer the user's question.
    - If the answer is incomplete or missing in local files, use Google Search to find up-to-date information, specifically prioritizing the domains listed in "TRUSTED EXTERNAL RAG SOURCES".
    - Answer specifically for the client in ${country}.
    - Provide the answer in TWO languages side-by-side in JSON format (English and Traditional Chinese).
    - If you use external information, ensure it matches the context of the RAG sources provided.
  `;

  // Build the multimodal contents
  // We start with the text prompt
  const parts: any[] = [
    { text: `Client Country: ${country}\nClient Question: ${question}` }
  ];

  // Iterate folders, then iterate files within folders
  kbPaths.forEach(kb => {
    if (kb.type === 'local_folder') {
      kb.files.forEach(file => {
         parts.push({ text: `\n--- FILE: ${file.name} ---\nLocation: ${file.relativePath}\n` });
         parts.push({
          inlineData: {
            data: file.data,
            mimeType: file.mimeType
          }
        });
      });
    }
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        systemInstruction,
        // Enable Google Search to allow RAG sources to be utilized
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answerEnglish: {
              type: Type.STRING,
              description: "The technical support answer in English."
            },
            answerChinese: {
              type: Type.STRING,
              description: "The technical support answer in Traditional Chinese."
            }
          },
          required: ["answerEnglish", "answerChinese"]
        }
      }
    });

    const responseText = response.text || '{}';
    let data;
    try {
       data = JSON.parse(responseText.trim());
    } catch (e) {
       // Fallback if model returns Markdown code block around JSON
       const cleanText = responseText.replace(/```json|```/g, '').trim();
       data = JSON.parse(cleanText);
    }

    // Extract Grounding Metadata for citations
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingUrls = groundingChunks
      .filter((c: any) => c.web?.uri)
      .map((c: any) => ({
        title: c.web?.title || "External Source",
        uri: c.web?.uri
      }));

    return {
      answerEnglish: data.answerEnglish || "Sorry, I couldn't generate an English answer from the provided context.",
      answerChinese: data.answerChinese || "抱歉，無法從提供的內容中產生中文回答。",
      groundingUrls
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const extractStakeholdersFromKB = async (
  kbPaths: KBPath[]
): Promise<Partial<Stakeholder>[]> => {
  const kbSummary = kbPaths.map(p => `[FOLDER] ${p.name} - ${p.files.length} files`).join('\n');

  const systemInstruction = `
    Analyze the provided Knowledge Base folder contents to identify stakeholders.
    
    FOLDERS INDEX:
    ${kbSummary}

    TASKS:
    1. Read all attached documents within the folders thoroughly.
    2. Identify names of people, departments, or partner entities mentioned in the documents.
    3. Determine the "Region" based on the content or filename.
    4. Infer Department, Role, and a brief Detail summary.
    5. IMPORTANT: For 'Department', 'Role', and 'Detail', you MUST provide the value in BOTH English and Traditional Chinese.
       Format: "English Text \n Traditional Chinese Text"
    6. Set Source to "File: [Relative Path]".
  `;

  const parts: any[] = [
    { text: "Generate a list of stakeholders based on the attached KB folder documents." }
  ];

  kbPaths.forEach(kb => {
    if (kb.type === 'local_folder') {
      kb.files.forEach(file => {
         parts.push({ text: `\n--- FILE: ${file.name} ---\nLocation: ${file.relativePath}\n` });
         parts.push({
          inlineData: {
            data: file.data,
            mimeType: file.mimeType
          }
        });
      });
    }
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              region: { type: Type.STRING },
              department: { type: Type.STRING },
              role: { type: Type.STRING },
              detail: { type: Type.STRING },
              source: { type: Type.STRING }
            },
            required: ["name", "region"]
          }
        }
      }
    });

    const responseText = response.text || '[]';
    // Handle potential markdown wrapping
    const cleanText = responseText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Stakeholder Gen Error:", error);
    return [];
  }
};
