import React, { useState, useRef, useContext , useMemo, useEffect } from "react";
import DraggableNumInput from "../DraggableNumInput/DraggableNumInput"
import { Player } from '../Player/Player';
import PlayersContext from "../../Context";
import Modal from 'react-modal';
import { idgen, getFrequencyFromOctaveNote, playWaves } from "../../Utils"
import { Waveform } from "../../Wave.ts";

const modalStyles = {
  content: {
    width: "50%",
    height: "50%",
    margin: "auto",
    overflow: "hidden"
  }
};

function formatWave(wave, steps, label) {
  let formatted = "";
  wave.forEach(({ freq, type }) => {
    formatted += `${freq} ${type},`
  })
  formatted += ` ${steps}, ${label}\n`
  return formatted;
}


function deformatWave(formatted) {
  const tokens = formatted.split(",")
  let label = tokens.pop().trim()
  let steps;
  
  const hasNoLabel = !isNaN(parseFloat(label)) && isNaN(parseFloat(tokens[tokens.length-1].trim()))
  
  if(hasNoLabel) {
    steps = label
    label = "Wave"
  } else {
    steps = tokens.pop()
  }
  const deformatted = []

  tokens.forEach(token => {
    const subtoken = token.trim().split(" ");
    let freq = subtoken[0].toUpperCase()
    const type = subtoken[1] ? subtoken[1].toLowerCase() : 'sine'

    if(type)
      deformatted.push({
        freq, type
      })
  })
  return { steps, waves: deformatted, label }
}

export function WavePlayer() {
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const playButtonRef = useRef(null)
  const [loop, setLoop] = useState(false);
  const { players, setPlayers } = useContext(PlayersContext)
  const [dragPlayer, setDragPlayer] = useState(null)
  const [dragOverPlayer, setDragOverPlayer] = useState(null);
  const [BPM, setBPM] = useState(100);
  const BPMRef = useRef(BPM);
  const playing = useRef(false)
  const [playerPlaying, setPlayerPlaying] = useState(null) //id
  const draggableNumInputDragging = useRef(null);
  const [modalText, setModalText] = useState("")

  async function playPlayers() {
    const timer = ms => new Promise(res => setTimeout(res, ms));

    for (let i in players) {
      if (!playing.current) {
        playing.current = false
        setPlayerPlaying(null)
        return;
      }
      setPlayerPlaying(players[i].id)
      const timeMS = (60000 / BPMRef.current) * players[i].steps;
      players[i].play(players[i].steps, BPMRef.current)
      await timer(timeMS)
    }
    if (loop)
      return playPlayers();

    playing.current = false
    setPlayerPlaying(null)
  }

  useEffect(() => {
    setModalText(getPlayersText)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players])

  function handleModalText(e) {
    setModalText(e.target.value)
  }

  function saveModalText() {
    if(playing.current) {
      handleStop()
    }

    const newPlayers = []
    const formmatedLines = modalText.split("\n")

    for (let i = 0; i < formmatedLines.length; i ++) {
      const line = formmatedLines[i]
      const deformatted = deformatWave(line);
      const steps = deformatted.steps
      const waves = deformatted.waves
      const label = deformatted.label
      if (waves.length < 1)
        continue;
      const waveform = new Waveform(44100, null)
      const newWaves = []
      waves.forEach(wave => {
        const freq = getFrequencyFromOctaveNote(wave.freq)
        newWaves.push({freq: freq, type: wave.type})
        waveform.addWave(freq, wave.type)
      })

      const newPlayer = {
        label: label,
        steps: parseFloat(steps),
        waves: [...waves],
        id: idgen.next().value,
        waveform: [...waveform.copyWaveform()],
        play: (steps = 1, BPM = 100) => playWaves([...newWaves], steps, BPM)
      }

      newPlayers.push(newPlayer)
    }

    setPlayers([...newPlayers])

  }

  const getPlayersText = useMemo(() => {
    let playersStringify = ""
    for (let i = 0; i < players.length; i++) {
      const formatted = formatWave(players[i].waves, players[i].steps, players[i].label);
      playersStringify += formatted;
    }

    return playersStringify;
  }, [players])


  function toggleLoop() {
    setLoop(!loop)
  }

  function handleBPM(BPM) {
    BPMRef.current = BPM
    setBPM(BPM)
  }

  function handleDragStart(index) {
    setDragPlayer(index);
  }

  function handleDragEnter(index) {
    /** 
     * when dragging bpm slider along player, activates dragEnter function of player
     * ref draggableNumInputDragging.current track if bpm slider is being dragged
    */
    if (draggableNumInputDragging.current)
      return

    setDragOverPlayer(index);
  }

  function handleDragDrop() {
    let newPlayers = players;
    const dragItemContent = players[dragPlayer];
    newPlayers.splice(dragPlayer, 1);
    newPlayers.splice(dragOverPlayer, 0, dragItemContent);
    setDragPlayer(null);
    setDragOverPlayer(null);

    setPlayers([...newPlayers]);
  }

  function handlePlay() {
    if (playing.current === true)
      return;

    playing.current = true
    playPlayers()
  }
  function handleStop() {
    playing.current = false
  }
  function getPlaying() {
    return playing.current
  }

  function closeModal() {
    handleStop()
    setModalText(getPlayersText)
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (

    <div className="bg-white w-min lg:w-full sm:w-fit flex-col flex mx-auto h-full justify-center items-start my-4 p-4 rounded-md border border-gray-200">
      <Modal
        ariaHideApp={false}
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={modalStyles}
        contentLabel="Edit players"

      >
        <div className="flex flex-col select-none ">
            <div>
              <h1 className="text-2xl font-medium ml-2 mb-2">Edit Sounds</h1>
            </div>
            <div className="flex justify-between items-center select-none">
            <div onClick={saveModalText} className="cursor-pointer mb-4 text-white rounded-md p-2 hover:bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="27.007" height="27.007" viewBox="0 0 27.007 27.007">
                <path id="Icon_ionic-md-save" data-name="Icon ionic-md-save" d="M25.5,4.5H7.5a3,3,0,0,0-3,3v21a3,3,0,0,0,3,3h21a3.01,3.01,0,0,0,3-3v-18ZM18,28.5A4.5,4.5,0,1,1,22.5,24,4.5,4.5,0,0,1,18,28.5Zm4.5-15H7.5v-6h15Z" transform="translate(-4.5 -4.5)" />
              </svg>
            </div>
            <div onClick={closeModal} className="flex items-center justify-center cursor-pointer mb-4 text-white rounded-md p-2 hover:bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 27 27">
                <path id="Icon_ionic-md-exit" data-name="Icon ionic-md-exit" d="M15.15,23.4l2.1,2.1,7.5-7.5-7.5-7.5-2.1,2.1,3.9,3.9H4.5v3H18.975ZM28.5,4.5H7.5a3.009,3.009,0,0,0-3,3v6h3v-6h21v21H7.5v-6h-3v6a3.009,3.009,0,0,0,3,3h21a3.009,3.009,0,0,0,3-3V7.5A3.009,3.009,0,0,0,28.5,4.5Z" transform="translate(-4.5 -4.5)" />
              </svg>
            </div>
          </div>
        </div>
        <div className="w-full h-full rounded-sm">
          <textarea value={modalText} onChange={handleModalText} className="w-full border p-2 rounded-md resize-none h-[76%]"></textarea>
        </div>
      </Modal>
      <div className='flex justify-center items-center w-full'>
        <div className='mx-4 w-full'>

          <div className='flex items-center justify-between w-full'>
            <div className="flex items-center">
              <button ref={playButtonRef} onClick={handlePlay} className={`${!getPlaying() ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-300 cursor-default"} flex w-8 h-8 items-center justify-center  rounded-md px-2 text-gray-100 mr-1 active:scale-[0.99]`} title="play">
                <svg fill="#F2F2F5" className="w-4" xmlns="http://www.w3.org/2000/svg" width="31.499" height="36.001" viewBox="0 0 31.499 36.001">
                  <path id="Icon_awesome-play" data-name="Icon awesome-play" d="M29.841,15.1,5.091.464A3.356,3.356,0,0,0,0,3.368V32.625a3.372,3.372,0,0,0,5.091,2.9L29.841,20.9a3.372,3.372,0,0,0,0-5.808Z" transform="translate(0 -0.002)" />
                </svg>
              </button>
              <button onClick={handleStop} className="flex w-8 h-8 items-center justify-center bg-red-500 rounded-md px-2  text-gray-100 mr-1 hover:bg-red-600 active:scale-[0.99]" title="stop">
                <svg fill="#F2F2F5" xmlns="http://www.w3.org/2000/svg" width="31.5" height="31.5" viewBox="0 0 31.5 31.5">
                  <path id="Icon_awesome-stop" data-name="Icon awesome-stop" d="M28.125,2.25H3.375A3.376,3.376,0,0,0,0,5.625v24.75A3.376,3.376,0,0,0,3.375,33.75h24.75A3.376,3.376,0,0,0,31.5,30.375V5.625A3.376,3.376,0,0,0,28.125,2.25Z" transform="translate(0 -2.25)" />
                </svg>
              </button>
              <button onClick={toggleLoop} className={`${loop ? "bg-green-500 hover:bg-green-600" : "bg-green-300 hover:bg-green-400"} flex w-8 h-8 items-center justify-center rounded-md px-2  text-gray-100 mr-1 active:scale-[0.99]`} title="loop">
                <svg fill="white" xmlns="http://www.w3.org/2000/svg" width="24" height="33" viewBox="0 0 24 33">
                  <path id="Icon_material-loop" data-name="Icon material-loop" d="M18,6V1.5l-6,6,6,6V9a9.007,9.007,0,0,1,9,9,8.806,8.806,0,0,1-1.05,4.2l2.19,2.19A11.979,11.979,0,0,0,18,6Zm0,21a9.007,9.007,0,0,1-9-9,8.806,8.806,0,0,1,1.05-4.2L7.86,11.61A11.979,11.979,0,0,0,18,30v4.5l6-6-6-6Z" transform="translate(-6 -1.5)" />
                </svg>
              </button>
              <div className="flex items-center rounded-md p-1">
                <label className="mx-2 text-xl" htmlFor="BPM">BPM</label>
                <DraggableNumInput ref={draggableNumInputDragging} value={BPM} onChange={handleBPM} min={10} max={1000}></DraggableNumInput>
              </div>
            </div>
            <div>
              <button onClick={openModal} className="flex w-8 h-8 items-center justify-center  rounded-md px-2  text-gray-100 mr-1 active:scale-[0.99] bg-slate-500 hover:bg-slate-400" title="enter melody manualy">
                <svg className="scale-125" fill="white" xmlns="http://www.w3.org/2000/svg" width="27.007" height="16.172" viewBox="0 0 27.007 16.172">
                  <g id="Icon_ionic-ios-code" data-name="Icon ionic-ios-code" transform="translate(-4.5 -9.914)">
                    <path id="Path_8" data-name="Path 8" d="M23.344,10.034a.436.436,0,0,0-.288-.12.423.423,0,0,0-.288.12l-.97.928a.409.409,0,0,0,0,.6L28.533,18,21.8,24.434a.409.409,0,0,0,0,.6l.97.928a.423.423,0,0,0,.288.12.41.41,0,0,0,.288-.12l8.03-7.664a.409.409,0,0,0,0-.6Z" />
                    <path id="Path_9" data-name="Path 9" d="M14.344,11.264a.416.416,0,0,0-.134-.3l-.97-.928a.436.436,0,0,0-.288-.12.423.423,0,0,0-.288.12L4.634,17.7a.409.409,0,0,0,0,.6l8.03,7.664a.436.436,0,0,0,.288.12.41.41,0,0,0,.288-.12l.97-.928a.409.409,0,0,0,0-.6L7.474,18l6.736-6.434A.416.416,0,0,0,14.344,11.264Z" />
                  </g>
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>
      <div className='grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 justify-center'>
        {players.map((player, index) => {
          return (
            <div key={player.id} className='m-4 flex' onDragStart={() => handleDragStart(index)} onDragEnter={() => handleDragEnter(index)} onDragEnd={handleDragDrop} draggable>
              <Player playingID={playerPlaying} playerWave={player} BPM={BPM} />
              <div className="border-r border-2 border-blue-400 rounded-md absolute translate-x-[249px] h-[174px]" style={{ opacity: dragOverPlayer === index ? 100 : 0 }}></div>
            </div>
          )

        })}

      </div>
    </div>
  )
}
