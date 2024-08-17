import { useState } from 'react'
import { useForm, SubmitHandler } from "react-hook-form"
import './App.css'

interface Inputs {
    tempoA: string
    tempoB: string
    timeSigATop: string
    timeSigABot: string
    timeSigBTop: string
    timeSigBBot: string
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
    let tempoDiff = parseFloat(inputs.tempoB) / parseFloat(inputs.tempoA)
    const timeLengthDiff =
        (parseInt(inputs.timeSigATop) / parseInt(inputs.timeSigABot)) /
        (parseInt(inputs.loopLength) * (parseInt(inputs.timeSigBTop) / parseInt(inputs.timeSigBBot)))
    const tempoLowBound = parseFloat(inputs.tempoB) * (1 - parseFloat(inputs.tolerance) / 100)
    const tempoHighBound = parseFloat(inputs.tempoB) * (1 + parseFloat(inputs.tolerance) / 100)
    const viableJunctions: Results[] = []

    const getSectionEnd = (tempoDifference: number) => {
        return Math.floor(parseInt(inputs.repeats) / (timeLengthDiff * tempoDifference))
    }

    const sectionEnd = getSectionEnd(tempoDiff)

    for (let i = 1; i <= sectionEnd; i++){
        tempoDiff = 1 / (timeLengthDiff * i)
        const newTempo = parseFloat(inputs.tempoA) * tempoDiff
        if (newTempo >= tempoLowBound && newTempo <= tempoHighBound) {
            viableJunctions.push({
                newTempo: newTempo,
                measure: i,
                repeats: Math.floor(getSectionEnd(tempoDiff) / i)
            })
        }
    }
    console.log(viableJunctions)
    return viableJunctions
}

function App() {
    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>()
    const onSubmit: SubmitHandler<Inputs> = data => setResults(calculateTempo(data))

    const [results, setResults] = useState<Results[]>([])


    function TimeSig(props){
        const topName: string = props.name + 'Top'
        const botName: string = props.name + 'Bot'
        return (
            <>
                <label htmlFor={props.name} className={"labels"}>{props.display}</label>
                <span id={"timeSig"}>
                    <input
                        type="text"
                        size={3}
                        id={topName}
                        className={"inputs"}
                        {...register(topName, { required: true, pattern: /^\d+$/ })}
                    />
                    <label htmlFor={"timeSigA"} className={"inputs"}>/</label>
                    <input
                        type="text"
                        size={3}
                        id={`${props.name}Bot`}
                        className={"inputs"}
                        {...register(botName, { required: true, pattern: /^\d+$/ })}
                    />
                </span>
            </>

        )
    }

    function Input(props) {
        return (
            <>
                <label htmlFor={props.name} className={"labels"}>{props.display}</label>
                <input
                    type="text"
                    size={5}
                    id={props.name}
                    className={"inputs"}
                    {...register(props.name, { required: true, pattern: /^\d+$/ })}
                />
                <label htmlFor={props.name} className={"units"}>{props.units}</label>
                {props.errors && <p>Only numbers allowed!</p>}
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
                <form className={"form"} onSubmit={handleSubmit(onSubmit)}>
                    <Input name={"tempoA"} display={"Tempo A:"} units={"bpm"} errors={errors.tempoA}/>
                    <TimeSig name={"timeSigA"} display={"Time Sig. A:"}/>
                    <Input name={"tempoB"} display={"Tempo B:"} units={"bpm"} errors={errors.tempoB}/>
                    <TimeSig name={"timeSigB"} display={"Time Sig. B:"}/>
                    <Input name={"loopLength"} display={"Loop Length:"} units={"measures"} errors={errors.loopLength}/>
                    <Input name={"repeats"} display={"Repeats:"} units={"loops"} errors={errors.repeats}/>
                    <Input name={"tolerance"} display={"Tolerance +-:"} units={"%"} errors={errors.tolerance}/>

                    {/*<label htmlFor={"tempoA"} className={"labels"}>Tempo A: </label>*/}
                    {/*<input*/}
                    {/*    type="text"*/}
                    {/*    size={5}*/}
                    {/*    id={"tempoA"}*/}
                    {/*    className={"inputs"}*/}
                    {/*    {...register("tempoA", { required: true, pattern: /^\d+$/ })}*/}
                    {/*/>*/}
                    {/*<label htmlFor={"tempoA"} className={"units"}>bpm</label>*/}

                    {/*<label htmlFor={"timeSigA"} className={"labels"}>Time Sig. A: </label>*/}
                    {/*<span id={"timeSig"}>*/}
                    {/*    <input*/}
                    {/*        type="text"*/}
                    {/*        size={3}*/}
                    {/*        id={"timeSigA_top"}*/}
                    {/*        className={"inputs"}*/}
                    {/*        {...register("timeSigATop", { required: true })}*/}
                    {/*    />*/}
                    {/*    <label htmlFor={"timeSigA"} className={"inputs"}>/</label>*/}
                    {/*    <input*/}
                    {/*        type="text"*/}
                    {/*        size={3}*/}
                    {/*        id={"timeSigA_bot"}*/}
                    {/*        className={"inputs"}*/}
                    {/*        {...register("timeSigABot", { required: true })}*/}
                    {/*    />*/}
                    {/*</span>*/}
                    {/*<label htmlFor={"timeSigA"} className={"units"}></label>*/}


                    {/*<label htmlFor={"tempoB"} className={"labels"}>Tempo B: </label>*/}
                    {/*<input*/}
                    {/*    type="text"*/}
                    {/*    size={5}*/}
                    {/*    id={"tempoB"}*/}
                    {/*    className={"inputs"}*/}
                    {/*    {...register("tempoB", { required: true })}*/}
                    {/*/>*/}
                    {/*<label htmlFor={"tempoB"} className={"units"}>bpm</label>*/}

                    {/*<label htmlFor={"loopLength"} className={"labels"}>Loop Length: </label>*/}
                    {/*<input type="text" onChange={handleChange} value={inputs.loopLength} size={5} id={"loopLength"}*/}
                    {/*       className={"inputs"}/>*/}
                    {/*<label htmlFor={"loopLength"} className={"units"}>measures</label>*/}

                    {/*<label htmlFor={"repeats"} className={"labels"}>Repeats: </label>*/}
                    {/*<input type="text" onChange={handleChange} value={inputs.repeats} size={5} id={"repeats"}*/}
                    {/*       className={"inputs"}/>*/}
                    {/*<label htmlFor={"repeats"} className={"units"}></label>*/}

                    {/*<label htmlFor={"tolerance"} className={"labels"}>Tolerance +-: </label>*/}
                    {/*<input type="text" onChange={handleChange} value={inputs.tolerance} size={5} id={"tolerance"}*/}
                    {/*       className={"inputs"}/>*/}
                    {/*<label htmlFor={"tolerance"} className={"units"}>%</label>*/}

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
