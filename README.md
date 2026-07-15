# หมากรุกกับโค้ช AI (Chess Coach)

เว็บแอปฝึกหมากรุก เล่นกับ Stockfish (รันในเบราว์เซอร์ ไม่ต้องมีเซิร์ฟเวอร์) พร้อมโค้ช AI
ที่อธิบายทุกการเดินของคุณเป็นภาษาไทย โดยใช้ **Ollama ที่รันในเครื่องของคุณเอง** (ไม่มีการเรียก API
ภายนอก ไม่มีค่าใช้จ่าย)

## ฟีเจอร์

- เลือกสีที่จะเล่นได้: ขาว / สุ่ม / ดำ
- ปรับระดับความยากของคู่แข่ง (ELO 800–2850) ผ่าน Stockfish `UCI_LimitStrength`
- Eval bar และคำแนะนำหมากที่ดีที่สุดจาก Stockfish (ความแรงเต็มเสมอ ไม่ผูกกับ ELO คู่แข่ง)
- โค้ช AI (ผ่าน Ollama) อธิบายทุกการเดินของผู้เล่น: ดี/ไม่ดีอย่างไร ควรเดินอะไรแทน
- จบเกมแล้วสรุปผล: กราฟความได้เปรียบตลอดเกม, จุดพลาด (inaccuracy/mistake/blunder),
  และบทวิเคราะห์ภาพรวมจาก AI

## ติดตั้งและรัน

### 1. เตรียม Ollama

```bash
ollama pull qwen2.5:14b   # หรือโมเดลอื่นที่มีอยู่แล้ว เช่น gemma2:9b
ollama serve              # ถ้ายังไม่ได้รันอยู่
```

ทดสอบว่า Ollama พร้อมใช้งาน:

```bash
curl http://localhost:11434/api/tags
```

### 2. ติดตั้งโปรเจกต์

```bash
npm install
cp .env.example .env.local   # แก้ OLLAMA_MODEL ให้ตรงกับโมเดลที่มี ถ้าจำเป็น
npm run dev
```

เปิด http://localhost:3000

### 3. Build สำหรับใช้งานจริง

```bash
npm run build
npm start
```

## โครงสร้างโปรเจกต์

```
src/
  app/
    page.tsx                // หน้าเกมหลัก (setup / playing / summary)
    api/analyze/route.ts    // เรียก Ollama อธิบายการเดินแต่ละตา
    api/summary/route.ts    // เรียก Ollama สรุปเกมเมื่อจบ
  components/
    SetupModal.tsx          // เลือกสี + ELO ก่อนเริ่มเกม
    Board.tsx               // กระดาน (react-chessboard)
    EvalBar.tsx             // แถบแสดงความได้เปรียบ
    AdvicePanel.tsx         // คำแนะนำจากโค้ช AI ต่อการเดิน
    MoveList.tsx             // รายการเดินหมากพร้อมสีบอกคุณภาพการเดิน
    GameSummary.tsx          // สรุปผลเมื่อจบเกม (กราฟ + AI recap)
  hooks/
    useGameEngine.ts         // ตัวจัดการหลัก: วิเคราะห์ตำแหน่ง, สั่ง engine เดิน,
                             // จัดระดับการเดิน, เรียกขอคำแนะนำจาก Ollama
  lib/
    stockfishClient.ts       // wrapper รอบ Stockfish WASM (UCI ผ่าน Web Worker)
    moveClassifier.ts        // จัดระดับ best/inaccuracy/mistake/blunder จาก eval diff
    chessUtils.ts            // แปลง UCI -> SAN
    ollama.ts                // helper เรียก API routes ฝั่ง client
  store/
    gameStore.ts              // Zustand store: สถานะเกมทั้งหมด
public/stockfish/            // ไฟล์ engine Stockfish 18 (lite, single-thread WASM)
```

## หมายเหตุเรื่องประสิทธิภาพ

- Stockfish รันฝั่ง client (Web Worker) — ใช้ CPU เครื่องผู้เล่น ไม่ใช่ GPU/VRAM
- Ollama ใช้ VRAM/RAM เครื่องคุณ — บนการ์ดจอ 8GB แนะนำโมเดลไม่เกิน ~14b สำหรับ
  ความหน่วงที่ยอมรับได้ต่อการเดินหนึ่งตา ถ้าอยากได้คำตอบเร็วขึ้นลองรุ่น 7-9b
- ปรับ `OLLAMA_MODEL` ใน `.env.local` ได้ตลอดโดยไม่ต้องแก้โค้ด
