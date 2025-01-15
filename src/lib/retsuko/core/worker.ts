import { CandleLike } from './dataset';

const WORKER_URL = process.env.WORKER_URL || '';

export async function subscribeWorkerStream(input: CandleLike) {
  await fetch(`${WORKER_URL}/subscribe`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function unsubscribeWorkerStream(input: CandleLike) {
  await fetch(`${WORKER_URL}/unsubscribe`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}