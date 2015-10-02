/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/* eslint max-len:0 */

import React from "react/addons";
import _ from "underscore";
import Markdown from "react-markdown";
import Highlighter from "./highlighter";

// Pond
import {TimeSeries, TimeRange} from "@esnet/pond";

// Imports from the charts library
import Legend from "../../src/legend";
import ChartContainer from "../../src/chartcontainer";
import ChartRow from "../../src/chartrow";
import Charts from "../../src/charts";
import YAxis from "../../src/yaxis";
import AreaChart from "../../src/areachart";
import TimeRangeMarker from "../../src/timerangemarker";
import Resizable from "../../src/resizable";

// Docs text
import exampleText from "raw!../../docs/areachart.md";

// Data
const rawTrafficData = require("../data/link-traffic.json");

/**
 * The area chart expects a Timeseries with a simple "value" column
 */
const trafficBNLtoNEWYSeries = new TimeSeries({
    name: `BNL to NEWY`,
    columns: ["time", "value"],
    points: _.map(rawTrafficData.traffic["BNL--NEWY"], p => [p[0] * 1000, p[1]])
});

const trafficNEWYtoBNLSeries = new TimeSeries({
    name: `NEWY to BNL`,
    columns: ["time", "value"],
    points: _.map(rawTrafficData.traffic["NEWY--BNL"], p => [p[0] * 1000, p[1]])
});

export default React.createClass({

    mixins: [Highlighter],

    getInitialState() {
        return {
            markdown: exampleText,
            tracker: null,
            timerange: trafficBNLtoNEWYSeries.range()
        };
    },

    handleTrackerChanged(t) {
        this.setState({tracker: t});
    },

    handleTimeRangeChange(timerange) {
        this.setState({timerange: timerange});
    },

    renderNightTime() {
        const sunset = new Date(2015, 7, 31, 19, 36, 0);
        const sunrise = new Date(2015, 8, 1, 6, 41, 0);
        const night = new TimeRange(sunset, sunrise);

        return (
            <TimeRangeMarker timerange={night} style={{fill: "#F3F3F3"}}/>
        );
    },

    render() {
        const dateRangeStyle = {
            fontSize: 12,
            color: "#AAA",
            borderBottomStyle: "solid",
            borderWidth: "1",
            borderColor: "#F4F4F4"
        };

        const max = _.max([
            trafficBNLtoNEWYSeries.max(),
            trafficNEWYtoBNLSeries.max()
        ]);

        const axistype = "linear";

        return (
            <div>
                <div className="row">
                    <div className="col-md-12">
                        <h3>AreaChart</h3>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4">
                        <Legend type="swatch" categories={[
                            {key: "in", label: "Into Site", style: {backgroundColor: "#448FDD"}},
                            {key: "out", label: "Out of site", style: {backgroundColor: "#FD8D0D"}}
                        ]} />
                    </div>
                    <div className="col-md-8">
                        <span style={dateRangeStyle}>{trafficBNLtoNEWYSeries.range().humanize()}</span>
                    </div>
                </div>

                <hr />

                <div className="row">
                    <div className="col-md-12">
                        <Resizable>

                            <ChartContainer timeRange={this.state.timerange}
                                            trackerPosition={this.state.tracker}
                                            onTrackerChanged={this.handleTrackerChanged}
                                            enablePanZoom={true}
                                            maxTime={trafficBNLtoNEWYSeries.range().end()}
                                            minTime={trafficBNLtoNEWYSeries.range().begin()}
                                            minDuration={1000 * 60 * 60}
                                            onTimeRangeChanged={this.handleTimeRangeChange}
                                            padding="0"
                                            transition="300">
                                <ChartRow height="150" debug={false}>
                                    <Charts>
                                        <AreaChart axis="traffic" series={[[trafficBNLtoNEWYSeries],[trafficNEWYtoBNLSeries]]} />
                                    </Charts>
                                    <YAxis id="traffic" label="Traffic (bps)" labelOffset={0} min={-max} max={max} absolute={true} width="60" type={axistype}/>
                                </ChartRow>
                            </ChartContainer>

                        </Resizable>
                    </div>
                </div>

                <hr />

                <div className="row">
                    <div className="col-md-12">
                        <Markdown source={this.state.markdown}/>
                    </div>
                </div>

            </div>
        );
    }
});