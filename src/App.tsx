import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

interface Inputs {
    tempoA: number
    tempoB: number
    timeSigA: number
    timeSigB: number
    loopLength: number
    repeats: number
    tolerance: number
}

interface Results {
    newTempo: number
    measure: number
    repeats: number
}

function calculateTempo(inputs: Inputs) {
    let tempoDiff = inputs.tempoB / inputs.tempoA
    const timeLengthDiff = inputs.timeSigA / (inputs.loopLength * inputs.timeSigB)
    const tempoLowBound = inputs.tempoB * (1 - inputs.tolerance)
    const tempoHighBound = inputs.tempoB * (1 + inputs.tolerance)
    const viableJunctions: Results[] = []

    const getSectionEnd = (tempoDifference: number) => {
        return Math.floor(inputs.repeats / (timeLengthDiff * tempoDifference))
    }

    const sectionEnd = getSectionEnd(tempoDiff)

    for (let i = 1; i <= sectionEnd; i++){
        tempoDiff = 1 / (timeLengthDiff * i)
        const newTempo = inputs.tempoA * tempoDiff
        if (tempoDiff >= tempoLowBound && tempoDiff <= tempoHighBound) {
            viableJunctions.push({
                newTempo: newTempo,
                measure: i,
                repeats: Math.floor(getSectionEnd(tempoDiff) / i)
            })
        }
    }
    return viableJunctions
}

function App() {
    const [count, setCount] = useState(0)
    const [inputs, setInputs] = useState({
        tempoA: 120,
        tempoB: 90,
        timeSigA: 1,
        timeSigB: 1,
        loopLength: 4,
        repeats: 4,
        tolerance: .05
    })
    const [results, setResults] = useState([{}])

    const handleChange = (event) => {
        setInputs({
            ...inputs,
            [event.target.name]: event.target.value,
        })
    }

    const handleButton = (event) => {
        setResults(calculateTempo(inputs))
    }

  return (
    <>

      <h1>Tempo Overlap Calculator</h1>
      <div className="card">
          <form>
              <label htmlFor={"tempoA"}>Tempo A: </label>
              <input type="text" onChange={handleChange} value={inputs.tempoA} size={5} id={"tempoA"}/>
              <label htmlFor={"tempoA"}>bpm</label><br/>

              <label htmlFor={"tempoB"}>Tempo B: </label>
              <input type="text" onChange={handleChange} value={inputs.tempoB} size={5} id={"tempoB"}/>
              <label htmlFor={"tempoB"}>bpm</label><br/>

              <label htmlFor={"loopLength"}>Loop Length: </label>
              <input type="text" onChange={handleChange} value={inputs.loopLength} size={5} id={"loopLength"}/>
              <label htmlFor={"loopLength"}>measures</label><br/>

              <label htmlFor={"repeats"}>Repeats: </label>
              <input type="text" onChange={handleChange} value={inputs.repeats} size={5} id={"repeats"}/><br/>

              <label htmlFor={"tolerance"}>Change Tolerance +-: </label>
              <input type="text" onChange={handleChange} value={inputs.tolerance} size={5} id={"tolerance"}/>
              <label htmlFor={"tolerance"}>%</label><br/>


          </form>
          <button onClick={() => setCount((count) => count + 1)}>
              count is {count}
          </button>
          <p>
              Edit <code>src/App.tsx</code> and save to test HMR
          </p>
      </div>
        <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
