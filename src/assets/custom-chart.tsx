import {JSX, PureComponent} from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Dot
} from 'recharts';

import {DataPoint} from "./types/datapoint.interface";

interface CustomLineChartProps {
    data: DataPoint[];
}

interface CustomLineChartState {
    zScores: {
        uv: number[];
        pv: number[];
    };
}

interface ZScores {
    pv: number[];
    uv: number[];
}

class CustomLineChart extends PureComponent<
    CustomLineChartProps,
    CustomLineChartState // Указание типа состояния
> {
    constructor(props: CustomLineChartProps) {

        super(props);
        this.state = {
            zScores: {
                uv: [],
                pv: []
            }
        };
    }

    componentDidMount() {
        this.calculateZScores();
    }

    componentDidUpdate(prevProps: CustomLineChartProps) {
        if (prevProps.data !== this.props.data) {
            this.calculateZScores();
        }
    }

    calculateZScores = () => {
        const {data} = this.props;

        const calculate = (key: keyof ZScores) => {
            const values = data.map(d => d[key]);
            const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
            const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
            return values.map(val => (val - mean) / stdDev);
        };

        this.setState({
            zScores: {
                pv: calculate('pv'),
                uv: calculate('uv')
            }
        });
    };

    renderSegments = (dataKey: keyof ZScores) => {
        const segments: JSX.Element[] = [];
        let segmentStart: number | null = null;

        this.state.zScores[dataKey].forEach((z, index) => {
            console.log(this.state.zScores, dataKey, z, segmentStart);
            if (Math.abs(z) > 1) {
                if (segmentStart === null) segmentStart = index;
            } else if (segmentStart !== null) {
                segments.push(this.renderSegment(dataKey, segmentStart, index - 1));
                segmentStart = null;
            }
        });

        if (segmentStart !== null) {
            segments.push(this.renderSegment(dataKey, segmentStart, this.props.data.length - 1));
        }

        return segments;
    };

    renderSegment = (dataKey: keyof ZScores, start: number, end: number) => (
        <Line
            key={`${dataKey}-segment-${start}-${end}`}
            dataKey={dataKey}
            data={this.props.data.slice(start, end + 1)}
            stroke="red"
            strokeWidth={2}
            dot={false}
        ></Line>
    );

    renderDot = (dataKey: keyof ZScores, color: string) =>
        ({index, cx, cy}: { index: number; cx?: number; cy?: number }) => {
            const z = this.state.zScores[dataKey][index];
            const dotColor = Math.abs(z) > 1 ? 'red' : color;

            return <Dot cx={cx} cy={cy} fill={dotColor} stroke="transparent" r={5}/>;
        };

    renderLine = (dataKey: keyof ZScores, color: string) => (
        <Line
            type="monotone"
            dataKey={dataKey}
            key={`${dataKey}-line-${color}`}
            stroke={color}
            dot={this.renderDot(dataKey, color)}
            activeDot={{r: 8}}
        />
    );

    render() {
        return (
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={this.props.data} margin={{top: 20, right: 30, left: 20, bottom: 20}}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="name"/>
                    <YAxis/>
                    <Tooltip/>
                    <Legend/>

                    {this.renderLine('pv', '#8884d8')}
                    {this.renderLine('uv', '#82ca9d')}

                    {(['pv', 'uv'] as const).map(key => this.renderSegments(key))}

                </LineChart>
            </ResponsiveContainer>
        );
    }
}

export default CustomLineChart;