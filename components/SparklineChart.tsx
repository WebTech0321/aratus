import { useMemo } from "react";
import dynamic from "next/dynamic";

const ResponsiveLineCanvas = dynamic(
  () => import("@nivo/line").then((m) => m.ResponsiveLineCanvas),
  { ssr: false }
);

const SparklineChart = ({ data }: { data: number[] }) => {
  const chartData = useMemo(
    () => data.map((value, index) => ({ x: index, y: value })),
    [data]
  );

  const chartColor = useMemo(() => {
    if (data.length > 0 && data[0] > data[data.length - 1]) return "#ef4444";
    return "#22c55e";
  }, [data]);

  return (
    <div className="w-[135px] h-[50px] ml-auto">
      <ResponsiveLineCanvas
        data={[
          {
            id: "chart",
            data: chartData,
          },
        ]}
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
          stacked: false,
          reverse: false,
        }}
        yFormat=" >-.2f"
        lineWidth={1}
        enablePoints={false}
        enableGridX={false}
        enableGridY={false}
        isInteractive={false}
        axisLeft={null}
        axisBottom={null}
        colors={[chartColor]}
      />
    </div>
  );
};

export default SparklineChart;
