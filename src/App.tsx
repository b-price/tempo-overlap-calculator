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
                {(props.errorsTop || props.errorsBot) && <label className={"error"}>Input must be positive integer!</label>}
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
                    {...register(props.name, { required: true, pattern: props.float? /^\d+(\.\d+)?$/ : /^\d+$/ })}
                />
                <label htmlFor={props.name} className={"rightSide"}>{props.units}</label>
                {props.errors && <label className={"error"}>Input must be positive number!</label>}
            </>
        )
    }

    const resultDisplay = []

    if (results.length > 0) {
        results.forEach((result, idx) => {
            resultDisplay.push(
                <div key={idx} className={"resultGroup"}>
                    <p className={"result"}><b>{result.newTempo.toPrecision(5)}</b> bpm (<b>{(result.tempoDiff * 100).toPrecision(2)}%</b>)</p>
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
                        <Input name={"tempoA"} display={"Tempo A:"} units={"bpm"} errors={errors.tempoA} float={true}/>
                        <TimeSig name={"timeSigA"} display={"Time Sig. A:"} errorsTop={errors.timeSigATop} errorsBot={errors.timeSigABot}/>
                        <Input name={"tempoB"} display={"Tempo B:"} units={"bpm"} errors={errors.tempoB} float={true}/>
                        <TimeSig name={"timeSigB"} display={"Time Sig. B:"} errorsTop={errors.timeSigBTop} errorsBot={errors.timeSigBBot}/>
                        <Input name={"loopLength"} display={"Loop Length:"} units={"measures"} errors={errors.loopLength}/>
                        <Input name={"repeats"} display={"Repeats:"} units={"loops"} errors={errors.repeats}/>
                        <Input name={"tolerance"} display={"Tolerance:"} units={"%"} errors={errors.tolerance} float={true}/>
                    </div>
                    <button type={"submit"}>
                        Calculate
                    </button>
                </form>

                <h3>Viable Tempo(s):</h3>
                {resultDisplay}
            </div>
            <div className="info">
                <p>Are you, like me, in some musical situation where you need to change tempos in a song but your
                    looping technology only offers one tempo without stopping and starting over? You're in luck!
                    This tool will calculate where your new tempo overlaps your old one, and if it doesn't, will suggest
                    a new tempo within a tolerance you provide. You also get the amount of repeats you can do and how
                    much
                    the generated tempo deviates from the one you had in mind.</p>
                <p className={"infoEntry"}><b>Tempo A: </b>This is the tempo you don't want to change; the tempo of the
                    rest of the song.</p>
                <p className={"infoEntry"}><b>Time Sig. A: </b>The time signature of Tempo A. You can enter wacky values
                    like 4/7 and it will still be correct.</p>
                <p className={"infoEntry"}><b>Tempo B: </b>The tempo to be changed in order to fit your loop into an
                    integer repetition of Tempo A. Better results are achieved when Tempo A is higher than Tempo B.</p>
                <p className={"infoEntry"}><b>Time Sig. B: </b>The time signature of Tempo B (the part with the loop).
                </p>
                <p className={"infoEntry"}><b>Loop Length: </b>The length of the loop, in measures of Tempo B.</p>
                <p className={"infoEntry"}><b>Repeats: </b>How many times the loop repeats in the section of the song.
                </p>
                <p className={"infoEntry"}><b>Tolerance: </b>The percentage of change in bpm (up or down) from Tempo B
                    you are willing
                    to accept for the new tempo. Low values will not likely result in any viable tempos and high values
                    will provide too many and will likely change your part too much. 5 to 10% is usually the sweet spot.
                </p>
                <p>I created this tool for my project <a href={"https://atthegraves.bandcamp.com"}>At the Graves</a>.</p>
                <p>Support me here if you'd like: <a href={"https://www.patreon.com/bricedev"}>Patreon</a></p>
            </div>
        </>
    )
}

export default App
