"use client";

// install (please try to align the version of installed @nivo packages)
// yarn add @nivo/bar
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { FC } from "react";

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.

type MyResponsiveBarProps = {
    data: BarChartData[];
};

export const MyResponsiveBar: FC<MyResponsiveBarProps> = ({ data }) => (
    <ResponsiveBar
        data={data}
        keys={["Current Period", "Previou Period"]}
        indexBy="country"
        margin={{ top: 20, right: 10, bottom: 55, left: 48 }}
        padding={0.3}
        groupMode="grouped"
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        // colors={{ scheme: "nivo" }}
        colors={["#fb923c", "#22c55e"]}
        defs={[
            {
                id: "dots",
                type: "patternDots",
                background: "inherit",
                color: "rgba(255, 255, 255, 0.3)",
                size: 4,
                padding: 1,
                stagger: true,
            },
            {
                id: "lines",
                type: "patternLines",
                background: "inherit",
                color: "rgba(255, 255, 255, 0.3)",
                rotation: -45,
                lineWidth: 6,
                spacing: 10,
            },
        ]}
        fill={[
            {
                match: {
                    id: "Current Period",
                },
                id: "dots",
            },
            {
                match: {
                    id: "Previou Period",
                },
                id: "lines",
            },
        ]}
        borderRadius={2}
        borderColor={{
            from: "color",
            modifiers: [["darker", 1.6]],
        }}
        axisTop={null}
        // axisRight={{
        //     tickSize: 5,
        //     tickPadding: 5,
        //     tickRotation: 0,
        //     legend: "food",
        //     legendPosition: "middle",
        //     legendOffset: 40,
        //     truncateTickAt: 0,
        // }}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            // legend: "country",
            legendPosition: "middle",
            legendOffset: 32,
            truncateTickAt: 0,
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "food",
            legendPosition: "middle",
            legendOffset: -40,
            truncateTickAt: 0,
        }}
        enableGridY={true}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor="white"
        // labelTextColor={{
        //     from: "color",
        //     modifiers: [["brighter", 3]],
        // }}
        legends={[
            {
                dataFrom: "keys",
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateX: 0,
                translateY: 55,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: "left-to-right",
                itemOpacity: 1,
                symbolSize: 16,
                symbolShape: "circle",
                effects: [
                    {
                        on: "hover",
                        style: {
                            itemTextColor: "#000",
                        },
                    },
                ],
            },
        ]}
        role="application"
        ariaLabel="Nivo bar chart demo"
        barAriaLabel={(e) =>
            e.id + ": " + e.formattedValue + " in country: " + e.indexValue
        }
    />
);

interface BarLineProps {
    keys: string[];
    lineData: any[];
    barData: any[];
    lineYTickValues: number[];
    barYTickValues: number[];
    chartTitle?: string;
    rightAxis: string;
    leftAxis: string;
    lineColors: string[];
    barColors: string[];
    height: string;
}

// export const BarLineChart: FC<BarLineProps> = ({
//   keys,
//   lineData,
//   barData,
//   lineYTickValues,
//   barYTickValues,
//   chartTitle,
//   rightAxis,
//   leftAxis,
//   lineColors,
//   barColors,
//   height,
// }) => {
//   const tickTheme = {
//     axis: {
//       ticks: {
//         text: {
//           fill: "#eee",
//         },
//       },
//     },
//     legends: {
//       text: {
//         fill: "#eee",
//       },
//     },
//   };

//   lineData[0].data.unshift({ x: "", y: null });
//   lineData[0].data.push({ x: null, y: null });

//   const lineLegend = lineData.map((line, index) => (
//     <div key={index} className="flex mr-5">
//       <div
//         className="border-2 h-4 w-4 mr-2"
//         style={{ borderColor: lineColors[index] }}
//       />
//       <div>{line.id}</div>
//     </div>
//   ));

//   const barLegend = keys.map((key, index) => (
//     <div key={index} className="flex mr-5">
//       <div
//         className="h-4 w-4 mr-2"
//         style={{ backgroundColor: barColors[index] }}
//       />
//       <div>{key}</div>
//     </div>
//   ));

//   return (
//     <div className="relative flex flex-col" style={{ height }}>
//       <div className="flex-1 relative">
//         <div className="absolute top-3 left-1/2 transform -translate-x-1/2 text-white font-bold">
//           {chartTitle}
//         </div>
//         <div className="absolute inset-0">
//           <ResponsiveBar
//             theme={tickTheme}
//             data={barData}
//             keys={keys}
//             indexBy="id"
//             margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
//             padding={0.3}
//             groupMode="stacked"
//             colors={barColors}
//             enableLabel={false}
//             borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
//             axisTop={null}
//             axisRight={null}
//             axisBottom={{
//               tickSize: 0,
//               tickPadding: 5,
//               tickRotation: 0,
//             }}
//             axisLeft={{
//               tickSize: 0,
//               tickPadding: 3,
//               tickRotation: 0,
//               tickValues: barYTickValues,
//             }}
//             yScale={{ type: "linear", min: "auto", max: "auto" }}
//             labelSkipWidth={12}
//             labelSkipHeight={12}
//             labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
//             animate={true}
//             motionStiffness={90}
//             motionDamping={15}
//             enableGridX={false}
//             isInteractive={true}
//           />
//         </div>
//         <div className="absolute inset-0">
//           <ResponsiveLine
//             theme={tickTheme}
//             data={lineData}
//             margin={{ top: 47, right: 105, bottom: 50, left: 35 }}
//             axisTop={null}
//             axisBottom={null}
//             axisRight={{
//               // orient: "left",
//               tickSize: 0,
//               tickPadding: -20,
//               tickRotation: 0,
//               tickValues: lineYTickValues,
//             }}
//             yScale={{ type: "linear", min: "auto", max: "auto" }}
//             axisLeft={null}
//             enableGridX={false}
//             enableGridY={false}
//             colors={lineColors}
//           />
//         </div>
//       </div>
//       <div className="flex justify-center text-white text-sm mb-2">
//         <div className="flex">{lineLegend}</div>
//         <div className="flex">{barLegend}</div>
//       </div>
//     </div>
//   );
// };
