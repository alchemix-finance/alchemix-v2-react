import React, { useCallback, useMemo } from "react";
import { bisector, extent, max } from "d3-array";

import { Annotation, HtmlLabel } from "@visx/annotation";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { curveMonotoneX } from "@visx/curve";
import { localPoint } from "@visx/event";
import { GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { scaleLinear, scaleUtc, type NumberLike } from "@visx/scale";
import { Bar, Line, LinePath } from "@visx/shape";
import { defaultStyles, TooltipWithBounds, useTooltip } from "@visx/tooltip";
import { ParentSize } from "@visx/responsive";

import { useTheme } from "@/components/providers/ThemeProvider";
import { dayjs } from "@/lib/dayjs";

interface AprHistoryItem {
  apr: number;
  timestamp: number;
  formattedDate: string;
}
interface AreaProps {
  width: number;
  height: number;
  data: AprHistoryItem[];
}

/** A D3-like Tick Formatter for consistent values for date. */
const formatDate = (value: Date | NumberLike) =>
  dayjs(value instanceof Date ? value : new Date(value.valueOf())).format(
    "MMM D",
  );
/** Returns Date while converting timestamp from s to ms. */
const getDate = (d: AprHistoryItem) => new Date(d.timestamp * 1000);

const tooltipStylesLight = {
  ...defaultStyles,
  padding: "8px",
  borderRadius: "4px",
  boxShadow: "none",
  background: "#efeae4",
  borderWidth: "1px",
  borderColor: "#dcd7cc",
};
const tooltipStylesDark = {
  ...tooltipStylesLight,
  background: "#10151B",
  borderColor: "#232833",
};

const margin = {
  top: 20,
  right: 10,
  bottom: 20,
  left: 40,
};

const AprHistoricalGraph = ({ width, height, data }: AreaProps) => {
  const { darkMode } = useTheme();

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft = 0,
  } = useTooltip<AprHistoryItem>();

  const tooltipStyles = darkMode ? tooltipStylesDark : tooltipStylesLight;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const dateScale = useMemo(
    () =>
      scaleUtc({
        range: [0, innerWidth],
        domain: extent(data, getDate) as [Date, Date],
      }),
    [innerWidth, data],
  );
  const yValueScale = useMemo(() => {
    const valueMax = max(data, (d) => d.apr);
    return scaleLinear({
      range: [innerHeight, 0],
      domain: [0, (valueMax ?? 0) * 1.1],
      nice: true,
    });
  }, [innerHeight, data]);

  const handleTooltip = useCallback(
    (
      event:
        | React.TouchEvent<SVGRectElement>
        | React.MouseEvent<SVGRectElement>,
    ) => {
      const { x: _x } = localPoint(event) || { x: 0 };
      const x = _x - margin.left;
      const x0 = dateScale.invert(x);
      const index = bisector<AprHistoryItem, Date>(
        (d) => new Date(d.timestamp * 1000),
      ).left(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      let d = d0;
      if (d1 && getDate(d1)) {
        d =
          x0.valueOf() - getDate(d0).valueOf() >
          getDate(d1).valueOf() - x0.valueOf()
            ? d1
            : d0;
      }
      showTooltip({
        tooltipData: d,
        tooltipLeft: x,
      });
    },
    [showTooltip, dateScale, data],
  );

  const avg = data.reduce((acc, cur) => acc + cur.apr, 0) / data.length;

  if (width === 0) return null;
  return (
    <>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <GridRows
            scale={yValueScale}
            width={innerWidth}
            strokeDasharray="3,3"
            className="[&>*]:stroke-lightgrey1"
            pointerEvents="none"
            numTicks={3}
          />

          <LinePath
            className="stroke-iconsInverse dark:stroke-orange4"
            strokeWidth={2}
            data={data}
            x={(d) => dateScale(getDate(d)) ?? 0}
            y={(d) => yValueScale(d.apr) ?? 0}
            curve={curveMonotoneX}
          />

          {avg > 0 &&
            (() => {
              const avgFormatted = avg.toFixed(2);
              const avgArray = data.map((d) => {
                return {
                  ...d,
                  apr: avg,
                };
              });

              const annotationX = (dateScale(getDate(avgArray[0])) ?? 0) + 70;
              const annotationY = (yValueScale(avgArray[0].apr) ?? 0) - 8;
              return (
                <>
                  <LinePath
                    key="avg"
                    data={avgArray}
                    strokeDasharray="3,5"
                    className="stroke-green4"
                    strokeWidth={2}
                    x={(d) => dateScale(getDate(d)) ?? 0}
                    y={(d) => yValueScale(d.apr) ?? 0}
                  />
                  <Annotation x={annotationX} y={annotationY}>
                    <HtmlLabel showAnchorLine={false}>
                      <div className="mx-2 my-0.5 flex items-center justify-center rounded-full bg-grey10inverse text-xs dark:bg-grey10">
                        <p className="m-1 text-nowrap text-xs">
                          Avg {avgFormatted}%
                        </p>
                      </div>
                    </HtmlLabel>
                  </Annotation>
                </>
              );
            })()}

          <AxisBottom
            top={innerHeight - margin.bottom / 4}
            scale={dateScale}
            strokeWidth={0}
            numTicks={3}
            tickFormat={formatDate}
            tickStroke={darkMode ? "#979BA2" : "#68645d"}
            tickLabelProps={{
              fill: darkMode ? "#b0b0b0" : "#4f4f4f",
              fontSize: 10,
              textAnchor: "middle",
              dy: 4,
            }}
          />

          <AxisLeft
            left={0}
            scale={yValueScale}
            strokeWidth={0}
            numTicks={3}
            tickFormat={(value) => `${value}%`}
            tickLabelProps={() => ({
              fill: darkMode ? "#b0b0b0" : "#4f4f4f",
              fontSize: 10,
              dx: -margin.left + 10,
            })}
          />

          <Bar
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
          />

          {tooltipData && (
            <g>
              <Line
                from={{ x: tooltipLeft, y: margin.top }}
                to={{ x: tooltipLeft, y: innerHeight }}
                className="stroke-[#383D511F] dark:stroke-[#a5a8b647]"
                strokeWidth={1}
                pointerEvents="none"
                strokeDasharray="5,2"
              />

              <circle
                cx={tooltipLeft}
                cy={yValueScale(tooltipData.apr) + 1}
                r={4}
                fillOpacity={0.1}
                strokeOpacity={0.1}
                strokeWidth={2}
                pointerEvents="none"
              />
              <circle
                cx={tooltipLeft}
                cy={yValueScale(tooltipData.apr)}
                r={4}
                className="fill-[#383D511F] dark:fill-[#a5a8b647]"
                stroke="white"
                strokeWidth={2}
                pointerEvents="none"
              />
            </g>
          )}
        </Group>
      </svg>

      {tooltipData && (
        <TooltipWithBounds
          top={20}
          left={tooltipLeft + 40}
          style={tooltipStyles}
        >
          <p className="mb-2 mr-2 text-xs text-lightgrey10">
            {tooltipData.formattedDate}
          </p>
          <div className="flex items-center justify-between gap-2 text-xs">
            <p>APR</p>
            <p>{tooltipData.apr.toFixed(2)}%</p>
          </div>
        </TooltipWithBounds>
      )}
    </>
  );
};

const CHART_HEIGHT = 144;

export const AprHistoricalChart = ({
  vaultHistoricData,
}: {
  vaultHistoricData: AprHistoryItem[] | undefined;
}) => {
  return (
    <ParentSize>
      {({ width }) =>
        !!vaultHistoricData && vaultHistoricData?.length > 0 ? (
          <AprHistoricalGraph
            width={width}
            height={CHART_HEIGHT}
            data={vaultHistoricData}
          />
        ) : (
          <p>No historical data available</p>
        )
      }
    </ParentSize>
  );
};
