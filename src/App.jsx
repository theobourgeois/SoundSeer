import { WavePlayer } from './Components/WavePlayer/WavePlayer';
import { WaveEditor } from './Components/WaveEditor/WaveEditor';
import React, { useEffect, useRef, useState } from "react";
import { Waveform } from "./Wave.ts";
import PlayersContext from './Context';

function App() {
  const canvasRef = useRef(null)
  const [players, setPlayers] = useState([])
  const [waveform, setWaveform] = useState(null)

  useEffect(() => {
    const wave = new Waveform(44100, canvasRef.current)
    wave.setWave(0, 'sine')
    wave.update()
    setWaveform(wave)
  }, [])

  return (
    <PlayersContext.Provider value={{players, setPlayers}}>
      <div className="flex justify-center items-center flex-col" >
        <h1 className="my-4 text-6xl font-bold text-center">SoundSeer</h1>
        <div>
          <div className='flex justify-center items-center flex-col lg:flex-row'>
            <WaveEditor waveform={waveform}/>
            <div className='flex-1 bg-white ml-4 rounded-md border border-gray-200'>
              <canvas className=" flex justify-center w-full items-center" ref={canvasRef} width="600" height="400"></canvas>
            </div>
          </div>
          <WavePlayer />
        </div>
      </div>
    </PlayersContext.Provider>
  );
}

export default App;
