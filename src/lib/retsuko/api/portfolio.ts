import { AccountPortfolio } from '../interfaces/AccountPortfolio';

const BACKEND_URL = process.env.BACKEND_URL;

export async function getPortfolio(): Promise<AccountPortfolio> {
  const response = await fetch(`${BACKEND_URL}/portfolio`);
  const data = await response.json();

  return data;
}
