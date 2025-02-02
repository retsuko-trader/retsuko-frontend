export type SignalKind = (
  | 'long'
  | 'short'
  | 'closeLong'
  | 'closeShort'
)

export type SignalWithConfidence = {
  action: 'long' | 'short';
  confidence: number;
} | {
  action: 'closeLong' | 'closeShort';
  confidence: 1;
}

// type checking test code
const x: { action: SignalKind, confidence: 1 } = { action: 'long', confidence: 1 };
x satisfies SignalWithConfidence;

export type Signal = (
  | SignalKind
  | SignalWithConfidence
)

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Signal {
  export function format(signal: Signal): SignalWithConfidence {
    if (typeof signal === 'string') {
      return {
        action: signal,
        confidence: 1,
      };
    }

    return signal;
  }

  export function summary(signal: Signal): 'long' | 'short' {
    const { action } = format(signal);
    if (['long', 'closeShort'].includes(action)) {
      return 'long';
    }

    return 'short';
  }
}