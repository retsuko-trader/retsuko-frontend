'use client';

// @ts-expect-error CanvasJS is not typed
import CanvasChartReact from '@canvasjs/react-charts';
import type { Trade } from '@/lib/retsuko/core/Trade';
import { SimpleCandle } from '@/lib/retsuko/tables';

interface Props {
  title: string;

  candles?: SimpleCandle[];

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

  const options = {
    title: {
      text: title,
    },
    axisX: {
      valueFormatString: 'YYYY-MM-DD HH:mm',
      crosshair: {
        enabled: true,
        snapToDataPoint: true,
      },
    },
    axisY: {
      title: 'Price',
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
    toolTip: {
      shared: true,
    },
    zoomEnabled: true,
    data: [
      candles && candles.length > 0 && {
        name: 'Price',
        type: 'line',
        showInLegend: true,
        xValueFormatString: 'YYYY-MM-DD HH:mm',
        dataPoints: candles.map(x => ({
          x: x.ts,
          y: x.close,
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
          markerColor: x.action === 'buy' ? 'green' : 'red',
        })),
      })),
    ].filter(x => !!x),
  };

  return (
    <CanvasChartReact.CanvasJSChart options={options} />
  )
}