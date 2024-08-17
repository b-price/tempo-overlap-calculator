import { useState } from 'react'
import { useForm, SubmitHandler } from "react-hook-form"
import './App.css'

const defaultValues = {
    tempoA: '',
    tempoB: '',
    timeSigATop: '4',
    timeSigABot: '4',
    timeSigBTop: '4',
    timeSigBBot: '4',
    loopLength: '',
    repeats: '',
    tolerance: ''
}
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
    tempoDiff: number
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
                repeats: Math.floor(getSectionEnd(tempoDiff) / i),
                tempoDiff: 1 - parseFloat(inputs.tempoB) / newTempo
            })
        }
    }
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
                <label htmlFor={props.name} className={"leftSide"}>{props.display}</label>
                <span id={"timeSig"}>
                    <input
                        type="text"
                        size={3}
                        id={topName}
                        className={"leftSide"}
                        defaultValue={defaultValues[topName]}
                        {...register(topName, { required: true, pattern: /^\d+$/ })}
                    />
                    <label htmlFor={"timeSigA"} className={"leftSide"}>/</label>
                    <input
                        type="text"
                        size={3}
                        id={`${props.name}Bot`}
                        className={"leftSide"}
                        defaultValue={defaultValues[botName]}
                        {...register(botName, { required: true, pattern: /^\d+$/ })}
                    />
                </span>
            </>

        )
    }

    function Input(props) {
        return (
            <>
                <label htmlFor={props.name} className={"leftSide"}>{props.display}</label>
                <input
                    type="text"
                    size={5}
                    id={props.name}
                    className={"leftSide"}
                    defaultValue={defaultValues[props.name]}
                    {...register(props.name, { required: true, pattern: /^\d+$/ })}
                />
                <label htmlFor={props.name} className={"rightSide"}>{props.units}</label>
                {props.errors && <p>Only numbers allowed!</p>}
            </>
        )
    }

    const resultDisplay = []

    if (results.length > 0) {
        results.forEach((result, idx) => {
            resultDisplay.push(
                <div key={idx} className={"resultGroup"}>
                    <p className={"result"}><b>{result.newTempo.toPrecision(4)}</b> bpm (<b>{(result.tempoDiff * 100).toPrecision(1)}%</b>)</p>
                    <p className={"result"}>Measure: <b>{result.measure}</b> Repeats: <b>{result.repeats}</b></p>
                </div>
            )
        })
    } else {
        resultDisplay.push(
            <div key={"none"}>
                <h2>No viable overlaps!</h2>
                <p>Try increasing the tolerance.</p>
            </div>
        )
    }

    return (
        <>

            <h1>Tempo Overlap Calculator</h1>
            <div className="card">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className={"form"}>
                        <Input name={"tempoA"} display={"Tempo A:"} units={"bpm"} errors={errors.tempoA}/>
                        <TimeSig name={"timeSigA"} display={"Time Sig. A:"}/>
                        <Input name={"tempoB"} display={"Tempo B:"} units={"bpm"} errors={errors.tempoB}/>
                        <TimeSig name={"timeSigB"} display={"Time Sig. B:"}/>
                        <Input name={"loopLength"} display={"Loop Length:"} units={"measures"} errors={errors.loopLength}/>
                        <Input name={"repeats"} display={"Repeats:"} units={"loops"} errors={errors.repeats}/>
                        <Input name={"tolerance"} display={"Tolerance:"} units={"%"} errors={errors.tolerance}/>
                    </div>


                    {/*<label htmlFor={"tempoA"} className={"leftSide"}>Tempo A: </label>*/}
                    {/*<input*/}
                    {/*    type="text"*/}
                    {/*    size={5}*/}
                    {/*    id={"tempoA"}*/}
                    {/*    className={"leftSide"}*/}
                    {/*    {...register("tempoA", { required: true, pattern: /^\d+$/ })}*/}
                    {/*/>*/}
                    {/*<label htmlFor={"tempoA"} className={"rightSide"}>bpm</label>*/}

                    {/*<label htmlFor={"timeSigA"} className={"leftSide"}>Time Sig. A: </label>*/}
                    {/*<span id={"timeSig"}>*/}
                    {/*    <input*/}
                    {/*        type="text"*/}
                    {/*        size={3}*/}
                    {/*        id={"timeSigA_top"}*/}
                    {/*        className={"leftSide"}*/}
                    {/*        {...register("timeSigATop", { required: true })}*/}
                    {/*    />*/}
                    {/*    <label htmlFor={"timeSigA"} className={"leftSide"}>/</label>*/}
                    {/*    <input*/}
                    {/*        type="text"*/}
                    {/*        size={3}*/}
                    {/*        id={"timeSigA_bot"}*/}
                    {/*        className={"leftSide"}*/}
                    {/*        {...register("timeSigABot", { required: true })}*/}
                    {/*    />*/}
                    {/*</span>*/}
                    {/*<label htmlFor={"timeSigA"} className={"rightSide"}></label>*/}


                    {/*<label htmlFor={"tempoB"} className={"leftSide"}>Tempo B: </label>*/}
                    {/*<input*/}
                    {/*    type="text"*/}
                    {/*    size={5}*/}
                    {/*    id={"tempoB"}*/}
                    {/*    className={"leftSide"}*/}
                    {/*    {...register("tempoB", { required: true })}*/}
                    {/*/>*/}
                    {/*<label htmlFor={"tempoB"} className={"rightSide"}>bpm</label>*/}

                    {/*<label htmlFor={"loopLength"} className={"leftSide"}>Loop Length: </label>*/}
                    {/*<input type="text" onChange={handleChange} value={inputs.loopLength} size={5} id={"loopLength"}*/}
                    {/*       className={"leftSide"}/>*/}
                    {/*<label htmlFor={"loopLength"} className={"rightSide"}>measures</label>*/}

                    {/*<label htmlFor={"repeats"} className={"leftSide"}>Repeats: </label>*/}
                    {/*<input type="text" onChange={handleChange} value={inputs.repeats} size={5} id={"repeats"}*/}
                    {/*       className={"leftSide"}/>*/}
                    {/*<label htmlFor={"repeats"} className={"rightSide"}></label>*/}

                    {/*<label htmlFor={"tolerance"} className={"leftSide"}>Tolerance +-: </label>*/}
                    {/*<input type="text" onChange={handleChange} value={inputs.tolerance} size={5} id={"tolerance"}*/}
                    {/*       className={"leftSide"}/>*/}
                    {/*<label htmlFor={"tolerance"} className={"rightSide"}>%</label>*/}

                    <button type={"submit"}>
                        Calculate
                    </button>
                </form>

                <h3>Viable Tempo(s):</h3>
                {resultDisplay}
            </div>
            <div className="info">
                <p>This tool will calculate a new tempo within the tolerance in which a loop can overlap.</p>
                <p className={"infoEntry"}><b>Tempo A: </b>This is the tempo you don't want to change; the tempo of the
                    rest of the song</p>
                <p className={"infoEntry"}><b>Time Sig. A: </b>The time signature of Tempo A. You can enter wacky values
                    like 4/7 and it will still be correct.</p>
                <p className={"infoEntry"}><b>Tempo B: </b>The tempo to be changed in order to fit your loop into an
                    integer repetition of Tempo A. Better results are achieved when Tempo A is higher than Tempo B.</p>
                <p className={"infoEntry"}><b>Time Sig. B: </b>The time signature of Tempo B (the part with the loop).
                </p>
                <p className={"infoEntry"}><b>Loop Length: </b>The length of the loop, in measures of Tempo B.</p>
                <p className={"infoEntry"}><b>Repeats: </b>How many times the loop repeats in the section of the song.
                </p>
                <p className={"infoEntry"}><b>Tolerance: </b>The percentage of change in bpm (up or down) from Tempo B you are willing
                    to accept for the new tempo. Low values will not likely result in any viable tempos and high values
                    will provide too many and will likely change your part too much. 5 to 10% is usually the sweet spot.</p>
            </div>
        </>
    )
}

export default App
