import React, { useContext, useEffect, useRef, useState } from "react";
import PlayersContext from "../../Context.js";
import WAVE_TYPE from "../../Enums.js"
import { Waveform } from "../../Wave.ts";
import DropDown from "../DropDown/DropDown"
import NumInput from "../NumInput/NumInput"
import { idgen, notes, notesOptions, chordsOption, getChordNameFromNotes, audioContext, playWaves } from "../../Utils"

export function WaveEditor({
    waveform
}) {
    const { players, setPlayers } = useContext(PlayersContext)
    const [freq, setFreq] = useState(523.25);
    const [type, setType] = useState(WAVE_TYPE.SINE);
    const [waves, setWaves] = useState([])
    const [redoQueue, setRedoQueue] = useState([])
    const [undoStack, setUndoStack] = useState([])
    const [octave, setOctave] = useState(5)
    const previewCanvasRef = useRef(null)
    const [previewWaveform, setPreviewWaveform] = useState(null)
    const [note, setNote] = useState("C")
    const [chord, setChord] = useState(["C", "E", "G"]) // c major
    const [chordEnabled, setChordEnabled] = useState(false)
    const [noteEnabled, setNoteEnabled] = useState(true)
    const animateRef = useRef(null)

    useEffect(() => {
        const preview = new Waveform(44100, previewCanvasRef.current)
        preview.setWave(523.25, WAVE_TYPE.SINE)
        preview.update()
        setPreviewWaveform(preview)
    }, [])

    function addWave(){
        if (animateRef.current.disabled)
        return
        if (chordEnabled)
            return addChord()

        const newWaves = waves;
        const newUndoStack = undoStack;
        newUndoStack.push({ freq, type })
        newWaves.push({ freq, type })
        setWaves([...newWaves])
        setUndoStack([...newUndoStack])

        waveform.addWave(freq, type);
        waveform.update()
    }

    function addChord() {
        const newWaves = waves;
        chord.forEach(note => {
            const noteFreq = notes[note][octave]


            newWaves.push({ freq: noteFreq, type })
            waveform.addWave(noteFreq, type);
        })

        setWaves([...newWaves])

        waveform.update()

    }

    function setWave() {
        if (animateRef.current.disabled)
            return
        if (chordEnabled)
            return setChordWave()

        setWaves([{ freq, type }])

        waveform.setWave(freq, type);
        waveform.update()
    }

    function setChordWave() {
        const newWaves = [];

        waveform.setWave(0, type);
        chord.forEach(note => {
            const noteFreq = notes[note][octave]

            newWaves.push({ freq: noteFreq, type })
            waveform.addWave(noteFreq, type);
        })

        setWaves([...newWaves])
        waveform.update()
    }

    function handleFreq(e) {
        previewWaveform.setWave(e.target.value, type)
        previewWaveform.update()
        setFreq(e.target.value)
        setChordEnabled(false)
        setNoteEnabled(false)
    }

    function handleType(type) {
        setType(type)

        if (chordEnabled)
            return setPreviewWaveformChord(type)

        previewWaveform.setWave(freq, type)
        previewWaveform.update()
    }

    function handleNote(newNote) {
        if (animateRef.current.disabled)
            return
        setNote(newNote)
        setFreq(notes[newNote][octave])
        previewWaveform.setWave(notes[newNote][octave], type)
        previewWaveform.update()
        setNoteEnabled(true)
        setChordEnabled(false)
    }

    function setPreviewWaveformChord(waveType = type) {
        previewWaveform.setWave(0, waveType)
        chord.forEach(note => {
            previewWaveform.addWave(notes[note][octave], waveType)
        })
        previewWaveform.update()

    }

    function handleChord(chord) {
        if (animateRef.current.disabled)
            return

        setPreviewWaveformChord()
        setChordEnabled(true)
        setNoteEnabled(false)

        setChord(chord)
    }

    function handleOctave(octave) {
        if (animateRef.current.disabled)
            return
        let newOctave = octave

        let newFreq = notes[note][newOctave]
        setOctave(newOctave)

        if (chordEnabled)
            return setPreviewWaveformChord()

        setFreq(newFreq)
        previewWaveform.setWave(newFreq, type)
        previewWaveform.update()

    }

    function undo() {
        if (animateRef.current.disabled)
            return
        waveform.undo()

        const newUndoStack = undoStack;
        const newRedoQueue = redoQueue;
        newRedoQueue.unshift(newUndoStack.pop())

        setUndoStack([...newUndoStack])
        setRedoQueue([...newRedoQueue])
    }

    function redo() {
        if (animateRef.current.disabled)
            return
        waveform.redo()

        const newUndoStack = undoStack;
        const newRedoQueue = redoQueue;
        newUndoStack.push(newRedoQueue.shift())

        setUndoStack([...newUndoStack])
        setRedoQueue([...newRedoQueue])
    }

    async function play() {
        if (animateRef.current.disabled)
            return

        for (const wave of waves) {
            const oscillator = audioContext.createOscillator();
            oscillator.type = wave.type;
            oscillator.frequency.value = wave.freq;
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0.1;

            oscillator.connect(gainNode); // connect oscillator to gain node
            gainNode.connect(audioContext.destination);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 1); // stop after 1 second

            await new Promise(resolve => setTimeout(resolve, 5)); // pause for 5 milliseconds
        }
    }

    function addToPlayer(waves, waveform) {
        const newPlayers = players
        const newPlayer = {};
        newPlayer.id = idgen.next().value
        newPlayer.waveform = [...waveform.copyWaveform()]
        newPlayer.waves = waves.map(wave => {
            let freq = wave.freq;
            const freqArrays = Object.values(notes).flat();
            if (freqArrays.includes(freq)) {
              const note = Object.keys(notes).find(key => notes[key].includes(freq));
              const octave = Math.floor(Math.log2(freq / notes[note][0]));
              freq = note + octave;
            }
            return {
              freq,
              type: wave.type
            };
          });
        newPlayer.play = (steps = 1, BPM = 100) => playWaves([...waves], steps, BPM)
        newPlayer.steps = 1

        if(chordEnabled)
            newPlayer.label = getChordNameFromNotes(chord)
        else if(noteEnabled)
            newPlayer.label = note
        else
            newPlayer.label = "wave"
            
        newPlayers.push(newPlayer)
        setPlayers([...newPlayers])
    }

    
      

    function animate() {
        if (waves.length === 0)
            return;

        if (animateRef.current.disabled)
            return

        animateRef.current.disabled = true;
        waveform.playAnimation().then(() => {
            animateRef.current.disabled = false;
        })
    }
    function handleHotkeys(e) {
        const cmdctrl = e.ctrlKey || e.metaKey
        if (cmdctrl && !e.shiftKey && e.key === 'z') {
            undo();
        }
        if (cmdctrl && e.shiftKey && e.key === 'z') {
            redo()
        }
    }


    return (
        <div onKeyDown={handleHotkeys} className="select-none bg-white w-fit flex flex-col p-7 lg:mb-0 mb-4 rounded-md border border-gray-200">
            <div className="flex justify-center items-center">
                <canvas className="bg-white m-4" ref={previewCanvasRef}></canvas>
            </div>
            <div className="flex">
                <label className="font-bold">Frequency:&nbsp;</label>
                <p className="w-1/5 rounded-md" >{freq}</p>
                <input className="flex-1" value={freq} onChange={handleFreq} type="range" min="0" max="20000"></input>
            </div>

            <div className="flex">
                <div className="flex">
                    <label className="font-bold" htmlFor="notes">Notes: </label>
                    <DropDown options={notesOptions} onChange={handleNote} highlight={noteEnabled}></DropDown>
                </div>
                <div className="flex">
                    <DropDown options={chordsOption} onChange={handleChord} def={{ name: "CMaj", value: ["C", "E", "G"] }} highlight={chordEnabled}></DropDown>
                </div>
            </div>

            <div className="flex">
                <label className="font-bold" htmlFor="notes">Octave: </label>
                <NumInput value={octave} max={8} min={0} onChange={handleOctave}></NumInput>
            </div>


            <div className="flex h-12">
                <svg onClick={() => handleType(WAVE_TYPE.SINE)} className="cursor-pointer w-8 mr-2" fill={type === WAVE_TYPE.SINE ? "#3662E3" : "black"} version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 1000 1000">
                    <g><g transform="translate(0.000000,511.000000) scale(0.100000,-0.100000)"><path d="M360.1,3650c-104-30-172.1-86-218.1-182.1l-42-86V106.8c0-2736.9,4-3287.1,28-3341.1c32-78,122-164.1,198.1-192.1c40-16,1460.5-22,4677.6-22c3835.3,0,4631.5,4,4685.5,28c86,34,190.1,156,204.1,236.1c6,36,8,1538.5,6,3339.1l-6,3271.1l-54,82c-28,44-86,96-130,118c-74,38-196.1,38-4677.5,42C2018.6,3670,406.1,3664,360.1,3650z M3311.1,2843.7c776.2-164.1,1510.5-1130.4,1960.7-2582.9c250.1-806.3,516.2-1356.5,866.3-1790.6c156-194.1,316.1-326.1,504.2-416.2c140-68,162.1-72,342.1-72s198.1,4,350.1,78c312.1,154,648.2,554.2,922.3,1100.4c124,250.1,286.1,632.2,356.1,848.3l34,104h308.1c280.1,0,308.1-4,308.1-34c0-62-196.1-614.2-312.1-880.3C8504.8-1827.8,7934.6-2458,7302.4-2622.1c-158.1-40-466.2-44-620.2-8c-160.1,38-424.2,166.1-578.2,280.1C5547.8-1935.9,5031.6-1057.6,4709.5,22.8c-230.1,774.3-616.2,1504.5-986.3,1872.6c-356.1,354.1-702.2,432.1-1078.4,246.1c-430.1-212.1-896.3-916.3-1226.4-1858.6l-56-160.1l-312.1-6c-268.1-4-310.1,0-310.1,26c0,16,36,140,82,276.1c340.1,1016.3,850.3,1824.6,1386.5,2192.7c134,94,376.1,202.1,520.2,232.1C2892.9,2879.7,3141,2879.7,3311.1,2843.7z" /></g></g>
                </svg>
                <svg onClick={() => handleType(WAVE_TYPE.SQUARE)} className="cursor-pointer w-8 mr-2" fill={type === WAVE_TYPE.SQUARE ? "#3662E3" : "black"} version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 1000 1000">
                    <g><g transform="translate(0.000000,511.000000) scale(0.100000,-0.100000)"><path d="M360.1,3650c-104-30-172.1-86-218.1-182.1l-42-86V106.8c0-2736.9,4-3287.1,28-3341.1c32-78,122-164.1,198.1-192.1c40-16,1460.5-22,4677.6-22c3835.3,0,4631.5,4,4685.5,28c86,34,190.1,156,204.1,236.1c6,36,8,1538.5,6,3339.1l-6,3271.1l-54,82c-28,44-86,96-130,118c-74,38-196.1,38-4677.5,42C2018.6,3670,406.1,3664,360.1,3650z M5321.7,422.9v-2450.8h1660.6h1660.5v1070.4V114.8l316.1-6l314.1-6l6-1386.5l4-1384.5H6982.3H4681.5v2460.8v2460.8H3021H1360.4V1183.2V112.8h-320.1H720.2v1380.5v1380.5H3021h2300.8V422.9z" /></g></g>
                </svg>
                <svg onClick={() => handleType(WAVE_TYPE.TRIANGLE)} className="cursor-pointer w-8 mr-2" fill={type === WAVE_TYPE.TRIANGLE ? "#3662E3" : "black"} version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 1000 1000">
                    <g><g transform="translate(0.000000,511.000000) scale(0.100000,-0.100000)"><path d="M360.1,3650c-104-30-172.1-86-218.1-182.1l-42-86V106.8c0-2736.9,4-3287.1,28-3341.1c32-78,122-164.1,198.1-192.1c40-16,1460.5-22,4677.6-22c3835.3,0,4631.5,4,4685.5,28c86,34,190.1,156,204.1,236.1c6,36,8,1538.5,6,3339.1l-6,3271.1l-54,82c-28,44-86,96-130,118c-74,38-196.1,38-4677.5,42C2018.6,3670,406.1,3664,360.1,3650z M5001.6,543C6082-733.5,6972.3-1779.8,6980.3-1781.8c6-2,384.1,424.1,840.3,946.3l826.3,948.3h310.1c170,0,306.1-8,302.1-18c-10-30-2264.8-2742.9-2278.7-2742.9c-6,0-898.3,1044.4-1978.7,2320.8C3919.3,949.1,3029,1993.4,3021,1993.4c-6,0-382.1-422.1-832.3-940.3l-818.3-938.3l-318.1-2H734.2l48,60C976.3,420.9,3013,2869.7,3023,2867.7C3029,2865.7,3919.3,1819.4,5001.6,543z" /></g></g>
                </svg>
                <svg onClick={() => handleType(WAVE_TYPE.SAWTOOTH)} className="cursor-pointer w-8 mr-2" fill={type === WAVE_TYPE.SAWTOOTH ? "#3662E3" : "black"} version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 1000 1000">
                    <g><g transform="translate(0.000000,511.000000) scale(0.100000,-0.100000)"><path d="M360.1,3650c-104-30-172.1-86-218.1-182.1l-42-86V106.8c0-2736.9,4-3287.1,28-3341.1c32-78,122-164.1,198.1-192.1c40-16,1460.5-22,4677.6-22c3835.3,0,4631.5,4,4685.5,28c86,34,190.1,156,204.1,236.1c6,36,8,1538.5,6,3339.1l-6,3271.1l-54,82c-28,44-86,96-130,118c-74,38-196.1,38-4677.5,42C2018.6,3670,406.1,3664,360.1,3650z M3985.3,759l6-2116.7L5009.6,759L6028,2873.7h318.1h316.1l2-2124.7v-2126.7l80,160.1c44,88,488.2,1042.3,986.3,2120.7l906.3,1960.6l312.1,6c174.1,2,314.1-2,314.1-10c0-10-584.2-1254.4-1298.4-2766.9L6666.2-2658.1h-316.1H6032l-10,2116.7l-10,2114.7L4991.6-547.4L3971.3-2668.1h-314.1h-316.1l-4,2130.7l-6,2132.7L2346.7-531.4l-984.3-2126.7l-314.1-6c-292.1-4-312.1-2-302.1,30c8,34,2496.8,5317.8,2564.9,5447.8l32,60h318.1h320.1L3985.3,759z" /></g></g>
                </svg>
            </div>


            <div className="flex">
                <div className="flex flex-1">
                    <button onClick={addWave} className="bg-blue-600 py- rounded-md text-gray-100 mb-2 mr-1 flex-1 hover:bg-blue-700 active:scale-[0.99]">Add</button>
                    <button onClick={setWave} className="bg-blue-600 py-1  rounded-md mr-1 text-gray-100 mb-2 flex-1 hover:bg-blue-700 active:scale-[0.99]">Set</button>
                </div>
                <button onClick={() => addToPlayer(waves, waveform)} className="bg-green-600 py-1  rounded-md text-gray-100 mb-2 flex-1 hover:bg-green-700 active:scale-[0.99]">
                    <div className="flex justify-center items-center">
                        <p>Add to Player</p>
                    </div>
                </button>
            </div>



            <div className="flex">
                <button className="flex-1 flex items-center justify-center bg-slate-500 rounded-md px-2  text-gray-100 mr-1 hover:bg-slate-600 active:scale-[0.99]" title="play" onClick={play}>
                    <svg fill="#F2F2F5" className="w-4 mr-1" xmlns="http://www.w3.org/2000/svg" width="31.499" height="36.001" viewBox="0 0 31.499 36.001">
                        <path id="Icon_awesome-play" data-name="Icon awesome-play" d="M29.841,15.1,5.091.464A3.356,3.356,0,0,0,0,3.368V32.625a3.372,3.372,0,0,0,5.091,2.9L29.841,20.9a3.372,3.372,0,0,0,0-5.808Z" transform="translate(0 -0.002)" />
                    </svg>
                    <p className="">Play</p>
                </button>
                <button ref={animateRef} className="flex-1 flex items-center justify-center bg-slate-500 rounded-md px-2  text-gray-100 mr-1 hover:bg-slate-600 active:scale-[0.99]" title="play" onClick={animate}>
                    <svg fill="#F2F2F5" className="w-4 mr-1" xmlns="http://www.w3.org/2000/svg" width="31.499" height="36.001" viewBox="0 0 31.499 36.001">
                        <path id="Icon_awesome-play" data-name="Icon awesome-play" d="M29.841,15.1,5.091.464A3.356,3.356,0,0,0,0,3.368V32.625a3.372,3.372,0,0,0,5.091,2.9L29.841,20.9a3.372,3.372,0,0,0,0-5.808Z" transform="translate(0 -0.002)" />
                    </svg>
                    <p className="">Animate</p>
                </button>
                <button className="bg-slate-500 rounded-md px-2 text-gray-100 hover:bg-slate-600 active:scale-[0.99]" title="undo" onClick={undo}>
                    <svg fill="#F2F2F5" className="w-4" xmlns="http://www.w3.org/2000/svg" width="35.461" height="35.438" viewBox="0 0 35.461 35.438">
                        <path id="Icon_awesome-undo" data-name="Icon awesome-undo" d="M14.93,15.773H.844A.844.844,0,0,1,0,14.93V.844A.844.844,0,0,1,.844,0H4.219a.844.844,0,0,1,.844.844V6.336A17.437,17.437,0,1,1,6.316,30.922.845.845,0,0,1,6.283,29.7l2.388-2.388a.842.842,0,0,1,1.153-.037,12.375,12.375,0,1,0-1.8-16.561h6.91a.844.844,0,0,1,.844.844V14.93a.844.844,0,0,1-.844.844Z" />
                    </svg>
                </button>
                <button className="bg-slate-500 rounded-md px-2 text-gray-100 ml-1 hover:bg-slate-600 active:scale-[0.99]" title="redo" onClick={redo}>
                    <svg fill="#F2F2F5" className="w-4" xmlns="http://www.w3.org/2000/svg" width="35.461" height="35.438" viewBox="0 0 35.461 35.438">
                        <path id="Icon_awesome-redo" data-name="Icon awesome-redo" d="M35.179,0H31.846A.844.844,0,0,0,31,.884L31.283,6.7a17.438,17.438,0,1,0-1.6,24.241.844.844,0,0,0,.034-1.226l-2.391-2.391a.844.844,0,0,0-1.152-.039,12.375,12.375,0,1,1,2.1-16.194l-7.139-.342a.844.844,0,0,0-.884.844V14.93a.844.844,0,0,0,.844.844H35.179a.844.844,0,0,0,.844-.844V.844A.844.844,0,0,0,35.179,0Z" transform="translate(-0.563)" />
                    </svg>
                </button>

            </div>


        </div>
    )
}
