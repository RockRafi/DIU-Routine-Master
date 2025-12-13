import { GoogleGenAI, Type } from "@google/genai";
import { AppData, DayOfWeek } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSampleDataWithAI = async (): Promise<AppData | null> => {
  try {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";
    
    const prompt = `
      Generate realistic sample data for a university class routine system (Computer Science department).
      Return a JSON object with:
      - 5 Teachers (name, initial, email)
      - 5 Courses (code, name, credits)
      - 4 Rooms (roomNumber, capacity, type['Lab' or 'Theory'])
      - 3 Sections (name, batch)
      - 15 ClassSessions (schedule) ensuring NO conflicts (same teacher/room/section at same time).
      
      Valid Time Slots: "08:30 - 10:00", "10:00 - 11:30", "11:30 - 13:00", "13:00 - 14:30".
      Valid Days: Sunday, Monday, Tuesday, Wednesday, Thursday.
      
      Use UUIDs for IDs.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            teachers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  initial: { type: Type.STRING },
                  email: { type: Type.STRING },
                }
              }
            },
            courses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  code: { type: Type.STRING },
                  name: { type: Type.STRING },
                  credits: { type: Type.NUMBER },
                }
              }
            },
            rooms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  roomNumber: { type: Type.STRING },
                  capacity: { type: Type.NUMBER },
                  type: Type.STRING, // Enum validation handled by logic if needed, simplify for schema
                }
              }
            },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  batch: { type: Type.NUMBER },
                }
              }
            },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  courseId: { type: Type.STRING },
                  teacherId: { type: Type.STRING },
                  roomId: { type: Type.STRING },
                  sectionId: { type: Type.STRING },
                  day: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as AppData;
      // Safety cast for enums/types
      return data;
    }
    return null;

  } catch (error) {
    console.error("Gemini generation failed", error);
    return null;
  }
};