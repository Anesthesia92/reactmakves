import React, { PureComponent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartProps {
    data: DataPoint[];
}

interface ChartState {
    processedData: DataPoint[];
}

const calculateZScores = (data: DataPoint[], key: keyof DataPoint): DataPoint[] => {
    const values = data.map(d => d[key] as number);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);

    return data.map(d => ({
        ...d,
        [`z_${key}`]: stdDev !== 0 ? (d[key] as number - mean) / stdDev : 0
    }));
};

export default class CustomLineChart extends PureComponent<ChartProps, ChartState> {
    constructor(props: ChartProps) {
        super(props);
        this.state = {
            processedData: this.processData(props.data)
        };
    }

    componentDidUpdate(prevProps: ChartProps) {
        if (prevProps.data !== this.props.data) {
            this.setState({ processedData: this.processData(this.props.data) });
        }
    }
    componentDidMount() {
        console.log('Processed Data:', this.state.processedData);
    }

    processData = (data: DataPoint[]) => {
        let processed = calculateZScores(data, 'pv');
        processed = calculateZScores(processed, 'uv');
        return processed;
    };

    renderLine = (dataKey: keyof DataPoint, color: string) => {
        const { processedData } = this.state;
        const zKey = `z_${dataKey}` as keyof DataPoint;

        if (!processedData?.length) return null;

        return (
            <>
                <Line
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
                />

                {processedData.slice(0, -1).map((point, index) => {
                    const nextPoint = processedData[index + 1];
                    const currentZ = point[zKey] as number;
                    const nextZ = nextPoint[zKey] as number;

                    return Math.abs(currentZ) > 1 || Math.abs(nextZ) > 1 ? (
                        <Line
                            key={`${dataKey}-segment-${index}`}
                            data={[point, nextPoint]}
                            type="monotone"
                            dataKey={dataKey}
                            stroke="red"
                            strokeWidth={2}
                            dot={false}
                            connectNulls
                        />
                    ) : null;
                })}

                {processedData.map((point, index) => (
                    <Line
                        key={`${dataKey}-dot-${index}`}
                        data={[point]}
                        type="monotone"
                        dataKey={dataKey}
                        stroke="none"
                        dot={{
                            fill: Math.abs(point[zKey] as number) > 1 ? 'red' : color,
                            r: 5,
                            strokeWidth: 2
                        }}
                    />
                ))}
            </>
        );
    };

    render() {
        const { processedData } = this.state;

        if (!processedData.length) return <div>Loading...</div>;

        return (
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={processedData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {this.renderLine('pv', '#8884d8')}
                    {this.renderLine('uv', '#82ca9d')}
                </LineChart>
            </ResponsiveContainer>
        );
    }
}