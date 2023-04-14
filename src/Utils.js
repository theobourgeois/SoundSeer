export function* incrementID() {
    let id = 2;

    while (true) {
        yield id;
        id++;
    }
}
export const idgen = incrementID();

export function getFrequencyFromOctaveNote(octaveNote) {
    const octave = octaveNote.slice(-1);
    const note = octaveNote.slice(0, -1);
    return notes[note][octave];
}

export const notes = {
    C: [16.35, 32.7, 65.41, 130.81, 261.63, 523.25, 1046.5, 2093.0, 4186.01],
    "C#": [
        17.32, 34.65, 69.3, 138.59, 277.18, 554.37, 1108.73, 2217.46, 4434.92,
    ],
    D: [18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66, 2349.32, 4698.64],
    "D#": [
        19.45, 38.89, 77.78, 155.56, 311.13, 622.25, 1244.51, 2489.02, 4978.03,
    ],
    E: [20.6, 41.2, 82.41, 164.81, 329.63, 659.26, 1318.51, 2637.02],
    F: [21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83],
    "F#": [23.12, 46.25, 92.5, 185.0, 369.99, 739.99, 1479.98, 2959.96],
    G: [24.5, 49.0, 98.0, 196.0, 392.0, 783.99, 1567.98, 3135.96],
    "G#": [25.96, 51.91, 103.83, 207.65, 415.3, 830.61, 1661.22, 3322.44],
    A: [27.5, 55.0, 110.0, 220.0, 440.0, 880.0, 1760.0, 3520.0],
    "A#": [29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31],
    B: [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07],
};

export const chords = {
    major: {
        Cmaj: ["C", "E", "G"],
        "C#maj": ["C#", "F", "G#"],
        Dmaj: ["D", "F#", "A"],
        "D#maj": ["D#", "G", "A#"],
        Emaj: ["E", "G#", "B"],
        Fmaj: ["F", "A", "C"],
        "F#maj": ["F#", "A#", "C#"],
        Gmaj: ["G", "B", "D"],
        "G#maj": ["G#", "C", "D#"],
        Amaj: ["A", "C#", "E"],
        "A#maj": ["A#", "D", "F"],
        Bmaj: ["B", "D#", "F#"],
    },
    minor: {
        Cmin: ["C", "D#", "G"],
        "Cmin#": ["C#", "E", "G#"],
        Dmin: ["D", "F", "A"],
        "D#min": ["D#", "F#", "A#"],
        Emin: ["E", "G", "B"],
        Fmin: ["F", "G#", "C"],
        "F#min": ["F#", "A", "C#"],
        Gmin: ["G", "A#", "D"],
        "G#min": ["G#", "B", "D#"],
        Amin: ["A", "C", "E"],
        "A#min": ["A#", "C#", "F"],
        Bmin: ["B", "D", "F#"],
    },
    major7th: {
        Cmaj7: ["C", "E", "G", "B"],
        "C#maj7": ["C#", "F", "G#", "C"],
        Dmaj7: ["D", "F#", "A", "C#"],
        "D#maj7": ["D#", "G", "A#", "D"],
        Emaj7: ["E", "G#", "B", "D#"],
        Fmaj7: ["F", "A", "C", "E"],
        "F#maj7": ["F#", "A#", "C#", "F"],
        Gmaj7: ["G", "B", "D", "F#"],
        "G#maj7": ["G#", "C", "D#", "G"],
        Amaj7: ["A", "C#", "E", "G#"],
        "A#maj7": ["A#", "D", "F", "A"],
        Bmja7: ["B", "D#", "F#", "A#"],
    },
    minor7th: {
        Cmin7: ["C", "D#", "G", "A#"],
        "C#min7": ["C#", "E", "G#", "B"],
        Dmin7: ["D", "F", "A", "C"],
        "D#min7": ["D#", "F#", "A#", "C#"],
        Emin7: ["E", "G", "B", "D"],
        Fmin7: ["F", "G#", "C", "Eb"],
        "F#min7": ["F#", "A", "C#", "E"],
        Gmin7: ["G", "A#", "D", "F"],
        "G#min7": ["G#", "B", "D#", "G"],
        Amin7: ["A", "C", "E", "G"],
        "A#min7": ["A#", "C#", "F", "G#"],
        Bmin7: ["B", "D", "F#", "A"],
    },
};

export const chordsOption = [
    {
        name: "major",
        value: "major",
        branch: Object.entries(chords.major).map(([name, value]) => ({
            name,
            value,
        })),
    },
    {
        name: "minor",
        value: "minor",
        branch: Object.entries(chords.minor).map(([name, value]) => ({
            name,
            value,
        })),
    },
    {
        name: "major7th",
        value: "major7th",
        branch: Object.entries(chords.major7th).map(([name, value]) => ({
            name,
            value,
        })),
    },
    {
        name: "minor7th",
        value: "minor7th",
        branch: Object.entries(chords.minor7th).map(([name, value]) => ({
            name,
            value,
        })),
    },
];

export const notesOptions = [
    { name: "C", value: "C" },
    { name: "C#", value: "C#" },
    { name: "D", value: "F" },
    { name: "D#", value: "D#" },
    { name: "E", value: "E" },
    { name: "F", value: "F" },
    { name: "F#", value: "F#" },
    { name: "G", value: "G" },
    { name: "G#", value: "G#" },
    { name: "A", value: "A" },
    { name: "A#", value: "A#" },
    { name: "B", value: "B" },
];

export function getChordNameFromNotes(selectedNotes) {
    for (const categoryChords of Object.entries(chords)) {
        for (const [name, notes] of Object.entries(categoryChords)) {
            if (JSON.stringify(notes) === JSON.stringify(selectedNotes)) {
                return name.toString();
            }
        }
    }
}

export const audioContext = new (window.AudioContext ||
    window.webkitAudioContext)();

export async function playWaves(waves, steps = 1, BPM = 100) {
    const timeMS = (60000 / BPM) * steps; // 60,000 ms in 1 min

    for (const wave of waves) {
        const oscillator = audioContext.createOscillator();
        oscillator.type = wave.type;
        oscillator.frequency.value = wave.freq;

        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // set initial gain

        oscillator.connect(gainNode); // connect oscillator to gain node
        gainNode.connect(audioContext.destination);

        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 1
        ); // adjust ramp time as needed

        oscillator.stop(audioContext.currentTime + timeMS / 1000); // stop after specified time

        await new Promise((resolve) => setTimeout(resolve, 5));
    }
}

const exports = {
    idgen,
    notes,
    notesOptions,
    chords,
    chordsOption,
    getChordNameFromNotes,
    getFrequencyFromOctaveNote,
    audioContext,
    playWaves,
    incrementID,
}

export default exports;


