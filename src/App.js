import React from "react";
import {Button, Chip, Divider, TextField, Snackbar} from "material-ui";
import {LineChart} from "react-easy-chart";
import {PieChart} from "react-easy-chart";
import firebase from "firebase";
import {firebaseConfig, firestoreConfig} from "./config";
import {analyseText} from "./nlp";
import moment from "moment";
require("firebase/firestore");


const POSITIVE_COLOR = "#00c853";
const NEGATIVE_COLOR = "#d50000";
const NEUTRAL_COLOR = "#03a9f4";

const COLOR_SCALE = ['#ff0000', '#ff4b2c', '#ff6b4a', '#ff8565', '#ff9c80', '#ffb199', '#ffc6b2', '#ffdacc', '#ffece6',
    NEUTRAL_COLOR,
    '#e6f1e2', '#cfe3c7', '#b7d5ac', '#9fc792', '#87b978', '#6eaa5e', '#549c44', '#378e29', '#008000'];


firebase.initializeApp(firebaseConfig);
var fs = firebase.firestore();
fs.settings(firestoreConfig);

const hints = [
    "This talk is really shit",
    "This talk is meh but boring",
    "This talk is really interesting",
    "Why am i here?",
    "This is getting out of hand",
    "I know these people who are talking",
    "Oh, hi there Linh",
    "Hey look it's Nicholas and Ishan",
    "Why the fuck am I here?"
];
class App extends React.Component {
    state = {
        feedback: "",
        data: [[{x: 1, y: 1}, {x: 3, y: 2}]],
        yValues: [],
        xValues: [],
        locked: false,
        snackbarOpen: false,
        renderHints: [],
        sentimentColor: "#FFFFFF",
        chartSortedData: [
            {key: 'positive', value: 200, color: POSITIVE_COLOR},
            {key: 'negative', value: 100, color: NEGATIVE_COLOR},
            {key: 'neutral', value: 50, color: NEUTRAL_COLOR}
        ],
        dataLength: -1,
    };

    componentDidMount = () => {
        const {renderHints} = this.state;
        do {
            renderHints[renderHints.length] = hints.splice(
                Math.floor(Math.random() * hints.length),
                1
            )[0];
        } while (renderHints.length < 3);
        this.getInfo();
        setInterval(() => {
            this.getInfo();
        }, 5000);
    };

    getInfo = () => {
        const {yValues} = this.state;
        const newYValues = [];
        fs
            .collection("review")
            .get()
            .then(allReviews => {
                const copy = [];
                allReviews.forEach(doc => {
                    const data = doc.data();
                    copy.push({
                        id: doc.id,
                        data
                    });
                });

                return copy;
            })
            .then(data => {
                data.reverse();
                const updatedArray = data;
                updatedArray.map(review => {
                    newYValues.push(review.data.sentiment);
                });


                let positive = 0, negative = 0, neutral = 0;
                newYValues.forEach(value => {
                    if (value == 0) {
                        neutral += 1;
                    } else if (value > 0) {
                        positive += 1;
                    } else if (value < 0) {
                        negative += 1;
                    }
                });
                let cleanedData = [
                    {key: 'positive', value: positive, color: POSITIVE_COLOR},
                    {key: 'negative', value: negative, color: NEGATIVE_COLOR},
                    {key: 'neutral', value: neutral, color: NEUTRAL_COLOR},
                ];
                this.setState({chartSortedData: cleanedData, dataLength: newYValues.length});

                //====================This works for a line graph=====================//
                /*this.setState({
                 yValues: newYValues,
                 data: [newYValues.map((val, index) => ({x: index + 1, y: val}))]
                 });*/
            });
    };
    handleChange = name => event => {
        this.setState({
            [name]: event.target.value
        });
    };

    handleHint = hint => {
        this.setState({
            feedback: hint
        });
    };

    handleSubmit = () => {
        this.setState({
            snackbarOpen: true,
            locked: true,
        });
        analyseText(this.state.feedback).then(sentiment => {
            const score = sentiment.documentSentiment.score;
            console.log("SCORE IS: " + score);
            let indexMapped = 0;
            if (score < 0) {
                indexMapped = 10 - (score * -1 * 10);
            } else if (score == 0) {
                indexMapped = 9;
            } else if (score > 0) {
                indexMapped = (score * 10) + 9;
            }

            this.setState({sentimentColor: COLOR_SCALE[indexMapped]});

            fs.collection("review").add({
                timestamp: new Date(),
                sentiment: sentiment.documentSentiment.score,
                feedback: this.state.feedback
            });
        });
    };

    render() {
        const {locked, renderHints, sentimentColor, chartSortedData, dataLength} = this.state;

        let sentimentValue = 0;
        let sentimentIndex = COLOR_SCALE.indexOf(sentimentColor);

        if (sentimentIndex == 9) {
            sentimentValue = 0;
        } else if (sentimentIndex < 9 && sentimentIndex >= 0) {
            //0 -> -1
            //1 -> -.9
            //2 -> -.8
            sentimentValue = (10 - sentimentIndex) / -10;
        } else if (sentimentIndex > 9) {
            //19 -> 1
            //18 -> 0.9
            sentimentValue = (sentimentIndex - 9) / 10;
        }
        //sentimentValue stores the actual value;

        const dataLengthText = (dataLength < 0) ? "Initializing..." : dataLength + " responses recorded.";


        return (
            <div
                className="row"
            >

                <div className="col s12 black-text lighten-3" style={{height: '5vh', backgroundColor: sentimentColor}}>

                </div>


                <Snackbar
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "center"
                    }}
                    open={this.state.snackbarOpen}
                    autoHideDuration={3000}
                    onClose={() => this.setState({snackbarOpen: false})}
                    SnackbarContentProps={{
                        "aria-describedby": "message-id"
                    }}
                    message={<span id="message-id">Submitted Feedback</span>}
                />

                <div className="col center s12 m10 offset-m1 l8 offset-l2">
                    <h5>
                        Sentiment Display
                    </h5>
                </div>

                <div className="col s12 m10 offset-m1 l8 offset-l2">
                    <div>
                        {renderHints.map((hint, index) => {
                            return (
                                <Chip
                                    key={index + hint}
                                    label={hint}
                                    style={{marginLeft: 5, marginRight: 5, marginTop: 2}}
                                    onClick={this.handleHint.bind(null, hint)}
                                />
                            );
                        })}
                    </div>
                    <br/>


                    <TextField
                        label="Enter your feedback"
                        value={this.state.feedback}
                        onChange={this.handleChange("feedback")}
                        style={{width: "100%"}}
                    />

                    <br/><br/>
                    <Button
                        variant="raised"
                        disabled={locked}
                        onClick={this.handleSubmit}
                    >
                        Submit
                    </Button>
                    <br/><br/>

                </div>


                <div className="col s12 center">


                    <PieChart
                        size={250}
                        innerHoleSize={150}
                        data={chartSortedData}
                    />
                    <p className="grey-text">{dataLengthText}</p>

                </div>


            </div>
        );

        // width={600}
        // height={300}

    }
}

//
// <LineChart
//                         axes
//                         axisLabels={{x: "time", y: "sentiment"}}
//
//                         data={this.state.data}
//                         interpolate={"cardinal"}
//                         yDomainRange={[-2, 2]}
//                         xDomainRange={[0, 35]}
//                     />

export default App;
