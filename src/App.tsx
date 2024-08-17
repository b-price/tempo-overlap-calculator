import {FormEvent, useState} from 'react'
import { useForm, SubmitHandler } from "react-hook-form"
import './App.css'

interface Inputs {
    tempoA: string
    tempoB: string
    timeSigA: string[]
    timeSigB: string[]
    loopLength: string
    repeats: string
    tolerance: string
}

interface Results {
    newTempo: number
    measure: number
    repeats: number
}

function calculateTempo(inputs: Inputs) {
    let tempoDiff = inputs.tempoB / inputs.tempoA
    const timeLengthDiff = (inputs.timeSigA[0] / inputs.timeSigA[1]) / (inputs.loopLength * (inputs.timeSigB[0] / inputs.timeSigB[1]))
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
    const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>()
    const [inputs, setInputs] = useState({
        tempoA: '',
        tempoB: '',
        timeSigA: ['4', '4'],
        timeSigB: ['4', '4'],
        loopLength: '',
        repeats: '',
        tolerance: ''
    })
    const [results, setResults] = useState<Results[]>([])

    const handleChange = (event) => {
        setInputs({
            ...inputs,
            [event.target.id]: event.target.value,
        })
        console.log(inputs)
    }
    const handleTimeSig = (event) => {
        let input: string
        let value
        switch (event.target.id) {
            case "timeSigA_top":
                input = "timeSigA"
                value = [event.target.value, inputs.timeSigA[1]]
                break
            case "timeSigA_bot":
                input = "timeSigA"
                value = [inputs.timeSigA[0], event.target.value]
                break
            case "timeSigB_top":
                input = "timeSigB"
                value = [event.target.value, inputs.timeSigB[1]]
                break
            case "timeSigB_bot":
                input = "timeSigB"
                value = [inputs.timeSigB[0], event.target.value]
                break
            default:
                input = "timeSigA"
                value = [4,4]
                break
        }
        setInputs({
            ...inputs,
            [input]: value,
        })
    }

    const handleButton = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setResults(calculateTempo(inputs))
    }

    function TimeSig(props){
        return (
            <>
                <label htmlFor={props.name} className={"labels"}>{props.display}</label>
                <span id={"timeSig"}>
                    <input type="text" onChange={handleTimeSig} value={props.value[0]} size={3} id={`${props.name}_top`}
                           className={"inputs"}/>
                    <label htmlFor={"timeSigA"} className={"inputs"}>/</label>
                    <input type="text" onChange={handleTimeSig} value={props.value[1]} size={3} id={`${props.name}_bot`}
                       className={"inputs"}/>
                </span>
                <label htmlFor={"timeSigA"} className={"units"}></label>
            </>

        )
    }

    function Input(props) {
        return (
            <>
                <label htmlFor={props.name} className={"labels"}>{props.display}</label>
                <input type="text" onChange={handleChange} value={props.value} size={5} id={props.name}
                       className={"inputs"}/>
                <label htmlFor={props.name} className={"units"}>{props.units}</label>
            </>
        )
    }

    const resultDisplay = []

    if (results.length > 0) {
        console.log(results)
        results.forEach(result => {
            resultDisplay.push(
                <h3>Tempo: {result.newTempo} Temp.A Measure: {result.measure} #Repeats possible: {result.repeats}</h3>
            )
        })
    }
    else {
        resultDisplay.push(<h3>No viable overlaps!</h3>)
    }


    return (
        <>

            <h1>Tempo Overlap Calculator</h1>
            <div className="card">
                <form className={"form"} onSubmit={handleButton}>
                    {/*<Input name={"tempoA"} display={"Tempo A:"} value={inputs.tempoA} units={"bpm"}/>*/}
                    {/*<TimeSig name={"timeSigA"} display={"Time Signature A:"} value={inputs.timeSigA}/>*/}
                    {/*<Input name={"tempoB"} display={"Tempo B:"} value={inputs.tempoB} units={"bpm"}/>*/}
                    {/*<TimeSig name={"timeSigB"} display={"Time Signature B:"} value={inputs.timeSigB}/>*/}
                    {/*<Input name={"loopLength"} display={"Loop Length:"} value={inputs.loopLength} units={"measures"}/>*/}
                    {/*<Input name={"repeats"} display={"Repeats:"} value={inputs.repeats} units={"loop repetitions"}/>*/}
                    {/*<Input name={"tolerance"} display={"Change Tolerance +-:"} value={inputs.tolerance} units={"%"}/>*/}
                    <label htmlFor={"tempoA"} className={"labels"}>Tempo A: </label>
                    <input type="text" onChange={handleChange} value={inputs.tempoA} size={5} id={"tempoA"}
                           className={"inputs"} required onInvalid={}
                    />
                    <label htmlFor={"tempoA"} className={"units"}>bpm</label>

                    <label htmlFor={"timeSigA"} className={"labels"}>Time Sig. A: </label>
                    <span id={"timeSig"}>
                        <input type="text" onChange={handleTimeSig} value={inputs.timeSigA[0]} size={3}
                               id={"timeSigA_top"}
                               className={"inputs"}/>
                        <label htmlFor={"timeSigA"} className={"inputs"}>/</label>
                        <input type="text" onChange={handleTimeSig} value={inputs.timeSigA[1]} size={3}
                               id={"timeSigA_bot"}
                               className={"inputs"}/>
                    </span>

                    <label htmlFor={"timeSigA"} className={"units"}></label>


                    <label htmlFor={"tempoB"} className={"labels"}>Tempo B: </label>
                    <input type="text" onChange={handleChange} value={inputs.tempoB} size={5} id={"tempoB"}
                           className={"inputs"}/>
                    <label htmlFor={"tempoB"} className={"units"}>bpm</label>

                    <label htmlFor={"loopLength"} className={"labels"}>Loop Length: </label>
                    <input type="text" onChange={handleChange} value={inputs.loopLength} size={5} id={"loopLength"}
                           className={"inputs"}/>
                    <label htmlFor={"loopLength"} className={"units"}>measures</label>

                    <label htmlFor={"repeats"} className={"labels"}>Repeats: </label>
                    <input type="text" onChange={handleChange} value={inputs.repeats} size={5} id={"repeats"}
                           className={"inputs"}/>
                    <label htmlFor={"repeats"} className={"units"}></label>

                    <label htmlFor={"tolerance"} className={"labels"}>Tolerance +-: </label>
                    <input type="text" onChange={handleChange} value={inputs.tolerance} size={5} id={"tolerance"}
                           className={"inputs"}/>
                    <label htmlFor={"tolerance"} className={"units"}>%</label>

                    <button type={"submit"}>
                        Calculate
                    </button>
                </form>

                <h3>Viable Tempo(s):</h3>
                {resultDisplay}
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}

export default App
