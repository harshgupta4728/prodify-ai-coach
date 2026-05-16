const express = require('express');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');

const router = express.Router();

// Judge0 CE API via RapidAPI (free tier: 50 req/day)
// If JUDGE0_API_KEY is set, use Judge0. Otherwise, fall back to Wandbox (free, no key).
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

// Judge0 language IDs
const JUDGE0_LANG_IDS = {
  python: 71,      // Python 3
  javascript: 63,  // Node.js
  java: 62,        // Java (OpenJDK 13)
  cpp: 54,         // C++ (GCC 9.2)
  csharp: 51,      // C# (Mono 6)
  go: 60,          // Go
  rust: 73,        // Rust
};

// Wandbox compiler names (free fallback, no key needed)
const WANDBOX_COMPILERS = {
  python: 'cpython-3.14.0',
  javascript: 'nodejs-20.17.0',
  java: 'openjdk-jdk-22+36',
  cpp: 'gcc-head',
  csharp: 'mono-6.12.0.199',
  go: 'go-1.23.2',
  rust: 'rust-1.82.0',
};

const SUPPORTED_LANGUAGES = Object.keys(WANDBOX_COMPILERS);

// Rate limit: 30 requests per minute per user
const codeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.user?._id?.toString() || 'anonymous',
  message: { success: false, error: 'Too many code execution requests. Please wait a moment.' },
  validate: { xForwardedForHeader: false },
});

// Execute via Judge0 CE (RapidAPI)
async function executeViaJudge0(language, code, stdin) {
  const langId = JUDGE0_LANG_IDS[language];
  const response = await fetch(
    'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true&fields=stdout,stderr,compile_output,status,time,memory',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
      body: JSON.stringify({
        language_id: langId,
        source_code: code,
        stdin: stdin || '',
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    console.error('Judge0 API error:', response.status, errText);
    throw new Error('Judge0 API error');
  }

  const result = await response.json();
  const isCompileError = result.status?.id === 6;
  const isTimeout = result.status?.id === 5;
  const isRuntimeError = result.status?.id === 11;

  return {
    success: true,
    run: {
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      code: (result.status?.id === 3) ? 0 : 1,
      signal: null,
      output: result.stdout || '',
    },
    compile: isCompileError ? {
      stdout: '',
      stderr: result.compile_output || '',
      code: 1,
      output: result.compile_output || '',
    } : null,
    language,
    isTimeout,
  };
}

// Execute via Wandbox (free, no API key)
async function executeViaWandbox(language, code, stdin) {
  const compiler = WANDBOX_COMPILERS[language];
  const response = await fetch('https://wandbox.org/api/compile.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      compiler,
      stdin: stdin || '',
      'compiler-option-raw': '',
      'runtime-option-raw': '',
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    console.error('Wandbox API error:', response.status, errText);
    throw new Error('Wandbox API error');
  }

  const result = await response.json();

  const hasCompileError = result.compiler_error && result.status !== '0' && !result.program_output;
  const isTimeout = result.signal === 'Killed' || (result.program_error || '').includes('Time limit');

  return {
    success: true,
    run: {
      stdout: result.program_output || '',
      stderr: result.program_error || '',
      code: result.status === '0' ? 0 : (parseInt(result.status) || 1),
      signal: result.signal || null,
      output: result.program_output || '',
    },
    compile: hasCompileError ? {
      stdout: result.compiler_output || '',
      stderr: result.compiler_error || '',
      code: 1,
      output: result.compiler_error || result.compiler_output || '',
    } : null,
    language,
    isTimeout,
  };
}

// POST /api/code/execute
router.post('/execute', auth, codeLimiter, async (req, res) => {
  try {
    const { language, code, stdin } = req.body;

    if (!language || !SUPPORTED_LANGUAGES.includes(language)) {
      return res.status(400).json({
        success: false,
        error: `Unsupported language: ${language}. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`,
      });
    }

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, error: 'Code is required.' });
    }

    if (code.length > 50000) {
      return res.status(400).json({ success: false, error: 'Code exceeds maximum size (50KB).' });
    }

    // Java fix: online compilers save files as prog.java, but Java requires
    // the filename to match public class name. Strip 'public' from class
    // declarations so any class name works with any filename.
    let processedCode = code;
    if (language === 'java') {
      processedCode = code.replace(/public\s+class\s/g, 'class ');
    }

    let result;

    // Try Judge0 first if API key is configured, otherwise use Wandbox
    if (JUDGE0_API_KEY) {
      try {
        result = await executeViaJudge0(language, processedCode, stdin);
      } catch (err) {
        console.error('Judge0 failed, falling back to Wandbox:', err.message);
        result = await executeViaWandbox(language, processedCode, stdin);
      }
    } else {
      result = await executeViaWandbox(language, processedCode, stdin);
    }

    res.json(result);
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute code. Please try again.',
    });
  }
});

module.exports = router;
