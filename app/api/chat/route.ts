import { streamText, UIMessage, convertToModelMessages, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import z from "zod";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const SYSTEM_PROMPT = `You are an expert database assistant that helps users to query database using 
  natural language. 
  You have access to a following tools:
  1. db tool: Call this tool to query the database and get relevant information.
  
Rules: 
 - Generates only SELECT queries (no INSERT/UPDATE/DELETE).
 - Return valid SQLLite syntax.
 Always respond in a helpful, conversational manner while being technically accurate.`

  const result = streamText({
    model: openai("gpt-4o"),
    messages: await convertToModelMessages(messages),
    system: SYSTEM_PROMPT,
    tools: {
      db: tool({
        description: 'Call this tool to query the database',
        inputSchema: z.object({
          query: z.string().describe('The database query to execute'),
        }),
        execute: async ({ query }) => {
          const temperature = Math.round(Math.random() * (90 - 32) + 32);
          return {
            location,
            temperature,
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
