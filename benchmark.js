import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('================================================================');
console.log('       MOIL AI PLATFORM - COMPREHENSIVE PERFORMANCE BENCHMARK   ');
console.log('================================================================\n');

// 1. Network / Server Latency Benchmark (HTTP Dev Server @ localhost:3000)
async function testServer() {
  const times = [];
  console.log('[1/4] Measuring HTTP Server Time to First Byte (TTFB)...');
  for (let i = 0; i < 10; i++) {
    const start = performance.now();
    try {
      const res = await fetch('http://localhost:3000/');
      await res.text();
      times.push(performance.now() - start);
    } catch (err) {
      console.error('Fetch error:', err.message);
    }
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  console.log(`  -> Average TTFB: ${avg.toFixed(2)}ms (Min: ${min.toFixed(2)}ms, Max: ${max.toFixed(2)}ms)`);
}

// 2. Production Bundle & Asset Size Audit
function auditBundle() {
  console.log('\n[2/4] Auditing Frontend Production Bundle Size (frontend/dist)...');
  const distDir = path.join(__dirname, 'frontend', 'dist', 'assets');
  if (!fs.existsSync(distDir)) {
    console.log('  Dist directory not found. Please build first.');
    return;
  }
  const files = fs.readdirSync(distDir);
  let totalBytes = 0;
  files.forEach(file => {
    const fullPath = path.join(distDir, file);
    const stat = fs.statSync(fullPath);
    totalBytes += stat.size;
    const sizeKb = (stat.size / 1024).toFixed(2);
    const isOverLimit = stat.size > 500 * 1024;
    console.log(`  • ${file.padEnd(35)} : ${sizeKb.padStart(8)} KB ${isOverLimit ? ' [CRITICAL: > 500KB LIMIT!]' : ''}`);
  });
  console.log(`  -> Total Bundle Size: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`);
}

// 3. Static JSON Data Payload Audit
function auditDataPayloads() {
  console.log('\n[3/4] Auditing Frontend JSON Data Feeds (frontend/src/data)...');
  const dataDir = path.join(__dirname, 'frontend', 'src', 'data');
  if (!fs.existsSync(dataDir)) return;
  const files = fs.readdirSync(dataDir);
  let totalBytes = 0;
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const fullPath = path.join(dataDir, file);
      const stat = fs.statSync(fullPath);
      totalBytes += stat.size;
      console.log(`  • ${file.padEnd(25)} : ${(stat.size / 1024).toFixed(2).padStart(8)} KB`);
    }
  });
  console.log(`  -> Total JSON In-Memory Data: ${(totalBytes / 1024).toFixed(2)} KB`);
}

// 4. Computation / Scenario Simulation Benchmark
function benchmarkSimulation() {
  console.log('\n[4/4] Benchmarking Simulator Calculation Throughput...');
  const modelMetrics = JSON.parse(fs.readFileSync(path.join(__dirname, 'frontend', 'src', 'data', 'modelMetrics.json')));
  const forecastResults = JSON.parse(fs.readFileSync(path.join(__dirname, 'frontend', 'src', 'data', 'forecastResults.json')));

  const { coef_month, coef_rainfall, coef_downtime, intercept, safe_threshold_tons } = modelMetrics.forecasting;
  const baseRainfall = [80, 220, 260, 140, 45, 10];
  const baseDowntime = [45, 55, 60, 50, 40, 35];

  function runSim(simRain, simMaint, simOvertime) {
    return forecastResults.map((row, idx) => {
      const rain = Math.max(0, baseRainfall[idx] + simRain);
      const down = Math.max(0, baseDowntime[idx] - simMaint);
      const rawPred = intercept + (coef_month * row.month) + (coef_rainfall * rain) + (coef_downtime * down) + simOvertime;
      return Math.round(rawPred);
    });
  }

  const iterations = 100000;
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    runSim(i % 100, i % 30, (i % 10) * 10);
  }
  const duration = performance.now() - start;
  const opsPerSec = Math.round((iterations / duration) * 1000);
  console.log(`  -> Executed ${iterations.toLocaleString()} scenario simulations in ${duration.toFixed(2)}ms`);
  console.log(`  -> Throughput: ${opsPerSec.toLocaleString()} calculations/sec (Highly optimized!)`);
}

async function runAll() {
  await testServer();
  auditBundle();
  auditDataPayloads();
  benchmarkSimulation();
  console.log('\n================================================================');
  console.log('                    BENCHMARK COMPLETE                          ');
  console.log('================================================================');
}

runAll();
