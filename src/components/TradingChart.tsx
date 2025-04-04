'use client';

// @ts-expect-error CanvasJS is not typed
import CanvasChartReact from '@canvasjs/react-stockcharts';
import * as R from 'remeda';
import { useDarkTheme } from './layout/ThemeSwitch';
import { Candle } from '@/lib/retsuko/interfaces/Candle';
import { SignalKind, Trade } from '@/lib/retsuko/interfaces/Trade';
import { DebugIndicator } from '@/lib/retsuko/interfaces/Backtest';

interface Props {
  title: string;

  candles?: Candle[];

  tradesList?: Trade[][];
  indicators?: DebugIndicator[];

  showBalance?: boolean;
  logarithmicBalance?: boolean;
  showTrades?: boolean;
  showIndicators?: boolean;
}

export function TradingChart({
  title,
  candles,
  tradesList,
  indicators,
  showBalance,
  logarithmicBalance,
  showTrades,
  showIndicators,
}: Props) {
  const [isDark] = useDarkTheme();

  const indicatorsByIndex = Object.entries(R.groupBy(indicators ?? [], x => x.index))
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

  let height = 200;
  if (candles && candles.length > 0) {
    height += 300;
  }
  if (showIndicators) {
    height += indicatorsByIndex.length * 170;
  }

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

  const options = {
    theme: isDark ? 'dark1' : 'light1',
    title: {
      text: title,
      fontSize: 30,
    },
    rangeSelector: {
      height: 50,
      buttonStyle: {
        labelFontSize: 16,
      },
      inputFields: {
        style: {
          fontSize: 16,
        },
      },
    },
    navigator: {
      height: 100,
    },
    charts: [
      candles && candles.length > 0 && {
        height: 300,
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
              x: new Date(x.ts),
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
              x: new Date(x.ts),
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
              x: new Date(x.ts),
              y: x.price,
              z: x.signal,
              markerColor: x.signal === SignalKind.long ? 'green' : 'red',
            })),
          })),
        ],
      },
      ...(showIndicators ? indicatorsByIndex.map(([index, indicators]) => ({
        height: 170,
        axisX,
        axisY: {
          title: `indicators[${index}]`,
        },
        toolTip,
        data: indicators.map((data) => ({
          name: data.name,
          type: 'line',
          showInLegend: true,
          xValueFormatString: 'YYYY-MM-DD HH:mm',
          yValueFormatString: '0.00',
          dataPoints: data.values.map(({ ts, value }) => ({
            x: new Date(ts),
            y: value,
          })),
        })),
      })) : []),
    ],
  };

  const containerProps = {
    width: '90%',
    height: `${height}px`,
  };

  return (
    <CanvasChartReact.CanvasJSStockChart key={height.toString()} containerProps={containerProps} options={options} />
  )
}
