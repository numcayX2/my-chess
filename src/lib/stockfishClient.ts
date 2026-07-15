// Thin client around the Stockfish WASM engine running in a Web Worker.
// Handles UCI protocol details so the rest of the app can just ask for
// "analyze this FEN" or "play a move at this ELO".

export type EngineInfo = {
  depth: number;
  evalCp: number | null; // from White's perspective
  mate: number | null;
  pv: string[];
  bestMoveUci: string | null;
};

type Listener = (info: EngineInfo) => void;
type BestMoveListener = (uciMove: string) => void;

export class StockfishClient {
  private worker: Worker | null = null;
  private ready = false;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;
  private infoListener: Listener | null = null;
  private bestMoveListener: BestMoveListener | null = null;
  private lastInfo: EngineInfo = {
    depth: 0,
    evalCp: null,
    mate: null,
    pv: [],
    bestMoveUci: null,
  };
  private sideToMove: "w" | "b" = "w";

  constructor() {
    this.readyPromise = new Promise((resolve) => {
      this.resolveReady = resolve;
    });
  }

  init() {
    if (this.worker) return;
    this.worker = new Worker("/stockfish/stockfish-18-lite-single.js");
    this.worker.onmessage = (e: MessageEvent) => this.handleMessage(e.data as string);
    this.send("uci");
  }

  private send(cmd: string) {
    this.worker?.postMessage(cmd);
  }

  private handleMessage(line: string) {
    if (line === "uciok") {
      this.send("isready");
      return;
    }
    if (line === "readyok") {
      if (!this.ready) {
        this.ready = true;
        this.resolveReady();
      }
      return;
    }
    if (line.startsWith("info")) {
      const info = this.parseInfo(line);
      if (info) {
        this.lastInfo = { ...this.lastInfo, ...info };
        this.infoListener?.(this.lastInfo);
      }
      return;
    }
    if (line.startsWith("bestmove")) {
      const parts = line.split(" ");
      const move = parts[1];
      if (move && move !== "(none)") {
        this.bestMoveListener?.(move);
      }
      return;
    }
  }

  private parseInfo(line: string): Partial<EngineInfo> | null {
    const tokens = line.split(" ");
    const out: Partial<EngineInfo> = {};
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === "depth") out.depth = parseInt(tokens[i + 1], 10);
      if (tokens[i] === "score") {
        if (tokens[i + 1] === "cp") {
          const cp = parseInt(tokens[i + 2], 10);
          out.evalCp = this.sideToMove === "w" ? cp : -cp;
          out.mate = null;
        } else if (tokens[i + 1] === "mate") {
          const m = parseInt(tokens[i + 2], 10);
          out.mate = this.sideToMove === "w" ? m : -m;
          out.evalCp = null;
        }
      }
      if (tokens[i] === "pv") {
        out.pv = tokens.slice(i + 1);
        out.bestMoveUci = out.pv[0] ?? null;
      }
    }
    return Object.keys(out).length ? out : null;
  }

  async waitUntilReady() {
    this.init();
    await this.readyPromise;
  }

  /** Configure engine strength. elo ~ 800-2850 maps to UCI_Elo (limited strength). */
  setStrength(elo: number) {
    this.send("setoption name UCI_LimitStrength value true");
    const clamped = Math.max(800, Math.min(2850, elo));
    this.send(`setoption name UCI_Elo value ${clamped}`);
  }

  setFullStrength() {
    this.send("setoption name UCI_LimitStrength value false");
  }

  /**
   * Analyze a position for advice purposes (no strength limit — always give the
   * best true evaluation regardless of opponent ELO).
   */
  analyze(fen: string, depth = 14, onInfo?: Listener): Promise<EngineInfo> {
    this.sideToMove = fen.split(" ")[1] === "b" ? "b" : "w";
    this.infoListener = onInfo ?? null;
    return new Promise((resolve) => {
      this.bestMoveListener = () => {
        resolve(this.lastInfo);
      };
      this.setFullStrength();
      this.send(`position fen ${fen}`);
      this.send(`go depth ${depth}`);
    });
  }

  /** Ask the (strength-limited) engine to pick a move to play as the opponent. */
  getEngineMove(fen: string, elo: number, movetimeMs = 600): Promise<string> {
    this.sideToMove = fen.split(" ")[1] === "b" ? "b" : "w";
    this.setStrength(elo);
    return new Promise((resolve) => {
      this.bestMoveListener = (uci) => resolve(uci);
      this.send(`position fen ${fen}`);
      this.send(`go movetime ${movetimeMs}`);
    });
  }

  destroy() {
    this.worker?.terminate();
    this.worker = null;
  }
}

let singleton: StockfishClient | null = null;
export function getStockfish(): StockfishClient {
  if (!singleton) singleton = new StockfishClient();
  return singleton;
}
