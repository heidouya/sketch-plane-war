/**
 * WebAudio 合成音效：不依赖任何音频素材，全部用振荡器 + 噪点实时生成。
 * 浏览器要求首次用户手势后才能出声，所以统一走 unlock()。
 */
class Sound {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.noiseBuffer = null;
  }

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.62;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  setMuted(v) {
    this.muted = Boolean(v);
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.62;
  }

  noise(dur = 0.2) {
    if (!this.noiseBuffer) {
      const len = Math.floor(this.ctx.sampleRate * 0.7);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noiseBuffer = buf;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    src.start(0);
    src.stop(this.ctx.currentTime + dur);
    return src;
  }

  tone({ freq = 440, to = null, dur = 0.1, type = 'sine', gain = 0.12, delay = 0 }) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  burst({ dur = 0.25, gain = 0.2, freq = 900, type = 'lowpass', attack = 0.01 }) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    const src = this.noise(dur);
    const filter = this.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(freq, t0);
    filter.frequency.exponentialRampToValueAtTime(Math.max(80, freq * 0.25), t0 + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter).connect(g).connect(this.master);
  }

  play(name) {
    if (!this.ctx || this.muted) return;
    switch (name) {
      case 'shoot':
        this.tone({ freq: 660, to: 320, dur: 0.055, type: 'square', gain: 0.035 });
        break;
      case 'enemyShoot':
        this.tone({ freq: 240, to: 150, dur: 0.08, type: 'triangle', gain: 0.05 });
        break;
      case 'hit':
        this.burst({ dur: 0.05, gain: 0.08, freq: 2600, type: 'highpass' });
        break;
      case 'explode':
        this.burst({ dur: 0.32, gain: 0.22, freq: 1100 });
        this.tone({ freq: 110, to: 55, dur: 0.28, type: 'triangle', gain: 0.1 });
        break;
      case 'bigExplode':
        this.burst({ dur: 0.6, gain: 0.3, freq: 900 });
        this.tone({ freq: 70, to: 38, dur: 0.6, type: 'sawtooth', gain: 0.14 });
        break;
      case 'powerup':
        this.tone({ freq: 620, to: 760, dur: 0.12, type: 'sine', gain: 0.1 });
        this.tone({ freq: 900, to: 1200, dur: 0.16, type: 'sine', gain: 0.09, delay: 0.1 });
        break;
      case 'shield':
        this.tone({ freq: 320, to: 640, dur: 0.3, type: 'sine', gain: 0.11 });
        break;
      case 'bomb':
        this.burst({ dur: 0.8, gain: 0.32, freq: 700 });
        this.tone({ freq: 60, to: 30, dur: 0.7, type: 'sine', gain: 0.16 });
        break;
      case 'boss':
        this.tone({ freq: 300, to: 130, dur: 1.1, type: 'sawtooth', gain: 0.1 });
        this.tone({ freq: 240, to: 100, dur: 1.1, type: 'square', gain: 0.05, delay: 0.12 });
        break;
      case 'clear':
        [523, 659, 784, 1046].forEach((f, i) => {
          this.tone({ freq: f, dur: 0.24, type: 'sine', gain: 0.09, delay: i * 0.13 });
        });
        break;
      case 'over':
        this.tone({ freq: 300, to: 120, dur: 0.9, type: 'triangle', gain: 0.12 });
        break;
      case 'ui':
        this.tone({ freq: 420, to: 480, dur: 0.06, type: 'triangle', gain: 0.06 });
        break;
      default:
        break;
    }
  }
}

export const sfx = new Sound();
