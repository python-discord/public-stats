import React from "react";
import PropTypes from "prop-types";

import {Line, Bar} from "react-chartjs-2";

import timeFrameStore from "../stores/time_frame_store.js";

import UNITS from "../constants.js";
import CHART_HEIGHT from "../sizing.js";

import moment from "moment";
import momentDurationFormatSetup from "moment-duration-format";

momentDurationFormatSetup(moment);


class SingleChart extends React.Component {
    static get propTypes() {
        return {
            title: PropTypes.any,
            color: PropTypes.any,
            path: PropTypes.any,
            beginAtZero: PropTypes.any,
            type: PropTypes.any,
            subtitle: PropTypes.any
        };
    }

    constructor(props) {
        super(props);

        this.state = {
            formattedSubtitle: ""
        };

        this.data = {
            datasets: [
                {
                    label: props.title,
                    fill: false,
                    backgroundColor: props.color,
                    borderColor: props.color,
                    pointHitRadius: 10,
                    borderJoinStyle: "miter",
                    pointRadius: 0,
                    data: []
                }
            ]
        };

        this.options = {
            scales: {
                xAxes: [{
                    type: "time",
                    time: {
                        unit: false
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: this.props.beginAtZero ? true : false
                    }
                }]
            },
            layout: {
                padding: {
                    right: 50,
                    left: 50
                }
            },
            maintainAspectRatio: true,
            legend: {
                labels: {
                    fontColor: "white",
                    fontSize: 14
                }
            }
        };

        this.chartRef = React.createRef();

        this.firstRun = true;
    }

    componentDidMount() {
        if (this.firstRun) {
            timeFrameStore.subscribe(() => this.componentDidMount());
            this.firstRun = false;
        }
        let self = this;
        let path = this.props.path + "?frame=" + timeFrameStore.getState();
        fetch(path).then(resp => resp.json()).then((data) => {
            this.data.datasets[0].data = data.map(x => {
                return {
                    x: new Date(x[1] * 1000),
                    y: Math.round(x[0])
                };
            });
            self.chartRef.current.chartInstance.options.scales.xAxes[0].time.unit = UNITS[timeFrameStore.getState()];
            self.chartRef.current.chartInstance.update();
            this.formatSubtitle();
        });
    }

    formatSubtitle() {
        let interval = this.data.datasets[0].data[1].x - this.data.datasets[0].data[0].x;
        let duration = moment.duration(interval, "milliseconds");

        let formattedSubtitle = this.props.subtitle;

        if (formattedSubtitle) {
          formattedSubtitle = formattedSubtitle.replace("$interval", duration.format("d [days], h [hours] [and] mm [minutes]"));

          this.setState({
              formattedSubtitle
          });
        }
    }

    render() {
        let chart;
        if (this.props.type === "bar") {
            chart = <Bar data={this.data} ref={this.chartRef} options={this.options} height={CHART_HEIGHT}/>;
        } else {
            chart = <Line data={this.data} ref={this.chartRef} options={this.options} height={CHART_HEIGHT}/>;
        }

        let subtitle;

        if (this.props.subtitle) {
            subtitle = (
                <header className="Group-subtitle">
                    {this.state.formattedSubtitle}
                </header>
            );
        }

        return (
            <div className="App">
                <header className="Group-title">
                    {this.props.title}
                </header>

                {subtitle}

                {chart}
            </div>
        );
    }
}

export default SingleChart;
