import React from "react";
import PropTypes from "prop-types";

import {Line} from "react-chartjs-2";

class SingleChart extends React.Component {
    static get propTypes() {
        return {
            path: PropTypes.any,
            color: PropTypes.any,
            title: PropTypes.any,
            names: PropTypes.any
        };
    }
    constructor(props) {
        super(props);

        this.data = {
            datasets: []
        };

        this.options = {
            scales: {
                xAxes: [{
                    type: "time",
                    time: {
                        unit: "day"
                    }
                }]
            },
            maintainAspectRatio: true,
            responsive: true,
            layout: {
              padding: {
                right: 50,
                left: 50
              }
            },
            legend: {
                labels: {
                    fontColor: "white",
                    fontSize: 14
                }
            },
            tooltips: {
                mode: "index"
            }
        };

        this.chartRef = React.createRef();
    }

    componentDidMount() {
        let self = this;
        fetch(this.props.path).then(resp => resp.json()).then((data) => {
            this.data.datasets = data.map((v, i) => {
                return {
                    label: this.props.names[i],
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: this.props.color[i],
                    borderColor: this.props.color[i],
                    borderCapStyle: "butt",
                    borderDash: [],
                    pointHitRadius: 10,
                    borderDashOffset: 0.0,
                    borderJoinStyle: "miter",
                    pointRadius: 0,
                    data: v.map(x => {
                        return {
                            x: new Date(x[1] * 1000),
                            y: Math.round(x[0])
                        };
                    })
                };
            });
            self.chartRef.current.chartInstance.update();
        });
    }

    render() {
        return (
            <div className="App">
                <header className="Group-title">
                    {this.props.title}
                </header>

                <Line data={this.data} ref={this.chartRef} options={this.options} width={500}/>
            </div>
        );
    }
}

export default SingleChart;
