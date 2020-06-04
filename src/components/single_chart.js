import React from "react";
import PropTypes from "prop-types";

import {Line} from "react-chartjs-2";

class SingleChart extends React.Component {
    static get propTypes() {
        return {
            title: PropTypes.any,
            color: PropTypes.any,
            path: PropTypes.any
        };
    }
  
    constructor(props) {
        super(props);

        this.data = {
            datasets: [
                {
                    label: props.title,
                    fill: false,
                    backgroundColor: props.color,
                    borderColor: props.color,
                    borderCapStyle: "butt",
                    borderDash: [],
                    borderDashOffset: 0.0,
                    pointHitRadius: 20,
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
                        unit: "day"
                    }
                }]
            },
            maintainAspectRatio: false,
            responsive: false,
            legend: {
                labels: {
                    fontColor: "white",
                    fontSize: 14
                }
            }
        };

        this.chartRef = React.createRef();
    }

    componentDidMount() {
        let self = this;
        fetch(this.props.path).then(resp => resp.json()).then((data) => {
            this.data.datasets[0].data = data.map(x => {
                return {
                    x: new Date(x[1] * 1000),
                    y: Math.round(x[0])
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

                <Line data={this.data} ref={this.chartRef} options={this.options} width={window.innerWidth * 0.9} height={window.innerHeight * 0.3}/>
            </div>
        );
    }
}

export default SingleChart;
