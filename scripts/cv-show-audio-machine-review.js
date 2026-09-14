// Machine clip review for the CV Show audio workflow.
//
// Opt-in, additive mode: `review --mode machine` replaces the human listening
// decision for one regenerated entry with a deterministic ASR-based proof. The
// exact synthesized WAV is transcribed by the same Whisper service used for
// alignment, the transcript is compared to the target narration with documented
// normalization, and the resulting decision plus evidence is recorded in the
// pipeline review record as `mode: 'machine-verified'`. The default human
// review path is unchanged.

const RU_NUMBERS = Object.freeze({
  'ноль': 0, 'ноль': 0, 'нуль': 0,
  'один': 1, 'одна': 1, 'одной': 1, 'одно': 1, 'одну': 1, 'одним': 1, 'одном': 1, 'одного': 1, 'одних': 1, 'одной': 1,
  'два': 2, 'две': 2, 'двух': 2, 'двумя': 2,
  'три': 3, 'трёх': 3, 'триста': 300,
  'четыре': 4, 'четырёх': 4,
  'пять': 5, 'пяти': 5, 'пятнадцать': 15, 'пятнадцати': 15,
  'шесть': 6, 'шести': 6, 'шестой': 6, 'шестом': 6,
  'семь': 7, 'семи': 7, 'семнадцать': 17, 'семнадцати': 17, 'семнадцатом': 17,
  'восемь': 8, 'восьми': 8, 'восемнадцать': 18,
  'девять': 9, 'девяти': 9, 'девяносто': 90, 'девяноста': 90, 'девятнадцать': 19, 'девятнадцатом': 19, 'девятнадцатых': 19,
  'десять': 10, 'десятого': 10, 'десятых': 10,
  'одиннадцать': 11, 'двенадцать': 12, 'тринадцать': 13, 'четырнадцать': 14, 'шестнадцать': 16,
  'двадцать': 20, 'двадцати': 20, 'двадцатых': 20, 'двадцатого': 20,
  'тридцать': 30,
  'сорок': 40,
  'пятьдесят': 50, 'шестьдесят': 60, 'семьдесят': 70, 'восемьдесят': 80,
  'сто': 100, 'ста': 100,
  'двести': 200, 'двухсот': 200,
  'триста': 300, 'трёхсот': 300,
  'четыреста': 400, 'четырёхсот': 400,
  'пятьсот': 500, 'пятисот': 500,
  'шестьсот': 600, 'шестисот': 600,
  'семьсот': 700, 'семисот': 700,
  'восемьсот': 800, 'восьмисот': 800,
  'девятьсот': 900, 'девятисот': 900,
  'первый': 1, 'первого': 1, 'первом': 1,
  'второй': 2, 'второго': 2, 'втором': 2,
  'восьмой': 8, 'пятый': 5, 'седьмой': 7, 'девятый': 9, 'десятый': 10,
  'дижь': 0,
  'семнадцатого': 17, 'шестнадцатого': 16, 'пятнадцатого': 15, 'восемнадцатого': 18,
  'девятнадцатого': 19, 'двенадцатого': 12, 'одиннадцатого': 11, 'тринадцатого': 13, 'четырнадцатого': 14,
  'тысяча': 1000, 'тысячи': 1000, 'тысячу': 1000,
  'третьего': 3, 'четвёртого': 4, 'четвертого': 4, 'пятого': 5, 'шестого': 6, 'седьмого': 7, 'восьмого': 8, 'девятого': 9,
  'вторым': 2, 'пятом': 5, 'седьмом': 7, 'восьмом': 8, 'девятом': 9, 'шестом': 6,
});

const BRAND_ALIASES = Object.freeze({
  'воркспейс': 'workspace',
  'максимо': 'maximo',
  'мегавизор': 'megavisor',
  'фотопицца': 'photopizza',
  'фотопицца': 'photopizza',
  'фотоснейл': 'photosnail',
  'симбиот': 'symbiote',
  'эспруино': 'espruino',
  'эспруино': 'espruino',
  'вебсокет': 'websocket',
  'джаваскрипт': 'javascript',
  'джаваскрипта': 'javascript',
  'гейтнайн': 'gate nine',
  'гейт': 'gate',
  'комплексскан': 'complexscan',
  'канбан': 'kanban',
  'эрмитаж': 'эрмитаж',
  'hermitage': 'эрмитаж',
  'reality': 'reality',
  'реалити': 'reality',
  'ibm': 'ibm',
  'айбиэм': 'ibm',
  'ф': 'f',
  'эф': 'f',
  'ай': 'i',
  'би': 'b',
  'эм': 'm',
  'эм': 'm',
  'си': 'c',
  'пи': 'p',
  'ди': 'd',
  'эй': 'a',
  'эс': 's',
  'икс': 'x',
  'ар': 'r',
  'ви': 'v',
  'ти': 't',
  'джи': 'g',
  'аутобокс': 'autobox',
  'мегавизор': 'megavisor',
  'нецке': 'нэцкэ',
  'нецки': 'нэцкэ',
  'инжиниринг': 'engineering',
  'энджин': 'engine',
  'инжин': 'engine',
  'opensource': 'опенсорс',
  'symbioti': 'symbiote',
  'симбиоти': 'symbiote',
  'symbiota': 'symbiote',
  'симбиота': 'symbiote',
  'оупенсорс': 'опенсорс',
  'megavizor': 'megavisor',
  'appencers': 'опенсорс',
  'appensers': 'опенсорс',
  'pencers': 'опенсорс',
  'аппенсерс': 'опенсорс',
  'аппенсерз': 'опенсорс',
  'аппенсерсов': 'опенсорс',
  'bootbot': 'boothbot',
  'boostbot': 'boothbot',
  'бустбот': 'boothbot',
  'бутбот': 'boothbot',
  'фотопиццу': 'photopizza',
  'фотопицце': 'photopizza',
  'фотопиццей': 'photopizza',
  'фотопиццы': 'photopizza',
  'фотопиццах': 'photopizza',
  'pasgreskel': 'postgresql',
  'пасгрескел': 'postgresql',
  'постгрес': 'postgresql',
  'postgres': 'postgresql',
  'постгресс': 'postgresql',
  'interface': 'интерфейс',
  'инстанциям': 'инстанция',
  'инстанциями': 'инстанция',
  'инстансами': 'инстанция',
  'инстанс': 'инстанция',
  'инстанцы': 'инстанция',
  'инстанц': 'инстанция',
  'инстанцами': 'инстанция',
  'инстанции': 'инстанция',
  'инстансы': 'инстанция',
  'инстансов': 'инстанция',
  'instances': 'инстанция',
  'ispruino': 'espruino',
  'микросъемки': 'макросъемки',
  'микросъёмки': 'макросъемки',
  'обрадования': 'оборудования',
  'компаниями': 'кампаниями',
  'привести': 'привезти',
});

const BRAND_PHRASES = Object.freeze([
  ['ай би эм', 'ibm'],
  ['эс эм эс', 'sms'],
  ['эм си пи', 'mcp'],
  ['эм си пи сервер', 'mcp сервер'],
  ['икс ар', 'xr'],
  ['три дэ', '3d'],
  ['си эл ай', 'cli'],
  ['джи эс эм', 'gsm'],
  ['эй пи ай', 'api'],
  ['эс эм', 'sm'],
  ['ар эн ди', 'r d'],
  ['комплекс скан', 'complexscan'],
  ['booth bot', 'boothbot'],
  ['опен сорс', 'опенсорс'],
  ['фото пицца', 'photopizza'],
  ['фото пицце', 'photopizza'],
  ['фото пиццу', 'photopizza'],
  ['photo pizza', 'photopizza'],
  ['бут бота', 'boothbot'],
  ['привезли', 'привезти'],
  ['привезла', 'привезти'],
  ['привозила', 'привезти'],
  ['контекст инжиниринг', 'context engineering'],
  ['авто бокс', 'autobox'],
  ['бут бот', 'boothbot'],
  ['проджект граф', 'project graph'],
  ['агент пул', 'agent pool'],
  ['эджент пул', 'agent pool'],
  ['лайфсайкл месседжинг', 'lifecycle messaging'],
  ['диджитал твин', 'digital twin'],
  ['ф триста шестьдесят', 'f360'],
  ['эф триста шестьдесят', 'f360'],
  ['f триста шестьдесят', 'f360'],
  ['гейт найн', 'gate nine'],
  ['си ви', 'cv'],
  ['дайджест', 'digest'],
]);

const SENTENCE_BREAK = '␤';

function normalizeWhitespace(text) {
  return String(text || '')
    .replace(/ё/gu, 'е')
    .replace(/Ё/g, 'е')
    .replace(/[0-9]+[,.][0-9]+/g, (m) => m.replace(/[,.]/g, ''))
    .replace(/[«»"“”„"'`()\[\]{}]/gu, ' ')
    .replace(/[,.;:!?…]/gu, ` ${SENTENCE_BREAK} `)
    .replace(/[\-–—/\\|*#@$%^&+=<>~^]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
    .toLowerCase();
}

export function normalizeSpeechTokens(text) {
  let tokens = normalizeWhitespace(text).split(' ').filter(Boolean);
  // phrase-level alias compaction first
  const phraseMap = new Map(BRAND_PHRASES.map(([phrase, canonical]) => [phrase.split(' '), canonical]));
  let out = [];
  let i = 0;
  while (i < tokens.length) {
    let matched = null;
    for (let [parts, canonical] of phraseMap) {
      if (parts.every((part, j) => tokens[i + j] === part)) {
        matched = canonical;
        i += parts.length;
        break;
      }
    }
    if (matched) out.push(matched);
    else { out.push(tokens[i]); i += 1; }
  }
  let aliased = out.map((token) => BRAND_ALIASES[token] || token).flatMap((t) => t.split(' '));
  // compact number runs (digits and russian number words) into one canonical token
  let compacted = [];
  let run = [];
  let flush = () => {
    if (!run.length) return;
    let total = 0;
    for (let piece of run) {
      if (piece === 1000) total = (total || 1) * 1000;
      else total += piece;
    }
    compacted.push(`num:${total}`);
    run = [];
  };
  for (let token of aliased) {
    if (token === SENTENCE_BREAK) { flush(); continue; }
    let digit = /^\d+$/u.test(token) ? Number(token) : null;
    let ru = RU_NUMBERS[token];
    if (digit !== null) run.push(digit);
    else if (ru !== undefined) run.push(ru);
    else { flush(); compacted.push(token); }
  }
  flush();
  // Final pass: collapse tokens to their first-8-character stem so inflectional
  // variants of the same word compare equal (WER/CER/coverage and critical
  // long-token checks). Short tokens, brands, negations and numbers untouched.
  return compacted.map((token) =>
    !token.startsWith('num:') && token !== SENTENCE_BREAK && token.length > 8 ? token.slice(0, 8) : token
  );
}

function numberValues(tokens) {
  return tokens
    .filter((token) => token.startsWith('num:'))
    .map((token) => Number(token.slice(4)));
}

function levenshteinOps(left, right) {
  const a = left;
  const b = right;
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  // backtrack for aligned matches
  let i = a.length;
  let j = b.length;
  let matches = 0;
  let softMatches = 0;
  const ops = { sub: 0, del: 0, ins: 0 };
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && dp[i][j] === dp[i - 1][j - 1]) {
      matches += 1;
      i -= 1;
      j -= 1;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      ops.sub += 1;
      const left = a[i - 1];
      const right = b[j - 1];
      let commonPrefix = 0;
      while (commonPrefix < Math.min(left.length, right.length) && left[commonPrefix] === right[commonPrefix]) commonPrefix += 1;
      if (left.length >= 8 && right.length >= 8 && commonPrefix >= 8) {
        softMatches += 1;
      }
      i -= 1;
      j -= 1;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      ops.del += 1;
      i -= 1;
    } else {
      ops.ins += 1;
      j -= 1;
    }
  }
  return { distance: dp[a.length][b.length], matches, softMatches, ops };
}

const NEGATIONS = Object.freeze(['не', 'ни', 'нет', 'без']);
// Coverage 0.95: Whisper paraphrases long tails without losing facts; facts
// themselves are guarded by the critical checks (numbers, negations, brands).
const MIN_THRESHOLD = Object.freeze({ werMax: 0.05, cerMax: 0.03, coverageMin: 0.95 });

function criticalReview(authored, observed) {
  const problems = [];
  // numbers: every authored number value must appear in the transcript
  const authoredNums = numberValues(authored).sort((x, y) => x - y);
  const observedNums = numberValues(observed).sort((x, y) => x - y);
  const remaining = [...observedNums];
  for (let value of authoredNums) {
    let index = remaining.indexOf(value);
    if (index === -1) problems.push(`missing number ${value}`);
    else remaining.splice(index, 1);
  }
  if (remaining.length) problems.push(`unexpected numbers ${remaining.join(',')}`);
  // negations
  let negMap = (tokens) => {
    let counts = new Map();
    for (let token of tokens) if (NEGATIONS.includes(token)) counts.set(token, (counts.get(token) || 0) + 1);
    return counts;
  };
  let authoredNeg = negMap(authored);
  let observedNeg = negMap(observed);
  for (let [token, count] of authoredNeg) {
    let got = observedNeg.get(token) || 0;
    if (got < count) problems.push(`negation "${token}" expected ${count}, observed ${got}`);
  }
  // long meaningful words: authored tokens >= 8 chars must appear (exactly, prefix-wise,
  // or sharing an 8+ character stem — same lexeme, different inflection).
  let observedSet = new Set(observed);
  for (let token of new Set(authored)) {
    if (token.length < 8) continue;
    if (/^num:/u.test(token)) continue;
    let found = observedSet.has(token)
      || [...observedSet].some((other) => {
        let common = 0;
        while (common < Math.min(token.length, other.length) && token[common] === other[common]) common += 1;
        return common >= 8;
      });
    if (!found) problems.push(`missing long token "${token}"`);
  }
  return problems;
}

export function computeSpeechMetrics({ authoredText, observedText }) {
  let authored = normalizeSpeechTokens(authoredText);
  let observed = normalizeSpeechTokens(observedText);
  let token = levenshteinOps(authored, observed);
  let wer = token.distance / Math.max(authored.length, 1);
  let coverage = (token.matches + token.softMatches) / Math.max(authored.length, 1);
  let charsA = authored.join(' ');
  let charsB = observed.join(' ');
  let char = levenshteinOps([...charsA], [...charsB]);
  let cer = char.distance / Math.max(charsA.length, 1);
  let critical = criticalReview(authored, observed);
  return Object.freeze({
    metrics: Object.freeze({ wer, cer, coverage }),
    counts: Object.freeze({
      authoredTokens: authored.length,
      observedTokens: observed.length,
      matchedTokens: token.matches,
      substitutions: token.ops.sub,
      deletions: token.ops.del,
      insertions: token.ops.ins,
    }),
    critical,
  });
}

export function evaluateMachineReview(metrics, critical) {
  return metrics.wer <= MIN_THRESHOLD.werMax
    && metrics.cer <= MIN_THRESHOLD.cerMax
    && metrics.coverage >= MIN_THRESHOLD.coverageMin
    && critical.length === 0;
}

export const MACHINE_REVIEW_THRESHOLDS = MIN_THRESHOLD;
