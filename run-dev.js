import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

// ANSI Color Codes
const C_RESET = '\x1b[0m';
const C_BOLD = '\x1b[1m';
const C_CYAN = '\x1b[36m';
const C_MAGENTA = '\x1b[35m';
const C_GREEN = '\x1b[32m';
const C_YELLOW = '\x1b[33m';
const C_RED = '\x1b[31m';
const C_GRAY = '\x1b[90m';

console.log(`${C_BOLD}${C_GREEN}`);
console.log('===============================================================');
console.log('   FinTech AI — Unified Development Environment');
console.log('   Launching Backend (FastAPI) & Frontend (Vite) concurrently...');
console.log('===============================================================');
console.log(`${C_RESET}`);
console.log(`  ${C_CYAN}• Backend API:${C_RESET}    http://127.0.0.1:8000`);
console.log(`  ${C_CYAN}• API Docs:${C_RESET}       http://127.0.0.1:8000/docs`);
console.log(`  ${C_MAGENTA}• Frontend App:${C_RESET}   http://localhost:5173`);
console.log(`  ${C_GRAY}Continuous Mode: Guaranteed to stay alive until explicit stop.${C_RESET}`);
console.log('===============================================================\n');

function getPythonCommand(bDir) {
  const isWin = process.platform === 'win32';
  const venvPythonWin = path.join(bDir, 'venv', 'Scripts', 'python.exe');
  const venvPythonUnix = path.join(bDir, 'venv', 'bin', 'python');

  const args = [
    '-m',
    'uvicorn',
    'app.main:app',
    '--reload',
    '--reload-dir',
    'app',
    '--host',
    '127.0.0.1',
    '--port',
    '8000',
  ];

  if (isWin && fs.existsSync(venvPythonWin)) {
    return { cmd: venvPythonWin, args };
  }
  if (!isWin && fs.existsSync(venvPythonUnix)) {
    return { cmd: venvPythonUnix, args };
  }

  return {
    cmd: isWin ? 'python' : 'python3',
    args,
  };
}

function prefixStream(stream, prefixColor, prefixTag) {
  if (!stream) return;
  const rl = readline.createInterface({ input: stream });
  rl.on('line', (line) => {
    const cleanLine = line.replace(/\r$/, '');
    console.log(`${prefixColor}[${prefixTag}]${C_RESET} ${cleanLine}`);
  });
}

function killProcessTree(pid) {
  if (!pid) return;
  if (process.platform === 'win32') {
    try {
      execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
    } catch (_) {}
  } else {
    try {
      process.kill(-pid, 'SIGKILL');
    } catch (_) {
      try {
        process.kill(pid, 'SIGKILL');
      } catch (_) {}
    }
  }
}

let backendProcess = null;
let frontendProcess = null;
let isShuttingDown = false;

// ── Spawn Backend Process ─────────────────────────────────────────────────────
function startBackend() {
  if (isShuttingDown) return;
  const py = getPythonCommand(backendDir);
  console.log(`${C_CYAN}[BACKEND]${C_RESET} Starting FastAPI backend on http://127.0.0.1:8000...`);

  backendProcess = spawn(py.cmd, py.args, {
    cwd: backendDir,
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
    windowsHide: true,
  });

  prefixStream(backendProcess.stdout, C_CYAN, 'BACKEND');
  prefixStream(backendProcess.stderr, C_CYAN, 'BACKEND');

  backendProcess.on('error', (err) => {
    console.error(`${C_RED}[BACKEND ERROR]${C_RESET} Failed to start backend: ${err.message}`);
  });

  backendProcess.on('exit', (code, signal) => {
    if (isShuttingDown) return;
    console.log(`${C_YELLOW}[BACKEND]${C_RESET} Backend process exited (code: ${code ?? 'N/A'}, signal: ${signal ?? 'N/A'}). Auto-restarting in 1.5s...`);
    setTimeout(() => {
      if (!isShuttingDown) startBackend();
    }, 1500);
  });
}

// ── Spawn Frontend Process ────────────────────────────────────────────────────
function startFrontend() {
  if (isShuttingDown) return;
  const isWin = process.platform === 'win32';
  console.log(`${C_MAGENTA}[FRONTEND]${C_RESET} Starting Vite frontend on http://localhost:5173...`);

  frontendProcess = isWin
    ? spawn('cmd.exe', ['/d', '/s', '/c', 'npm run dev:vite'], {
        cwd: frontendDir,
        env: { ...process.env, FORCE_COLOR: 'true' },
        windowsHide: true,
      })
    : spawn('npm', ['run', 'dev:vite'], {
        cwd: frontendDir,
        env: { ...process.env, FORCE_COLOR: 'true' },
      });

  prefixStream(frontendProcess.stdout, C_MAGENTA, 'FRONTEND');
  prefixStream(frontendProcess.stderr, C_MAGENTA, 'FRONTEND');

  frontendProcess.on('error', (err) => {
    console.error(`${C_RED}[FRONTEND ERROR]${C_RESET} Failed to start frontend: ${err.message}`);
  });

  frontendProcess.on('exit', (code, signal) => {
    if (isShuttingDown) return;
    console.log(`${C_YELLOW}[FRONTEND]${C_RESET} Frontend process exited (code: ${code ?? 'N/A'}, signal: ${signal ?? 'N/A'}). Auto-restarting in 1.5s...`);
    setTimeout(() => {
      if (!isShuttingDown) startFrontend();
    }, 1500);
  });
}

// Start both services
startBackend();
startFrontend();

// ── Keep Node.js Event Loop Alive Indefinitely ────────────────────────────────
setInterval(() => {}, 1000 * 60 * 60);

// ── Protect Against Unhandled Errors ──────────────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error(`${C_RED}[SYSTEM ERROR] Uncaught exception:${C_RESET}`, err.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.error(`${C_RED}[SYSTEM ERROR] Unhandled rejection:${C_RESET}`, reason);
});

// ── Graceful Shutdown Handler (Only Triggered When Explicitly Confirmed) ───────
function shutdown(signal = 'MANUAL') {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n${C_YELLOW}[SYSTEM] User confirmed stop (${signal}). Shutting down FinTech AI (Backend & Frontend)...${C_RESET}`);

  if (backendProcess && backendProcess.pid) {
    killProcessTree(backendProcess.pid);
  }
  if (frontendProcess && frontendProcess.pid) {
    killProcessTree(frontendProcess.pid);
  }

  console.log(`${C_GREEN}[SYSTEM] All services stopped cleanly. Bye!${C_RESET}\n`);
  process.exit(0);
}

// ── Anti-Shutdown Shield ──────────────────────────────────────────────────────
// When child processes like Uvicorn reload, Windows console passes Ctrl+C events
// to all processes in the group. We ignore single spurious reload signals and only
// shut down if a real interactive user presses Ctrl+C twice within 1.5s or types 'exit'.
let sigintCount = 0;
let sigintTimer = null;

process.on('SIGINT', () => {
  // If running non-interactively (e.g. background task, IDE worker), NEVER shut down on SIGINT!
  if (!process.stdin.isTTY) {
    console.log(`${C_GRAY}[SYSTEM] Reload/background signal received; keeping services running continuously.${C_RESET}`);
    return;
  }

  sigintCount++;
  if (sigintCount === 1) {
    console.log(`\n${C_YELLOW}[SYSTEM] Press Ctrl+C again within 1.5s to confirm server shutdown.${C_RESET}`);
    sigintTimer = setTimeout(() => {
      sigintCount = 0;
    }, 1500);
  } else {
    clearTimeout(sigintTimer);
    shutdown('Double Ctrl+C');
  }
});

process.on('SIGTERM', () => {
  // If explicitly killed via task manager or IDE stop button
  shutdown('SIGTERM');
});

// Listen for keyboard commands if TTY is open
if (process.stdin.isTTY) {
  try {
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (data) => {
      const cmd = data.trim().toLowerCase();
      if (cmd === 'exit' || cmd === 'quit' || cmd === 'q' || cmd === 'stop') {
        shutdown(`User typed '${cmd}'`);
      }
    });
  } catch (_) {}
}
