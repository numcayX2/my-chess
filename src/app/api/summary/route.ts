import { NextRequest, NextResponse } from "next/server";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:14b";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pgn, playerColor, moves } = body as {
      pgn: string;
      playerColor: "w" | "b";
      moves: {
        moveNumber: number;
        san: string;
        byColor: "w" | "b";
        classification: string | null;
        evalAfter: number | null;
        mateAfter: number | null;
        bestMoveBefore: string | null;
      }[];
    };

    const playerMoves = moves.filter((m) => m.byColor === playerColor);
    const flagged = playerMoves.filter((m) =>
      ["mistake", "blunder", "inaccuracy"].includes(m.classification ?? "")
    );

    const flaggedText = flagged
      .map(
        (m) =>
          `ตาที่ ${m.moveNumber} เดิน ${m.san} (ระดับ: ${m.classification}) — เอนจิ้นแนะนำ ${
            m.bestMoveBefore ?? "ไม่ทราบ"
          }`
      )
      .join("\n");

    const prompt = `คุณคือโค้ชหมากรุกมืออาชีพ วิเคราะห์เกมที่จบแล้วให้ผู้เล่นฝั่ง${
      playerColor === "w" ? "ขาว" : "ดำ"
    } เป็นภาษาไทย

PGN ของเกม:
${pgn}

รายการตาที่ผู้เล่นเดินพลาด/ไม่แม่นยำ:
${flaggedText || "ไม่มีจุดพลาดสำคัญ"}

โปรดสรุปเป็นภาษาไทย ประมาณ 6-10 ประโยค ครอบคลุม:
1. ภาพรวมของเกม (ผู้เล่นเล่นได้ดีแค่ไหนโดยรวม)
2. จุดเปลี่ยนสำคัญของเกม (ถ้ามี) ว่าเกิดจากตาไหน
3. รูปแบบข้อผิดพลาดที่เกิดซ้ำๆ (เช่น พลาดเรื่องความปลอดภัยคิง, พลาดจังหวะแลกหมาก, ควบคุมกลางกระดานไม่ดี)
4. คำแนะนำ 2-3 ข้อที่ผู้เล่นควรฝึกฝนต่อไป
ห้ามใช้ markdown หนักๆ ตอบเป็นข้อความล้วนอ่านลื่น`;

    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.4 },
      }),
      signal: AbortSignal.timeout(90_000),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Ollama ตอบกลับผิดพลาด (${res.status}): ${text}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ summary: data.response ?? "" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json(
      {
        error: `เรียก Ollama ไม่สำเร็จ: ${message}. ตรวจสอบว่า Ollama รันอยู่ที่ ${OLLAMA_URL}`,
      },
      { status: 500 }
    );
  }
}
