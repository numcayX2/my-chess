import { NextRequest, NextResponse } from "next/server";

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function evalToThai(evalCp: number | null, mate: number | null) {
  if (mate !== null) {
    const side = mate > 0 ? "ฝ่ายขาว" : "ฝ่ายดำ";
    return `รุกฆาตได้ใน ${Math.abs(mate)} ตา (ฝั่งที่ได้เปรียบ: ${side})`;
  }
  if (evalCp === null) return "ไม่ทราบค่าประเมิน";
  const pawns = (evalCp / 100).toFixed(2);
  const side = evalCp >= 0 ? "ฝ่ายขาวได้เปรียบ" : "ฝ่ายดำได้เปรียบ";
  return `${side} ประมาณ ${Math.abs(Number(pawns))} เบี้ย (${pawns})`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fen,
      lastMoveSan,
      moverColor,
      evalCp,
      mate,
      bestMoveSan,
      classification,
    } = body;

    const prompt = `คุณคือโค้ชหมากรุกที่อธิบายเป็นภาษาไทย กระชับ ตรงประเด็น เข้าใจง่าย ไม่เกิน 4-5 ประโยค
ห้ามใช้สัญลักษณ์ markdown หนักๆ ตอบเป็นข้อความล้วน

ข้อมูลตำแหน่งปัจจุบัน (หลังจากผู้เล่นเดิน):
- FEN: ${fen}
- ผู้เดินล่าสุด: ${moverColor === "w" ? "ฝ่ายขาว (ผู้เล่น)" : "ฝ่ายดำ"}
- หมากที่เดินไป: ${lastMoveSan ?? "ไม่มี (ยังไม่เริ่มเดิน)"}
- การประเมินตำแหน่งหลังเดิน: ${evalToThai(evalCp, mate)}
- หมากที่เอนจิ้นแนะนำว่าดีที่สุดคือ: ${bestMoveSan ?? "ไม่ทราบ"}
- ระดับการเดินนี้ตามเอนจิ้น: ${classification ?? "ไม่ทราบ"}

โปรดอธิบายให้ผู้เล่นเข้าใจว่า:
1. การเดินนี้ดีหรือไม่ดีอย่างไร
2. ถ้าไม่ใช่หมากที่ดีที่สุด ควรเดินอะไรแทนและเพราะเหตุใดจึงดีกว่า
3. คำแนะนำสั้นๆ สำหรับตาต่อไป`;

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
    const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return NextResponse.json({ explanation });
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
