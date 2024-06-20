"use client";

import { ResponsiveLine } from "@nivo/line";
import { FC } from "react";

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.

type MyResponsiveLineProps = {
    data: LineChartData[];
};

export const MyResponsiveLine: FC<MyResponsiveLineProps> = ({ data }) => (
    <ResponsiveLine
        curve="monotoneX"
        lineWidth={3}
        margin={{ top: 20, right: 10, bottom: 68, left: 45 }}
        data={data}
        xScale={{ type: "linear", min: 0, max: "auto" }}
        yScale={{ type: "linear" }}
        yFormat=" >-.2f"
        axisTop={null}
        axisRight={null}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Date",
            legendOffset: 36,
            legendPosition: "middle",
            truncateTickAt: 0,
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Score",
            legendOffset: -40,
            legendPosition: "middle",
            truncateTickAt: 0,
        }}
        pointSize={10}
        pointColor={{ from: "color", modifiers: [] }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabel="data.yFormatted"
        pointLabelYOffset={-12}
        enableTouchCrosshair={true}
        useMesh={true}
        colors={[
            "#8b5cf6",
            "#DACAFE",
            "#22c55e",
            "#CCFBDD",
            "#f43f5e",
            "#FCCCD4",
        ]}
        legends={[
            {
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateX: 0,
                translateY: 69,
                itemsSpacing: 5,
                itemDirection: "left-to-right",
                itemWidth: 90,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 16,
                symbolShape: "circle",
                symbolBorderColor: "rgba(0, 0, 0, .9)",
                effects: [
                    {
                        on: "hover",
                        style: {
                            itemBackground: "rgba(0, 0, 0, .03)",
                            itemOpacity: 1,
                        },
                    },
                ],
            },
        ]}
        tooltip={({ point }) => {
            const series = data.find((serie) => serie.id === point.serieId);
            return (
                <div className="bg-white p-2 rounded-lg shadow-md text-sm border">
                    <strong>{series?.name}</strong>
                    <br />
                    {/* <strong>id:</strong> {point.data.xFormatted} */}
                    {/* <br /> */}
                    <strong>score:</strong> {point.data.yFormatted}
                </div>
            );
        }}
        theme={{
            axis: {
                legend: {
                    text: {
                        fontSize: 12,
                        fontWeight: 600,
                        fill: "#4b5563",
                    },
                },
                ticks: {
                    text: {
                        fontSize: 12,
                        fontWeight: 500,
                        fill: "#4b5563",
                    },
                },
            },
            legends: {
                text: {
                    fontSize: 12,
                    fontWeight: 600,
                    // fill: "#4b5563",
                },
            },
        }}
    />
);
