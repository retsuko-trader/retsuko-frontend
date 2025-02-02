'use client';

// @ts-expect-error CanvasJS is not typed
import CanvasChartReact from '@canvasjs/react-stockcharts';
import type { Trade } from '@/lib/retsuko/core/Trade';
import { Candle } from '@/lib/retsuko/tables';
import { Signal } from '@/lib/retsuko/core/Signal';

interface Props {
  title: string;

  candles?: Candle[];

  tradesList?: Trade[][];

  showBalance?: boolean;
  logarithmicBalance?: boolean;
  showTrades?: boolean;
}

export function TradingChart({
  title,
  candles,
  tradesList,
  showBalance,
  logarithmicBalance,
  showTrades,
}: Props) {
  const axisX = {
    valueFormatString: 'YYYY-MM-DD HH:mm',
    crosshair: {
      enabled: true,
      snapToDataPoint: true,
    },
  };
  const toolTip = {
    shared: true,
  };

  let height = 150;
  if (candles && candles.length > 0) {
    height += 400;
  }

  const options2 = {
    title: {
      text: title,
    },
    charts: [
      candles && candles.length > 0 && {
        height: 400,
        axisX,
        axisY: {
          title: 'Price',
          logarithmic: logarithmicBalance ?? false,
        },
        axisY2: {
          title: 'Balance',
          logarithmic: logarithmicBalance ?? false,
          minimum: 1000,
          crosshair: {
            enabled: true,
            snapToDataPoint: true,
          },
        },
        toolTip,
        data: [
          {
            name: 'Price',
            type: 'candlestick',
            showInLegend: true,
            xValueFormatString: 'YYYY-MM-DD HH:mm',
            dataPoints: candles.map(x => ({
              x: x.ts,
              y: [x.open, x.high, x.low, x.close],
            })),
          },
          ...(showBalance ? tradesList ?? [] : []).map((trades, i) => ({
            name: `Balance[${i}]`,
            type: 'stepLine',
            showInLegend: true,
            xValueFormatString: 'YYYY-MM-DD HH:mm',
            yValueFormatString: '0.00',
            axisYType: 'secondary',
            dataPoints: trades.map(x => ({
              x: x.ts,
              y: x.asset * x.price + x.currency,
            })),
          })),
          ...(showTrades ? tradesList ?? [] : []).map(trades => ({
            name: 'Trade',
            type: 'scatter',
            showInLegend: true,
            xValueFormatString: 'YYYY-MM-DD HH:mm',
            markerType: 'triangle',
            markerSize: 10,
            dataPoints: trades.map(x => ({
              x: x.ts,
              y: x.price,
              z: x.action,
              markerColor: Signal.summary(x.action) === 'long' ? 'green' : 'red',
            })),
          })),
        ],
      },
    ],
  };

  const containerProps = {
    width: '90%',
    height: `${height}px`,
  };

  return (
    <CanvasChartReact.CanvasJSStockChart key={height.toString()} containerProps={containerProps} options={options2} />
  )
}