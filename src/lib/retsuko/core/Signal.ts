export type SignalKind = (
  | 'long'
  | 'short'
  | 'closeLong'
  | 'closeShort'
  | 'close'
)

export type SignalWithConfidence = {
  type: SignalKind;
  confidence: number;
}

export type Signal = (
  | SignalKind
  | SignalWithConfidence
)

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Signal {
  export function format(signal: Signal): SignalWithConfidence {
    if (typeof signal === 'string') {
      return {
        type: signal,
        confidence: 1,
      };
    }

    return signal;
  }
}