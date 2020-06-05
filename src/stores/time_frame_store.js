import { createStore } from "redux";

function timeFrame(state = "day", action) {
    switch (action.type) {
    case "SET":
        return action.timeframe;
    default:
        return state;
    }
}

let timeStore = createStore(timeFrame);

export default timeStore;
