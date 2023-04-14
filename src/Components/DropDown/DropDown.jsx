import React, {useEffect, useState } from 'react';
import ClickAwayListener from 'react-click-away-listener';
import { incrementID } from "../../Utils"

const idgen = incrementID()


function Option({option, onChange, dropdownIndex, setDropdownIndex, index}) {
    const [mouseEntered, setMouseEntered] = useState(false)

    function onMouseEnter(e) {
        if(mouseEntered)
            return

        if(setDropdownIndex)
            setDropdownIndex(index)
        
        setMouseEntered(true)
    }
    function onMouseLeave() {
        setMouseEntered(false)
    }

    return (
        <div>
            <ClickAwayListener onClickAway={onMouseLeave}>
                <div style={{display: option.branch && dropdownIndex === index ? "block" : "none", transform: "translateX(113px)"}} >
                    <BranchDropDown options={option.branch} onChange={onChange}></BranchDropDown>
                </div>
            </ClickAwayListener>
            <div onClick={()=>{if(!option.branch) onChange(option)}} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className="m-1 px-3 hover:bg-slate-200 flex items-center justify-between">
                <p>{option.name}</p>
                <svg style={{display: option.branch ? "block" : "none"}} className="ml-4 scale-75" xmlns="http://www.w3.org/2000/svg" width="9" height="18" viewBox="0 0 9 18">
                    <path id="Icon_ionic-md-arrow-dropright" data-name="Icon ionic-md-arrow-dropright" d="M13.5,9l9,9-9,9Z" transform="translate(-13.5 -9)"/>
                </svg>

            </div>
        </div>
    )

}

function BranchDropDown({options, onChange}) {
    if(!options)
        return

    

    return (
        <div>
            <div className="absolute bg-white w-max border  rounded-md cursor-pointer">
                {options.map((option)=>{
                    return (
                       <Option key={idgen.next().value} option={option} onChange={onChange}></Option> 
                    )
                })}
            </div>
        </div>
    )
}

export function DropDown({options, onChange, def=null, highlight=false}) {

    const [selectedOption, setSelectedOption] = useState(options[0]);
    const [opened, setOpened] = useState(false)
    const [dropdownIndex, setDropdownIndex] = useState(null)
    
    useEffect(()=>{
        if(def)
            setSelectedOption(def)
    }, [def])

    function selectOption(option) {
        setSelectedOption(option);
        onChange(option.value)
        toggleOpened();
    }

    function toggleOpened() {setOpened(!opened);}
   
    return (
        <ClickAwayListener onClickAway={()=>setOpened(false)}>

        <div>
            {/** OPENED DROPDOWN */}
            <div className="absolute z-40 bg-white w-max border  rounded-md cursor-pointer" style={{display: opened ? "block" : "none"}} >
                {options.map((option, index)=>{
                    return (
                       <Option key={idgen.next().value} index={index} dropdownIndex={dropdownIndex} setDropdownIndex={setDropdownIndex} option={option} onChange={selectOption}></Option> 
                    )
                })}
            </div>


            {/** CLOSED DROPDOWN */}
            <div className="h-8">
                <div className={`w-max h-max flex box-border items-center border rounded-md px-1 mx-1 cursor-pointer ${highlight ? "outline outline-2 outline-blue-600" : ""}`} onClick={toggleOpened}>
                    <p>{selectedOption.name}</p>
                    <svg className='w-3 ml-2' xmlns="http://www.w3.org/2000/svg" width="18" height="9" viewBox="0 0 18 9">
                        <path id="Icon_ionic-md-arrow-dropdown" data-name="Icon ionic-md-arrow-dropdown" d="M9,13.5l9,9,9-9Z" transform="translate(-9 -13.5)"/>
                    </svg>
                </div>
            </div>
        </div>

        </ClickAwayListener>
    )
   
}

export default DropDown