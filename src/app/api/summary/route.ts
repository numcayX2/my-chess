import { NextRequest, NextResponse } from "next/server";

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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
      ["mistake", "blunder", "inaccuracy"].includes(m.classification ?? ""),
    );

    const flaggedText = flagged
      .map(
        (m) =>
          `ตาที่ ${m.moveNumber} เดิน ${m.san} (ระดับ: ${m.classification}) — เอนจิ้นแนะนำ ${
            m.bestMoveBefore ?? "ไม่ทราบ"
          }`,
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
1. ภาพรวมของเกม
2. จุดเปลี่ยนสำคัญของเกม (ถ้ามี)
3. รูปแบบข้อผิดพลาดที่เกิดซ้ำๆ
4. คำแนะนำ 2-3 ข้อที่ควรฝึกฝนต่อไป
ห้ามใช้ markdown หนักๆ ตอบเป็นข้อความล้วนอ่านลื่น`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Gemini ตอบกลับผิดพลาด (${res.status}): ${text}` },
        { status: 502 },
      );
    }

    const data = await res.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return NextResponse.json({ summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json(
      {
        error: `เรียก Gemini ไม่สำเร็จ: ${message}. ตรวจสอบ GEMINI_API_KEY ใน .env.local`,
      },
      { status: 500 },
    );
  }
}
