'use client';

import { Sparklines, SparklinesLine, SparklinesReferenceLine } from 'react-sparklines';
import { useDarkTheme } from './layout/ThemeSwitch';

interface Props {
  data: number[];
  reference?: number;
}

export function SimpleChart({ data, reference }: Props) {
  const [isDark] = useDarkTheme();

  const min = Math.min(...data);
  const max = Math.max(...data);
  const referenceValue = reference === undefined
    ? undefined
    : Math.min(57, (max - reference) / (max - min) * 60);

  return (
    <Sparklines data={data}>
      <SparklinesLine color={isDark ? '#f8f8f2' : '#282C34'} />
      {
        reference !== undefined && (
          <SparklinesReferenceLine type='custom' value={referenceValue} />
        )
      }
    </Sparklines>
  );
}
