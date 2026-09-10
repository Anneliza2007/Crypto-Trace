import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { SAMPLE_WALLETS, SAMPLE_TRANSACTIONS, runBfsTrace } from '../src/data/mockBlockchain';

const app = express();

// Enable JSON parsing
app.use(express.json());

// Enable permissive CORS for Vercel deployments and preview environments
app.use((req: Request, res: Response, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Programmatic fallback for forensic summary if Gemini key is missing or unreachable
function generateFallbackSummary(trace: any): string {
  if (!trace) {
    return 'No active trace data found to analyze.';
  }
  if (!trace.found) {
    return `### Forensic Assessment: Cold Unhosted Stagnation\n\n` +
      `- **Root Suspect Address:** \`${trace.suspectAddress}\`\n` +
      `- **Status:** Path halted at non-custodial or unhosted liquidity pools. **No centralized VASP detected.**\n` +
      `- **Hops Explored:** ${trace.visitedCount} nodes inspected across transaction breadth.\n` +
      `- **Forensic Recommendation:** Maintain automated webhook watchtower for future outbound transactions from node \`${trace.suspectAddress.slice(0, 10)}...\`. Since no exchange deposit addresses were identified, statutory freeze notices under BNSS §94 are not applicable at this stage.`;
  }

  const vaspName = trace.targetVasp?.name || 'Regulated VASP';
  const vaspAddr = trace.targetVasp?.address || 'N/A';
  const received = trace.targetVasp?.receivedAmount ?? 0;
  const initialHop = trace.path?.[0];
  const initialAmount = initialHop?.amount || trace.totalVolumeTraced || 0;
  const dissipation = initialAmount > 0 ? (((initialAmount - received) / initialAmount) * 100).toFixed(1) : '0';

  return `### Forensic Intelligence Briefing: Case #${trace.suspectAddress.slice(2, 8).toUpperCase()}\n\n` +
    `#### 1. Laundering Typology & Chain Analysis\n` +
    `Automated BFS pathfinding discovered an active **${trace.totalHops}-hop laundering pipeline** leading directly from suspect wallet \`${trace.suspectAddress}\` into centralized custody at **${vaspName}** (\`${vaspAddr}\`).\n\n` +
    `The funds exhibited classic obfuscation behaviors:\n` +
    `- **Layering Technique:** Rapid sequential multi-hop transfers designed to defeat simple 1st-degree heuristic trackers.\n` +
    `- **Peel Chain & Structuring:** Original disbursement of **${initialAmount} ETH** was peeled across intermediary mule nodes, ultimately injecting **${received} ETH** into ${vaspName} hot storage.\n` +
    `- **Dissipation Rate:** Approximately **${dissipation}%** of volume was siphoned across transaction gas fees, intermediary splits, or mixer retention.\n\n` +
    `#### 2. Terminal Asset Ingress\n` +
    `- **Receiving VASP:** **${vaspName}**\n` +
    `- **Ingress Deposit Address:** \`${vaspAddr}\`\n` +
    `- **Last Known Tx Hash:** \`${trace.path?.[trace.path.length - 1]?.txHash || 'N/A'}\`\n\n` +
    `#### 3. Statutory Action Required (BNSS 2023 § 94)\n` +
    `To prevent imminent fiat conversion or secondary withdrawal, an immediate **Statutory Seizure Notice** pursuant to **Section 94 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023** must be served to ${vaspName}'s legal compliance division to freeze the beneficiary account linked to deposit address \`${vaspAddr}\`.`;
}

// Programmatic fallback for forensic chat responses
function generateFallbackChatResponse(query: string, trace: any): string {
  const q = query.toLowerCase();
  if (q.includes('peel chain') || q.includes('peel')) {
    return `A **peel chain** is a classic laundering technique where a large sum of cryptocurrency is systematically whittled down through a sequence of transactions. At each hop, a small amount is "peeled" off to a secondary or dead-end wallet (often for cash-out or mixing), while the remaining bulk is forwarded to a new address. In this case, our BFS engine traced through these peeling layers until the remaining balance landed in a known VASP deposit address.`;
  }
  if (q.includes('bnss') || q.includes('section 94') || q.includes('freeze') || q.includes('legal')) {
    return `Under **Section 94 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023** (which replaced Section 91 of the CrPC), an Investigating Officer or Court is empowered to issue a statutory summons or requisition for the production of documents or things. For cryptocurrency offenses, this provides lawful jurisdiction to direct compliant Virtual Asset Service Providers (VASPs) to produce beneficiary KYC records, IP access logs, linked bank accounts, and place an immediate debit freeze on the tainted funds.`;
  }
  if (q.includes('vasp') || q.includes('exchange') || q.includes('binance') || q.includes('coindcx')) {
    if (trace?.found) {
      return `The identified terminal VASP is **${trace.targetVasp?.name}** with deposit vault \`${trace.targetVasp?.address}\`. Because this entity is a regulated, centralized exchange with mandatory KYC compliance, law enforcement can correlate the on-chain deposit tx with real-world identity profiles.`;
    }
    return `VASPs (Virtual Asset Service Providers) are centralized entities like Binance, CoinDCX, or Kraken that require KYC identification. Finding a transaction link to a VASP represents the primary goal in crypto forensics because it bridges anonymous blockchain addresses with real-world suspect identities.`;
  }
  if (q.includes('hop') || q.includes('path') || q.includes('how many')) {
    if (trace?.found) {
      return `The current path consists of **${trace.totalHops} consecutive hops** spanning from suspect root \`${trace.suspectAddress.slice(0, 10)}...\` to the terminal deposit at ${trace.targetVasp?.name}. Each hop has verified block timestamps and cryptographic transaction hashes linking the sender and receiver.`;
    }
    return `The tracing engine uses Breadth-First Search (BFS) to traverse outward from the suspect root until encountering a known exchange node.`;
  }
  return `As the CryptoTrace Forensic Assistant, I am analyzing wallet \`${trace?.suspectAddress || 'N/A'}\`. ${trace?.found ? `Funds have successfully been correlated to ${trace.targetVasp?.name} across ${trace.totalHops} hops.` : 'No centralized VASP destination was reachable from this root.'} Feel free to ask about specific hops, peel chain structuring, legal notice drafting under BNSS Section 94, or KYC subpoena procedures.`;
}

const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

async function generateWithModelFallback(
  ai: GoogleGenAI,
  contents: any,
  systemInstruction?: string
): Promise<{ text: string; modelUsed: string } | null> {
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents,
          config: systemInstruction ? { systemInstruction } : undefined,
        }),
        4500
      );
      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch {
      continue;
    }
  }
  return null;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs = 4500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('AI generation timed out')), timeoutMs)
    ),
  ]);
}

// Setup API Router
const apiRouter = express.Router();

// Health Check
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'CryptoTrace Forensic Engine', environment: process.env.VERCEL ? 'vercel' : 'node' });
});

// Auth endpoint for authorized officers
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body || {};
  if (username === 'testuser' && password === '123456') {
    res.json({
      success: true,
      user: {
        username: 'testuser',
        role: 'Cybercrime Investigator',
        badgeId: 'BNSS-INV-2024-94'
      }
    });
    return;
  }
  res.status(401).json({
    success: false,
    message: 'Invalid credentials. Access denied.'
  });
});

// Get sample wallets list
apiRouter.get('/wallets', (req: Request, res: Response) => {
  res.json({
    success: true,
    wallets: SAMPLE_WALLETS,
    total: SAMPLE_WALLETS.length
  });
});

// Get sample transactions
apiRouter.get('/transactions', (req: Request, res: Response) => {
  res.json({
    success: true,
    transactions: SAMPLE_TRANSACTIONS,
    total: SAMPLE_TRANSACTIONS.length
  });
});

// Run BFS Trace on server
apiRouter.post('/trace', (req: Request, res: Response) => {
  const { suspectAddress } = req.body;
  if (!suspectAddress || typeof suspectAddress !== 'string') {
    res.status(400).json({ error: 'Missing or invalid suspectAddress parameter' });
    return;
  }

  try {
    const traceResult = runBfsTrace(suspectAddress, SAMPLE_TRANSACTIONS, SAMPLE_WALLETS);
    res.json({
      success: true,
      trace: traceResult
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Trace computation failure' });
  }
});

// AI Forensic Summary Route (Powered by Gemini API with fallback)
apiRouter.post('/ai/summary', async (req: Request, res: Response) => {
  const { traceResult } = req.body;
  if (!traceResult) {
    res.status(400).json({ error: 'Missing traceResult' });
    return;
  }

  const ai = getGemini();
  if (!ai) {
    const fallback = generateFallbackSummary(traceResult);
    res.json({ success: true, summary: fallback, source: 'deterministic_engine' });
    return;
  }

  try {
    const prompt = `You are an expert cryptocurrency financial crimes investigator and anti-money laundering (AML) forensic specialist for law enforcement agencies.
Analyze the following blockchain transaction trace result produced by our BFS engine:
${JSON.stringify(traceResult, null, 2)}

Provide an authoritative, well-structured forensic intelligence briefing in Markdown:
1. **Laundering Typology & Route Breakdown**: Describe the journey of funds (e.g. ransomware drain, peel chains, layering mules, obfuscation attempts).
2. **Asset Flow & Dissipation Rate**: Compare initial outflow from the suspect root versus the terminal received amount at the VASP, noting fee dissipation or split retention.
3. **Target VASP Ingress**: Identify the receiving exchange (e.g. Binance, CoinDCX) and its operational significance for KYC attribution.
4. **Statutory Action Plan**: Outline immediate legal directives under Section 94 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 for requisition of beneficiary KYC, IP logs, linked fiat bank accounts, and an emergency account debit freeze.

Keep the tone professional, objective, and actionable for cybercrime investigators. Use clear formatting with headers and bullet points.`;

    const result = await generateWithModelFallback(
      ai,
      prompt,
      'You are an elite cybercrime investigator specializing in cryptocurrency tracing, blockchain graph analysis, and statutory freezing orders under BNSS Section 94.'
    );

    if (result && result.text) {
      res.json({ success: true, summary: result.text, source: result.modelUsed });
    } else {
      const fallback = generateFallbackSummary(traceResult);
      res.json({ success: true, summary: fallback, source: 'deterministic_engine' });
    }
  } catch {
    const fallback = generateFallbackSummary(traceResult);
    res.json({ success: true, summary: fallback, source: 'deterministic_engine' });
  }
});

// AI Forensic Chat Box Route (Powered by Gemini API with fallback)
apiRouter.post('/ai/chat', async (req: Request, res: Response) => {
  const { message, history = [], traceResult } = req.body;
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Missing message parameter' });
    return;
  }

  const ai = getGemini();
  if (!ai) {
    const fallbackReply = generateFallbackChatResponse(message, traceResult);
    res.json({ success: true, reply: fallbackReply, source: 'deterministic_engine' });
    return;
  }

  try {
    const contextString = traceResult ? `
ACTIVE FORENSIC CASE CONTEXT:
- Suspect Address: ${traceResult.suspectAddress}
- VASP Reached: ${traceResult.found ? 'YES' : 'NO'}
- Target VASP: ${traceResult.targetVasp?.name || 'None'} (${traceResult.targetVasp?.address || 'N/A'})
- Ingress Amount: ${traceResult.targetVasp?.receivedAmount ?? 'N/A'} ${traceResult.targetVasp?.currency ?? ''}
- Total Hops: ${traceResult.totalHops}
- Visited Wallets: ${traceResult.visitedCount}
- Trace Path Hops:
${(traceResult.path || []).map((h: any) => `  [Hop ${h.hopNumber}] ${h.fromLabel} (${h.fromAddress.slice(0, 10)}...) -> ${h.toLabel} (${h.toAddress.slice(0, 10)}...) | ${h.amount} ${h.currency} | Tx: ${h.txHash.slice(0, 16)}... | Time: ${h.timestamp}`).join('\n')}
` : 'No active trace currently loaded.';

    const systemInstruction = `You are the CryptoTrace Forensic AI Assistant, an elite investigative agent helping cybercrime police and financial intelligence units track stolen crypto, decode laundering peel chains, and draft legal freeze orders under Section 94 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023.

${contextString}

Guidelines:
- Answer user queries with forensic precision, referencing specific hops, addresses, timestamps, and amounts from the active trace when relevant.
- Explain technical on-chain concepts clearly (peel chains, unhosted mixers, multi-sig mules, hot wallet vs cold wallet).
- If asked about legal notices or freezing, explain how BNSS § 94 compels exchanges (VASPs) to freeze wallets and surrender KYC/IP records.
- Be concise, professional, and investigative. Use Markdown formatting.`;

    const contentsPayload: any[] = [];
    for (const h of history.slice(-6)) {
      contentsPayload.push({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }],
      });
    }
    contentsPayload.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const result = await generateWithModelFallback(
      ai,
      contentsPayload,
      systemInstruction
    );

    if (result && result.text) {
      res.json({ success: true, reply: result.text, source: result.modelUsed });
    } else {
      const fallbackReply = generateFallbackChatResponse(message, traceResult);
      res.json({ success: true, reply: fallbackReply, source: 'deterministic_engine' });
    }
  } catch {
    const fallbackReply = generateFallbackChatResponse(message, traceResult);
    res.json({ success: true, reply: fallbackReply, source: 'deterministic_engine' });
  }
});

// Serve app.py code for download or copy
apiRouter.get('/app-py', (req: Request, res: Response) => {
  try {
    const potentialPaths = [
      path.join(process.cwd(), 'app.py'),
      path.join(process.cwd(), 'public', 'app.py'),
      path.join(__dirname, '..', 'app.py'),
      path.join(__dirname, '..', 'public', 'app.py')
    ];

    for (const p of potentialPaths) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send(content);
        return;
      }
    }

    res.status(404).json({ error: 'app.py not found on server filesystem' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mount on BOTH /api and root / to support direct routing and rewrite proxies seamlessly
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
