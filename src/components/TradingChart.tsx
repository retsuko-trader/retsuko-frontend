'use client';

import { SimpleCandle } from '@/lib/retsuko/tables';
// @ts-expect-error CanvasJS is not typed
import CanvasChartReact from '@canvasjs/react-charts';

export const ssr = 'false';

interface Props {
  title: string;

  candles?: SimpleCandle[];

  trades?: Array<{
    ts: Date;
    action: 'buy' | 'sell';
    asset: number;
    currency: number;
    price: number;
    profit: number;
  }>;

  showBalance?: boolean;
}

export function TradingChart({
  title,
  candles,
  trades,
  showBalance,
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
        color: 'red',
        lineColor: 'red',
        showInLegend: true,
        xValueFormatString: 'YYYY-MM-DD HH:mm',
        dataPoints: candles.map(x => ({
          x: x.ts,
          y: x.close,
        })),
      },
      showBalance && trades && {
        name: 'Balance',
        type: 'stepLine',
        color: 'blue',
        lineColor: 'blue',
        showInLegend: true,
        xValueFormatString: 'YYYY-MM-DD HH:mm',
        yValueFormatString: '0.00',
        axisYType: 'secondary',
        dataPoints: trades.map(x => ({
          x: x.ts,
          y: x.asset * x.price + x.currency,
        })),
      },
      trades && {
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
      },
    ].filter(x => !!x),
  };

  return (
    <CanvasChartReact.CanvasJSChart options={options} />
  )
}