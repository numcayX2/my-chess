import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const systemPrompt = `
      You are an expert chess coach. You must explain the user's latest move in Thai.
      Keep it brief, encouraging, and clear. Do not use any emojis.
      
      Analytical Context:
      - The user's move was classified as a: ${body.moveClassification}
      - The evaluation changed by: ${body.evaluationDelta?.toFixed(2)} pawns.
      
      Instructions:
      1. If it is a Blunder or Mistake, point out what piece is hanging or what the threat is, then mention the Engine's suggested best move (${body.bestMove}).
      2. If it is a Good or Great move, praise the user briefly and explain why it strengthens their position.
      3. Never use emojis in your response.
    `;

    const userPrompt = `Position (FEN): ${body.fen}. Player moved: ${body.lastMove}. Analyze this move.`;

    // 1. Send the request to your local Ollama instance
    const ollamaResponse = await fetch(
      process.env.OLLAMA_URL || "http://localhost:11434/api/generate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || "gemma4:e4b", // Make sure this matches your installed model
          prompt: `${systemPrompt}\n\n${userPrompt}`,
          stream: false,
        }),
      },
    );

    // 2. Handle connection errors
    if (!ollamaResponse.ok) {
      throw new Error(`Ollama responded with status: ${ollamaResponse.status}`);
    }

    // 3. Parse the response
    const data = await ollamaResponse.json();

    return NextResponse.json({
      advice: data.response,
    });
  } catch (error) {
    console.error("AI Connection Error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to connect to local AI. Please ensure Ollama is running.",
      },
      { status: 500 },
    );
  }
}
