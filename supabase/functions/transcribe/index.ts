// Supabase Edge Function: receives an audio file from the Manazil app,
// transcribes it with OpenAI (Arabic), and returns { text }.
// The OpenAI key stays here as a secret — it never ships in the app.
//
// Deploy:
//   supabase secrets set OPENAI_API_KEY=sk-...
//   supabase functions deploy transcribe --project-ref kffjoxlcxkrqtdmnjujz
//
// Optional: `supabase secrets set TRANSCRIBE_MODEL=whisper-1` to force the
// older model. By default the newer gpt-4o-transcribe is tried first and
// whisper-1 is used if it is not available.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// The prompt is treated as text that came just before the recording. Fully
// vowelled Quranic Arabic makes the model spell the way the Quran does
// (القرآن, not a look-alike). It deliberately holds only the isti'adha and
// the Bismillah: the app ignores those at the start of a recitation, so if the
// model echoes the prompt back on a silent clip nothing is lost.
const PROMPT =
  'تلاوة من القرآن الكريم بصوت مرتل. أَعُوذُ بِٱللَّهِ مِنَ ٱلشَّيْطَٰنِ ٱلرَّجِيمِ. بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ.';

const DEFAULT_MODEL = 'gpt-4o-transcribe';
const FALLBACK_MODEL = 'whisper-1';

// Letters only: no vowel marks, spaces or punctuation, alef variants folded.
function bare(s: string): string {
  return s
    .replace(/[ً-ٰٟـۖ-ۭ]/g, '')
    .replace(/[ٱآأإ]/g, 'ا')
    .replace(/[^ء-ي]/g, '');
}

// With silence or noise, transcription models sometimes just repeat the prompt.
function isPromptEcho(text: string): boolean {
  const t = bare(text);
  return t.length > 0 && bare(PROMPT).includes(t);
}

async function transcribeWith(model: string, bytes: ArrayBuffer, name: string, type: string): Promise<Response> {
  const out = new FormData();
  out.append('file', new File([bytes], name, { type: type || 'audio/wav' }));
  out.append('model', model);
  out.append('language', 'ar');
  out.append('response_format', 'json');
  out.append('prompt', PROMPT);
  if (model === 'whisper-1') out.append('temperature', '0');
  return fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}` },
    body: out,
  });
}


// Best-effort row in public.finder_logs (see supabase/admin.sql): time, size,
// whether it worked and the recognised text. Never the audio. If it fails,
// the app's answer is not affected.
async function record(entry: {
  ok: boolean;
  model?: string;
  audio_bytes?: number;
  audio_type?: string;
  duration_ms?: number;
  recognised?: string;
  error?: string;
}) {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return;
  try {
    await fetch(`${url}/rest/v1/finder_logs`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(entry),
      signal: AbortSignal.timeout(3000),
    });
  } catch (e) {
    console.error('could not write finder log', String(e));
  }
}

Deno.serve(async (req) => {
  const started = Date.now();
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!Deno.env.get('OPENAI_API_KEY')) {
      return Response.json({ error: 'OPENAI_API_KEY secret is not set' }, { status: 500, headers: corsHeaders });
    }
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return Response.json({ error: 'missing file' }, { status: 400, headers: corsHeaders });
    }

    // Read the bytes explicitly and rebuild the file, so what reaches
    // OpenAI is exactly what the app uploaded.
    const bytes = await file.arrayBuffer();
    const name = file.name || 'recitation.wav';
    const info = { name, type: file.type, size: bytes.byteLength };
    console.log('received audio', JSON.stringify(info));
    if (bytes.byteLength < 1000) {
      await record({ ok: false, audio_bytes: bytes.byteLength, audio_type: file.type, duration_ms: Date.now() - started, error: 'audio arrived empty' });
      return Response.json({ error: 'audio arrived empty', received: info }, { status: 400, headers: corsHeaders });
    }

    const wanted = Deno.env.get('TRANSCRIBE_MODEL') || DEFAULT_MODEL;
    let model = wanted;
    let res = await transcribeWith(model, bytes, name, file.type);
    if (!res.ok && model !== FALLBACK_MODEL) {
      console.error('model failed, falling back', model, res.status, (await res.text()).slice(0, 200));
      model = FALLBACK_MODEL;
      res = await transcribeWith(model, bytes, name, file.type);
    }

    if (!res.ok) {
      // Pass OpenAI's reason through (never includes the key) so failures are diagnosable.
      const detail = await res.text();
      console.error('OpenAI error', res.status, detail);
      await record({ ok: false, model, audio_bytes: bytes.byteLength, audio_type: file.type, duration_ms: Date.now() - started, error: `OpenAI ${res.status}: ${detail.slice(0, 200)}` });
      return Response.json(
        { error: 'transcription failed', openai_status: res.status, received: info, detail: detail.slice(0, 300) },
        { status: 502, headers: corsHeaders },
      );
    }
    const { text } = await res.json();
    const heard = typeof text === 'string' ? text : '';
    console.log('transcribed', JSON.stringify({ model, text: heard }));
    const finalText = isPromptEcho(heard) ? '' : heard;
    await record({ ok: true, model, audio_bytes: bytes.byteLength, audio_type: file.type, duration_ms: Date.now() - started, recognised: finalText });
    return Response.json({ text: finalText, model }, { headers: corsHeaders });
  } catch (e) {
    await record({ ok: false, duration_ms: Date.now() - started, error: `bad request: ${String(e).slice(0, 150)}` });
    return Response.json({ error: 'bad request' }, { status: 400, headers: corsHeaders });
  }
});
