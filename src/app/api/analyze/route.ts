import { NextRequest, NextResponse } from "next/server";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:14b";

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
2. ถ้าไม่ใช่หมากที่ดีที่สุด ควรเดินอะไรแทนและเพราะเหตุใดจึงดีกว่า (พูดถึงแนวคิดเชิงยุทธศาสตร์ เช่น การควบคุมกลางกระดาน การพัฒนาหมาก ความปลอดภัยของคิง ฯลฯ)
3. คำแนะนำสั้นๆ สำหรับตาต่อไป`;

    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.4 },
      }),
      // Ollama can be slow on local hardware — give it room.
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Ollama ตอบกลับผิดพลาด (${res.status}): ${text}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ explanation: data.response ?? "" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json(
      {
        error: `เรียก Ollama ไม่สำเร็จ: ${message}. ตรวจสอบว่า Ollama รันอยู่ที่ ${OLLAMA_URL} และดึงโมเดล ${OLLAMA_MODEL} ไว้แล้ว (ollama pull ${OLLAMA_MODEL})`,
      },
      { status: 500 }
    );
  }
}
