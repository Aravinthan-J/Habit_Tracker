// ─── WAV generator ────────────────────────────────────────────────────────────

function writeU32(arr: number[], offset: number, v: number) {
    arr[offset]     = v & 0xff;
    arr[offset + 1] = (v >> 8)  & 0xff;
    arr[offset + 2] = (v >> 16) & 0xff;
    arr[offset + 3] = (v >> 24) & 0xff;
}

function writeU16(arr: number[], offset: number, v: number) {
    arr[offset]     = v & 0xff;
    arr[offset + 1] = (v >> 8) & 0xff;
}

function generateWav(freqHz: number, durationSec: number, sampleRate = 8000): Uint8Array {
    const n = Math.floor(sampleRate * durationSec);
    const buf: number[] = new Array(44 + n * 2).fill(0);

    // RIFF header
    [82, 73, 70, 70].forEach((b, i) => (buf[i] = b));     // "RIFF"
    writeU32(buf, 4, 36 + n * 2);
    [87, 65, 86, 69].forEach((b, i) => (buf[8 + i] = b)); // "WAVE"

    // fmt chunk
    [102, 109, 116, 32].forEach((b, i) => (buf[12 + i] = b)); // "fmt "
    writeU32(buf, 16, 16);
    writeU16(buf, 20, 1);              // PCM
    writeU16(buf, 22, 1);              // mono
    writeU32(buf, 24, sampleRate);
    writeU32(buf, 28, sampleRate * 2); // byte rate
    writeU16(buf, 32, 2);              // block align
    writeU16(buf, 34, 16);             // bits/sample

    // data chunk
    [100, 97, 116, 97].forEach((b, i) => (buf[36 + i] = b)); // "data"
    writeU32(buf, 40, n * 2);

    // Sine wave with fade-out envelope
    for (let i = 0; i < n; i++) {
        const t       = i / sampleRate;
        const fadeOut = 1 - t / durationSec;
        const raw     = Math.round(0.75 * fadeOut * 32767 * Math.sin(2 * Math.PI * freqHz * t));
        const s       = Math.max(-32768, Math.min(32767, raw));
        const u       = s < 0 ? s + 65536 : s;
        writeU16(buf, 44 + i * 2, u);
    }

    return new Uint8Array(buf);
}

// ─── Base64 encoder ───────────────────────────────────────────────────────────

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function toBase64(bytes: Uint8Array): string {
    let out = '';
    let i = 0;
    while (i < bytes.length) {
        const b0 = bytes[i++];
        const b1 = i < bytes.length ? bytes[i++] : 0;
        const b2 = i < bytes.length ? bytes[i++] : 0;
        out += B64[b0 >> 2];
        out += B64[((b0 & 3) << 4) | (b1 >> 4)];
        out += B64[((b1 & 15) << 2) | (b2 >> 6)];
        out += B64[b2 & 63];
    }
    const pad = bytes.length % 3;
    if (pad === 1) out = out.slice(0, -2) + '==';
    if (pad === 2) out = out.slice(0, -1) + '=';
    return out;
}

// ─── Sound cache ──────────────────────────────────────────────────────────────

const uriCache: Record<string, string> = {};

async function getSoundUri(name: string, freqHz: number, durationSec: number): Promise<string> {
    if (uriCache[name]) return uriCache[name];
    const wav    = generateWav(freqHz, durationSec);
    const base64 = toBase64(wav);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const FileSystem = require('expo-file-system') as typeof import('expo-file-system');
    const uri    = `${FileSystem.cacheDirectory}${name}.wav`;
    await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
    });
    uriCache[name] = uri;
    return uri;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Play a 3-tone ascending chime (C5 → E5 → G5) to signal timer completion.
 * Falls back silently if audio is unavailable.
 */
export async function playTimerComplete(): Promise<void> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { Audio } = require('expo-av') as typeof import('expo-av');
        await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
        });

        // Three ascending tones: C5 (523Hz), E5 (659Hz), G5 (784Hz)
        const tones: Array<[string, number]> = [
            ['chime_c5', 523],
            ['chime_e5', 659],
            ['chime_g5', 784],
        ];

        for (const [name, freq] of tones) {
            const uri = await getSoundUri(name, freq, 0.35);
            const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
            // Wait for tone to finish before playing the next
            await new Promise<void>((resolve) => {
                sound.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded && status.didJustFinish) {
                        sound.unloadAsync().finally(resolve);
                    }
                });
            });
        }
    } catch (err) {
        if (__DEV__) console.warn('[beepSound] playTimerComplete error:', err);
    }
}
