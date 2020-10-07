import React from "react";
import "./App.css";

import SingleChart from "./components/single_chart.js";
import MultiChart from "./components/multi_chart.js";
import Footer from "./components/footer.js";

import Dropdown from "react-dropdown";
import "react-dropdown/style.css";

import timeStore from "./stores/time_frame_store.js";

const timeFrames = [
    "day",
    "week",
    "month",
    "year"
];

class App extends React.Component {
    newTimeFrame(choice) {
        timeStore.dispatch({
            type: "SET",
            timeframe: choice.value
        });
    }
    render() {
        return (
            <div className="App">
                <header className="App-jumbo">
        Python Discord statistics
                </header>

                <header className="App-subtitle">
        Select a time period from the dropdown below! All chart times are in your local timezone.
                </header>

                <div className="selectBox">
                    <Dropdown options={timeFrames} onChange={this.newTimeFrame} placeholder="Select a timeframe" value={localStorage.timeFrame ? localStorage.timeFrame : "day"}/>
                </div>

                <SingleChart title="Member count" path="/members/total" color="#7289DA"/>
                <SingleChart title="Message rate" path="/messages/rate" color="#7289DA" subtitle="This graph shows messages sent per $interval"/>
                <SingleChart title="In use help channels" path="/help/in_use" color="#7289DA" type="bar" beginAtZero={true} subtitle="Average help channels in use per $interval"/>

                <MultiChart stacked={false} title="Off topic messages" path="/messages/offtopic" color={
                    [
                        "#ea907a",
                        "#fbc687",
                        "#f4f7c5"
                    ]
                } names={
                    [
                        "Off topic 0",
                        "Off topic 1",
                        "Off topic 2"
                    ]
                }/>

                <MultiChart title="Eval usage per channel" path="/evals/perchannel" color={
                    [
                        "#ea907a",
                        "#fbc687",
                        "#f4f7c5"
                    ]
                } names={
                    [
                        "Bot commands",
                        "Help",
                        "Topical"
                    ]
                } stacked={true}/>

                <Footer/>
            </div>
        );
    }
}

export default App;
