"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  CartesianAxis,
  Legend,
} from "recharts";
import { Michroma } from "next/font/google";
import { useQuizStore } from "../store/quizStore";

const michroma = Michroma({
  weight: "400",
  subsets: ["latin"],
});

const QuizResultChart = () => {
  let { results } = useQuizStore();

  if (!results) {
    results = {
      total: 10,
      correct: 7,
      incorrect: 2,
      notAttempted: 1,
      scorePercent: 80,
    };
  }

  // Convert result object into an array of categories
  const categories = [
    { name: "Correct", value: results.correct, color: "#22c55e" },
    { name: "Incorrect", value: results.incorrect, color: "#ef4444" },
    { name: "Not Attempted", value: results.notAttempted, color: "#6255AD" },
  ];

  // Assign dynamic Y positions (highest at top, spacing by 2 units)
  const categoriesWithY = categories.map((cat, index) => ({
    ...cat,
    y: (categories.length - index) * 2, // e.g. 6,4,2
  }));

  // Build line data for each category (two points per line)
  const lineData = categoriesWithY.map((cat) => [
    { x: 0, y: cat.y, label: cat.name },
    { x: cat.value, y: cat.y, label: `${cat.value} ${cat.name}` },
  ]);

  return (
    <div className="w-full h-[300px] bg-white rounded-2xl p-6 ">
      <h2 className={`text-xl font-semibold mb-4 ${michroma.className}`}>
        Quiz Result
      </h2>
      <ResponsiveContainer width="100%" height={210} className="">
        <LineChart margin={{ top: 15, right: 40, left: 40, bottom: 10 }}>
          <CartesianGrid strokeDasharray="5 5" horizontal={false} />
          <CartesianAxis axisLine={true} />
          <XAxis
            type="number"
            dataKey="x"
            allowDecimals={false}
            domain={[0, results.total]} // Always from 0 → total questions
            ticks={Array.from({ length: results.total + 1 }, (_, i) => i)}
          />
          <YAxis
            hide={true}
            type="number"
            allowDecimals={false}
            domain={[0, (categories.length + 1) * 2]}
            ticks={categoriesWithY.map((c) => c.y)}
            tickFormatter={(val) => {
              const match = categoriesWithY.find((c) => c.y === val);
              return match ? match.name : "";
            }}
          />
          {/* <Tooltip cursor={false} allowEscapeViewBox={{ x: true, y: true }} /> */}

          <Legend
            verticalAlign="bottom"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: 14 }}
          />

          {lineData.map((data, idx) => {
            return (
              <Line
                key={categoriesWithY[idx].name}
                data={data}
                name={categories[idx].name}
                type="step"
                dataKey="y"
                stroke={categoriesWithY[idx].color}
                strokeWidth={6}
                dot={true}
                isAnimationActive={true}
              >
                {/* Label at end of line */}
                <LabelList
                  dataKey="x"
                  position="right"
                  content={({ x, y, index }) =>
                    index === 1 &&
                    typeof x === "number" &&
                    typeof y === "number" ? ( // केवल दूसरे बिंदु पर और x, y निश्चित रूप से नंबर हों
                      <text x={x + 10} y={y} fill={categoriesWithY[idx].color}>
                        {`${categoriesWithY[idx].value} `}
                      </text>
                    ) : null
                  }
                />
              </Line>
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default QuizResultChart;
