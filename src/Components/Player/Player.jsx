import React, { useRef, useEffect, useContext } from "react";
import PlayersContext from "../../Context";
import { Waveform } from "../../Wave.ts";
import { NumInput } from "../NumInput/NumInput"

export function Player({playerWave, BPM, playingID}) {
  const canvasRef = useRef(null)
  const { players, setPlayers } = useContext(PlayersContext)


  useEffect(() => {
    const wave = new Waveform(44100, canvasRef.current)
    wave.setWaveform(playerWave.waveform)
    wave.update()
  }, [playerWave.waveform])

  function handleStepsWrapper(steps) {
    handleSteps(playerWave.id, + steps)
  }
  
  function deletePlayer(id) {
    const index = players.findIndex(player => player.id === id)
    const newPlayers = players
    newPlayers.splice(index, 1)
    setPlayers([...newPlayers])
  }


  function handleSteps(id, steps) {
    const index = players.findIndex(player => player.id === id)
    const newPlayers = players
    newPlayers[index].steps = steps;
    setPlayers([...newPlayers])
  }

  function handleLabel(id, label) {
    const index = players.findIndex(player => player.id === id)
    const newPlayers = players
    newPlayers[index].label = label;
    setPlayers([...newPlayers])
  }

 

  return (
    <div className={`border border-gray-200 rounded-md flex flex-col w-min ${playingID === playerWave.id ? "outline outline-2 outline-blue-600" : ""}`}>
        <div className='mx-4 mt-4 border-b border-gray-200'>
           <div>
              <input onChange={handleLabel} className="absolute -translate-y-2" value={playerWave.label} type="text"></input>
            </div>
          <canvas ref={canvasRef} width="200" height="100"></canvas>
        </div>
        <div className="flex items-center justify-between">
          <div className='flex m-3 items-center'>
            <button onClick={()=>playerWave.play(playerWave.steps, BPM)} className="w-8 h-8 flex items-center justify-center bg-blue-500 rounded-md px-2 text-gray-100 mr-1 hover:bg-blue-600 active:scale-[0.99]" title="play">
              <svg fill="#F2F2F5" className="w-4" xmlns="http://www.w3.org/2000/svg" width="31.499" height="36.001" viewBox="0 0 31.499 36.001">
                <path id="Icon_awesome-play" data-name="Icon awesome-play" d="M29.841,15.1,5.091.464A3.356,3.356,0,0,0,0,3.368V32.625a3.372,3.372,0,0,0,5.091,2.9L29.841,20.9a3.372,3.372,0,0,0,0-5.808Z" transform="translate(0 -0.002)" />
              </svg>
            </button>
            
            <div className="flex">
              <label htmlFor="steps">Steps: </label>
              <NumInput value={playerWave.steps} onChange={handleStepsWrapper} min={0} step={0.5}></NumInput>
            </div>
          </div>
          <button onClick={()=>deletePlayer(playerWave.id)} className='mr-3 w-8 h-8 flex justify-center items-center bg-slate-500 hover:bg-slate-600 px-2 rounded-md'>
            
              <svg fill="white" className='w-4 scale-90' xmlns="http://www.w3.org/2000/svg" width="19.406" height="27" viewBox="0 0 19.406 27">
            <g id="Icon_ionic-ios-trash" data-name="Icon ionic-ios-trash" transform="translate(-8.297 -4.5)">
              <path id="Path_4" data-name="Path 4" d="M9.359,9l1.659,20.44a2.059,2.059,0,0,0,2.06,2.06h9.914a2.059,2.059,0,0,0,2.06-2.06L26.691,9ZM13.69,27.633,13.219,11.25h1.3L15,27.633Zm4.943,0H17.367V11.25h1.266Zm3.677,0H21L21.48,11.25h1.3Z"/>
              <path id="Path_5" data-name="Path 5" d="M25.594,6.469H23.063L21.213,4.852a1.425,1.425,0,0,0-.928-.352H15.729a1.448,1.448,0,0,0-.942.352L12.938,6.469H10.406C9.169,6.469,8.3,7.059,8.3,8.3H27.7C27.7,7.059,26.831,6.469,25.594,6.469Z"/>
            </g>
          </svg>

          </button>
        </div>
    </div>
  )
}
