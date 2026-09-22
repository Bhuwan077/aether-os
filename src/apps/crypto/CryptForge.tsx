import React, { useState, useEffect, useRef } from 'react';
import {
  Key,
  Lock,
  Unlock,
  Hash,
  Image as ImageIcon,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Binary,
  Cpu
} from 'lucide-react';
import { sound } from '../../core/audio/soundEngine';
import {
  caesarEncrypt,
  caesarDecrypt,
  rot13,
  atbash,
  vigenereEncrypt,
  vigenereDecrypt,
  xorEncryptHex,
  xorDecryptHex
} from './engine/ciphers';
import { computeSha256, computeAvalanche, AvalancheResult } from './engine/hashes';
import { generateRsaKeys, rsaEncrypt, rsaDecrypt, RsaKeyPair } from './engine/rsa';
import {
  encodeMessageInImageData,
  decodeMessageFromImageData,
  generateSyntheticCarrier,
  getMaxStegoCapacity
} from './engine/steganography';

type Tab = 'ciphers' | 'hash' | 'rsa' | 'stego';

export const CryptForge: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('ciphers');

  // --- Classical Ciphers State ---
  const [cipherType, setCipherType] = useState<'caesar' | 'rot13' | 'atbash' | 'vigenere' | 'xor'>('caesar');
  const [cipherInput, setCipherInput] = useState<string>('Welcome to AetherOS Security Subsystem.');
  const [caesarShift, setCaesarShift] = useState<number>(7);
  const [vigenereKey, setVigenereKey] = useState<string>('CYBER');
  const [xorKey, setXorKey] = useState<string>('MATRIX');
  const [cipherMode, setCipherMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [copiedCipher, setCopiedCipher] = useState(false);

  // --- Hashing & Avalanche State ---
  const [hashInput1, setHashInput1] = useState<string>('AetherOS Quantum Kernel v3.0');
  const [hashInput2, setHashInput2] = useState<string>('AetherOS Quantum Kernel v3.1');
  const [avalanche, setAvalanche] = useState<AvalancheResult | null>(null);

  // --- RSA Studio State ---
  const [rsaKeys, setRsaKeys] = useState<RsaKeyPair | null>(null);
  const [rsaInput, setRsaInput] = useState<string>('SYNTH_KEY_99');
  const [rsaCipherData, setRsaCipherData] = useState<bigint[]>([]);
  const [rsaDecryptedText, setRsaDecryptedText] = useState<string>('');

  // --- Steganography State ---
  const [stegoPattern, setStegoPattern] = useState<'cyber' | 'gradient' | 'noise'>('cyber');
  const [stegoSecret, setStegoSecret] = useState<string>('Classified Operation: Project Aether');
  const [extractedSecret, setExtractedSecret] = useState<string | null>(null);
  const [stegoStatus, setStegoStatus] = useState<string>('Ready');
  const stegoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const carrierDataRef = useRef<Uint8ClampedArray | null>(null);

  // Initialize RSA
  useEffect(() => {
    try {
      const keys = generateRsaKeys();
      setRsaKeys(keys);
    } catch {}
  }, []);

  // Update Avalanche on input change
  useEffect(() => {
    try {
      const result = computeAvalanche(hashInput1, hashInput2);
      setAvalanche(result);
    } catch {}
  }, [hashInput1, hashInput2]);

  // Steganography Canvas Init
  useEffect(() => {
    const width = 120;
    const height = 120;
    const raw = generateSyntheticCarrier(width, height, stegoPattern);
    carrierDataRef.current = new Uint8ClampedArray(raw);

    const canvas = stegoCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imgData = ctx.createImageData(width, height);
        imgData.data.set(raw);
        ctx.putImageData(imgData, 0, 0);
      }
    }
    setExtractedSecret(null);
    setStegoStatus('Carrier buffer initialized.');
  }, [stegoPattern]);

  // Compute cipher output
  const computeCipherOutput = (): string => {
    if (cipherType === 'caesar') {
      return cipherMode === 'encrypt'
        ? caesarEncrypt(cipherInput, caesarShift)
        : caesarDecrypt(cipherInput, caesarShift);
    }
    if (cipherType === 'rot13') {
      return rot13(cipherInput);
    }
    if (cipherType === 'atbash') {
      return atbash(cipherInput);
    }
    if (cipherType === 'vigenere') {
      return cipherMode === 'encrypt'
        ? vigenereEncrypt(cipherInput, vigenereKey)
        : vigenereDecrypt(cipherInput, vigenereKey);
    }
    if (cipherType === 'xor') {
      return cipherMode === 'encrypt'
        ? xorEncryptHex(cipherInput, xorKey)
        : xorDecryptHex(cipherInput, xorKey);
    }
    return '';
  };

  const cipherOutput = computeCipherOutput();

  const handleCopyCipher = () => {
    navigator.clipboard.writeText(cipherOutput);
    setCopiedCipher(true);
    sound.playTone(880, 0.08, 'sine', 0.15);
    setTimeout(() => setCopiedCipher(false), 2000);
  };

  const handleRegenRsa = () => {
    sound.playTone(660, 0.08, 'sine', 0.2);
    const keys = generateRsaKeys();
    setRsaKeys(keys);
    setRsaCipherData([]);
    setRsaDecryptedText('');
  };

  const handleRsaEncrypt = () => {
    if (!rsaKeys) return;
    sound.playTone(520, 0.08, 'triangle', 0.2);
    const encrypted = rsaEncrypt(rsaInput, rsaKeys.e, rsaKeys.n);
    setRsaCipherData(encrypted);
  };

  const handleRsaDecrypt = () => {
    if (!rsaKeys || rsaCipherData.length === 0) return;
    sound.playTone(780, 0.08, 'sine', 0.2);
    const decrypted = rsaDecrypt(rsaCipherData, rsaKeys.d, rsaKeys.n);
    setRsaDecryptedText(decrypted);
  };

  const handleEmbedStego = () => {
    if (!carrierDataRef.current) return;
    sound.playTone(600, 0.08, 'sawtooth', 0.15);
    const width = 120;
    const height = 120;
    const carrier = { data: carrierDataRef.current, width, height };

    const success = encodeMessageInImageData(carrier, stegoSecret);
    if (success) {
      setStegoStatus(`Successfully embedded ${stegoSecret.length} bytes into LSB.`);
      const canvas = stegoCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const imgData = ctx.createImageData(width, height);
          imgData.data.set(carrier.data);
          ctx.putImageData(imgData, 0, 0);
        }
      }
    } else {
      setStegoStatus('Error: Payload exceeds maximum carrier capacity.');
    }
  };

  const handleExtractStego = () => {
    if (!carrierDataRef.current) return;
    sound.playTone(900, 0.1, 'sine', 0.2);
    const width = 120;
    const height = 120;
    const carrier = { data: carrierDataRef.current, width, height };
    const extracted = decodeMessageFromImageData(carrier);

    if (extracted !== null) {
      setExtractedSecret(extracted);
      setStegoStatus(`Extracted secret payload (${extracted.length} bytes).`);
    } else {
      setExtractedSecret(null);
      setStegoStatus('No valid embedded LSB payload detected in carrier.');
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold tracking-wide text-emerald-400">CryptForge</span>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            v3.2 Secure
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => { setActiveTab('ciphers'); sound.playTone(400, 0.04); }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
              activeTab === 'ciphers' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Ciphers
          </button>
          <button
            onClick={() => { setActiveTab('hash'); sound.playTone(450, 0.04); }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
              activeTab === 'hash' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            Avalanche
          </button>
          <button
            onClick={() => { setActiveTab('rsa'); sound.playTone(500, 0.04); }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
              activeTab === 'rsa' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            RSA Studio
          </button>
          <button
            onClick={() => { setActiveTab('stego'); sound.playTone(550, 0.04); }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
              activeTab === 'stego' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Steganography
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* --- TAB 1: Classical Ciphers --- */}
        {activeTab === 'ciphers' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="col-span-2">
                <label className="text-xs text-slate-400 block mb-1 font-mono">Algorithm</label>
                <div className="grid grid-cols-5 gap-1 text-xs">
                  {(['caesar', 'rot13', 'atbash', 'vigenere', 'xor'] as const).map((alg) => (
                    <button
                      key={alg}
                      onClick={() => setCipherType(alg)}
                      className={`py-1.5 px-2 rounded font-mono uppercase text-center transition-all ${
                        cipherType === alg
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {alg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-mono">Mode</label>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <button
                    onClick={() => setCipherMode('encrypt')}
                    className={`py-1.5 rounded text-center font-mono ${
                      cipherMode === 'encrypt' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Encrypt
                  </button>
                  <button
                    onClick={() => setCipherMode('decrypt')}
                    className={`py-1.5 rounded text-center font-mono ${
                      cipherMode === 'decrypt' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Decrypt
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-mono">
                  {cipherType === 'caesar' ? `Shift: ${caesarShift}` : cipherType === 'vigenere' ? 'Key' : cipherType === 'xor' ? 'XOR Key' : 'Fixed'}
                </label>
                {cipherType === 'caesar' && (
                  <input
                    type="range"
                    min="1"
                    max="25"
                    value={caesarShift}
                    onChange={(e) => setCaesarShift(Number(e.target.value))}
                    className="w-full accent-emerald-500 mt-2"
                  />
                )}
                {cipherType === 'vigenere' && (
                  <input
                    type="text"
                    value={vigenereKey}
                    onChange={(e) => setVigenereKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 px-2 py-1 text-xs rounded font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                )}
                {cipherType === 'xor' && (
                  <input
                    type="text"
                    value={xorKey}
                    onChange={(e) => setXorKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 px-2 py-1 text-xs rounded font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                )}
                {(cipherType === 'rot13' || cipherType === 'atbash') && (
                  <div className="text-xs text-slate-500 italic py-1 font-mono">Reciprocal cipher</div>
                )}
              </div>
            </div>

            {/* Input & Output */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-slate-400">Input Payload</span>
                <textarea
                  value={cipherInput}
                  onChange={(e) => setCipherInput(e.target.value)}
                  className="w-full h-44 bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-sm text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Enter plaintext or ciphertext here..."
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400">Processed Output</span>
                  <button
                    onClick={handleCopyCipher}
                    className="text-xs flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition"
                  >
                    {copiedCipher ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCipher ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={cipherOutput}
                  className="w-full h-44 bg-slate-900/50 border border-slate-800 rounded-xl p-3 font-mono text-sm text-emerald-300 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: SHA-256 & Avalanche Effect --- */}
        {activeTab === 'hash' && avalanche && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400">Payload A</label>
                <input
                  type="text"
                  value={hashInput1}
                  onChange={(e) => setHashInput1(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-cyan-400 font-mono block mb-1">SHA-256 Hash A:</span>
                  <code className="text-xs font-mono text-cyan-300 break-all">{avalanche.hash1}</code>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400">Payload B (Single Bit/Char Change)</label>
                <input
                  type="text"
                  value={hashInput2}
                  onChange={(e) => setHashInput2(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:border-amber-500 focus:outline-none"
                />
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-amber-400 font-mono block mb-1">SHA-256 Hash B:</span>
                  <code className="text-xs font-mono text-amber-300 break-all">{avalanche.hash2}</code>
                </div>
              </div>
            </div>

            {/* Avalanche Statistics */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Binary className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-semibold">Avalanche Effect Bit Diffusion</span>
                </div>
                <div className="text-xs font-mono">
                  <span className="text-emerald-400 font-bold">{avalanche.bitDiff}</span> / {avalanche.totalBits} bits flipped ({avalanche.bitDiffPercentage}%)
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 mb-4">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${avalanche.bitDiffPercentage}%` }}
                />
              </div>

              {/* 256-Bit Matrix Grid */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono">256-Bit Heatmap (Red = Flipped Bit, Blue = Unaltered Bit)</span>
                <div className="grid grid-cols-32 gap-1 p-2 bg-slate-950 rounded-lg border border-slate-900">
                  {avalanche.bitMap.map((flipped, idx) => (
                    <div
                      key={idx}
                      title={`Bit ${idx}: ${flipped ? 'FLIPPED' : 'UNCHANGED'}`}
                      className={`h-2 rounded-xs transition-colors ${
                        flipped ? 'bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.6)]' : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: RSA Studio --- */}
        {activeTab === 'rsa' && rsaKeys && (
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Key Information Bar */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-semibold">Modular Arithmetic Key Parameters</span>
                </div>
                <button
                  onClick={handleRegenRsa}
                  className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded text-xs font-mono transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Generate New Primes
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs font-mono">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">Prime p</span>
                  <span className="text-cyan-400 font-bold">{rsaKeys.p.toString()}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">Prime q</span>
                  <span className="text-cyan-400 font-bold">{rsaKeys.q.toString()}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">Modulus n (p*q)</span>
                  <span className="text-emerald-400 font-bold">{rsaKeys.n.toString()}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">Euler Phi φ(n)</span>
                  <span className="text-slate-300 font-bold">{rsaKeys.phi.toString()}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">Public (e)</span>
                  <span className="text-amber-400 font-bold">{rsaKeys.e.toString()}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">Private (d)</span>
                  <span className="text-rose-400 font-bold">{rsaKeys.d.toString()}</span>
                </div>
              </div>
            </div>

            {/* RSA Encryption/Decryption Live Playground */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-mono text-cyan-400 font-semibold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Public Key Encryption [c = m^e mod n]
                </span>
                <input
                  type="text"
                  value={rsaInput}
                  onChange={(e) => setRsaInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded text-xs font-mono text-slate-200"
                  placeholder="Secret message..."
                />
                <button
                  onClick={handleRsaEncrypt}
                  className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded text-xs font-semibold text-white transition"
                >
                  Encrypt with Public Key (e, n)
                </button>
                {rsaCipherData.length > 0 && (
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-xs text-amber-300 break-all max-h-24 overflow-y-auto">
                    Cipher Chunks: [{rsaCipherData.map((c) => c.toString()).join(', ')}]
                  </div>
                )}
              </div>

              <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-mono text-rose-400 font-semibold flex items-center gap-1">
                  <Unlock className="w-3.5 h-3.5" /> Private Key Decryption [m = c^d mod n]
                </span>
                <button
                  onClick={handleRsaDecrypt}
                  disabled={rsaCipherData.length === 0}
                  className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 rounded text-xs font-semibold text-white transition"
                >
                  Decrypt with Private Key (d, n)
                </button>
                {rsaDecryptedText && (
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-xs">
                    <span className="text-slate-500 block mb-1">Decrypted Plaintext:</span>
                    <span className="text-emerald-400 font-bold text-sm">{rsaDecryptedText}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: LSB Steganography --- */}
        {activeTab === 'stego' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <canvas
                  ref={stegoCanvasRef}
                  width={120}
                  height={120}
                  className="rounded-lg shadow-lg border border-slate-700 image-rendering-pixelated w-36 h-36"
                />
                <div className="flex gap-2">
                  {(['cyber', 'gradient', 'noise'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setStegoPattern(p)}
                      className={`text-[10px] px-2.5 py-1 rounded font-mono uppercase ${
                        stegoPattern === p ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <div className="text-[11px] font-mono text-slate-400 text-center">
                  Carrier: 120x120 RGBA
                  <br />
                  Capacity: {getMaxStegoCapacity(120, 120)} Bytes
                </div>
              </div>

              <div className="md:col-span-2 space-y-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <label className="text-xs font-mono text-slate-400 block">Secret Text to Conceal in LSB Bits</label>
                <textarea
                  value={stegoSecret}
                  onChange={(e) => setStegoSecret(e.target.value)}
                  className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 resize-none"
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleEmbedStego}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-semibold text-white transition font-mono flex items-center justify-center gap-1"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Embed in Pixels
                  </button>
                  <button
                    onClick={handleExtractStego}
                    className="flex-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded text-xs font-semibold text-white transition font-mono flex items-center justify-center gap-1"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    Extract from Pixels
                  </button>
                </div>

                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-xs">
                  <span className="text-slate-500 block mb-0.5">Status:</span>
                  <span className="text-slate-300">{stegoStatus}</span>
                  {extractedSecret && (
                    <div className="mt-2 pt-2 border-t border-slate-800">
                      <span className="text-emerald-400 block mb-0.5">Decoded Secret:</span>
                      <span className="text-white font-bold bg-emerald-950/60 px-2 py-1 rounded inline-block">
                        {extractedSecret}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
