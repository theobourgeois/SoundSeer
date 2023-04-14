import React from "react";

const SIZE = 1024 as const;

enum WAVE_TYPE {
    TRIANGLE =  "triangle",
    SQUARE = "square",
    SINE = "sine",
    SAWTOOTH = "sawtooth"
}

interface Wave  {
    freq: number;
    type: WAVE_TYPE
}


export class Waveform {
    sampleRate : number;
    waveform : Float32Array;
    canvas: HTMLCanvasElement | React.MutableRefObject<null> | null;
    undoStack: Wave[];
    waves: Wave[];

    constructor(sampleRate: number, canvas : HTMLCanvasElement | React.MutableRefObject<null> | null) {
        this.canvas = canvas;
        this.sampleRate = sampleRate;
        this.waveform = new Float32Array(SIZE);
        this.undoStack = [];     
        this.waves = [];
    }

    getWaveFunction(frequency: number, amplitude: number, type: WAVE_TYPE) {
        switch(type) {
            case WAVE_TYPE.SINE:
              return (t : number) => { return amplitude * Math.sin(2 * Math.PI * frequency * t) };
            case WAVE_TYPE.SQUARE:
              return (t : number) => { return amplitude * (Math.sin(2 * Math.PI * frequency * t) >= 0 ? 1 : -1); };
            case WAVE_TYPE.TRIANGLE:
              return (t : number) => { return amplitude * (1 - 2 * Math.abs((frequency * t + 0.25) % 1 - 0.5)) };
            case WAVE_TYPE.SAWTOOTH:
              return (t : number) => { return amplitude * (2 * (frequency * t - Math.floor(frequency * t + 0.5)))};
            default:
              throw new Error(`Invalid wave type: ${type}`);
          } 
    }

    addWave(frequency: number, type: WAVE_TYPE, amplitude: number=0.1) {

        const wave = this.getWaveFunction(frequency, amplitude, type);
        
        for (let i = 0; i < SIZE; i++) {
            let t = i / this.sampleRate;
            this.waveform[i] += wave(t);
        }

        const waveInfo : Wave = {
            freq: frequency,
            type : type
        }
        this.waves.push(waveInfo)

    }

    async playAnimation(){
        const timer = ms => new Promise(res => setTimeout(res, ms));
        this.resetWaveform()
        for (let i = 0; i < this.waves.length; i++) {
            const frequency : number = this.waves[i].freq;
            const type : WAVE_TYPE = this.waves[i].type;
            const wave = this.getWaveFunction(frequency, 0.1, type);

            
            for (let i = 0; i < SIZE; i++) {
                let t = i / this.sampleRate;
                this.waveform[i] += wave(t);
            }
            this.update();
            await timer(100); 
        }
    }

    setWave(frequency : number, type: WAVE_TYPE, amplitude : number=0.1){
        const wave = this.getWaveFunction(frequency, amplitude, type);

        for (let i = 0; i < SIZE; i++) {
            let t = i / this.sampleRate;
            this.waveform[i] = wave(t);
        }

        const waveInfo : Wave = {
            freq: frequency,
            type : type
        }
        this.waves.push(waveInfo)

    }

    copyWaveform() {
        return this.waveform;
    }

    setWaveform(waveform) {
        this.waveform = waveform
    }

    resetWaveform() {
        this.waveform = new Float32Array(this.sampleRate)
        this.update()
    }

    undo(){
        if(this.waves.length === 0)  
            return
        const wave : Wave | undefined = this.waves.pop();
        if(wave)
            this.undoStack.push(wave);
        this.resetWaveform()

        this.addWavePriv();
        this.update()
    }

    redo() {
        if(this.undoStack.length === 0)  
            return
        const wave : Wave | undefined = this.undoStack.pop();
        if(wave)
            this.waves.push(wave);

        this.resetWaveform()
        this.addWavePriv();
        this.update()
    }
    
    getWaves() {
        return this.waves;
    }

    getUndoStack() {
        return this.undoStack;
    }

    addWavePriv() {
        for (let i = 0; i < this.waves.length; i++) {
            const frequency : number = this.waves[i].freq;
            const type : WAVE_TYPE = this.waves[i].type;
            const wave = this.getWaveFunction(frequency, 0.1, type);
        
            for (let i = 0; i < SIZE; i++) {
                let t = i / this.sampleRate;
                this.waveform[i] += wave(t);
            }
        }
    }

    update() {
        if(!this.canvas || !(this.canvas instanceof HTMLCanvasElement))
            throw new Error("Update must be called after window is loaded.");

        
        const context : CanvasRenderingContext2D | null = this.canvas.getContext("2d");

        if(!context || !(context instanceof CanvasRenderingContext2D))
            throw new Error("Update must be called after window is loaded.");


        const width = this.canvas.width;
        const height = this.canvas.height;

        context.clearRect(0, 0, width, height);

        context.strokeStyle = "black";
        context.lineWidth = 1;

        context.beginPath();
        let x = 0;
        let y = ((1 - this.waveform[0]) * (height)) / 2;
        context.moveTo(x, y);

        for (let i = 1; i < SIZE; i++) {
            x = i;
            y = ((1 - this.waveform[i]) * (height)) / 2;
            context.lineTo(x, y);
        }
        context.stroke();
    }




}

