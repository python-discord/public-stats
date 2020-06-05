import { createStore } from "redux";

function timeFrame(state, action) {
    switch (action.type) {
    case "SET":
        return action.timeframe;
    default:
        return state;
    }
}


let timeStore = createStore(timeFrame, localStorage.timeFrame ? localStorage.timeFrame : "day");

timeStore.subscribe(() => {
  localStorage.timeFrame = timeStore.getState()
});

export default timeStore;
