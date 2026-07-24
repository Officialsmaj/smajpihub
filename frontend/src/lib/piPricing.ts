import { formatPiAmount, formatUsdAmount } from "./formatters";

export const PI_USDT_RATE = 314159;

export const piFromUsdt = (value: number) =>
  Number.isFinite(value) && value > 0 ? value / PI_USDT_RATE : 0;

export const usdtFromPi = (value: number) =>
  Number.isFinite(value) && value > 0 ? value * PI_USDT_RATE : 0;

export const formatPiRate = () =>
  `1 Pi = ${PI_USDT_RATE.toLocaleString()} USDT`;

export const formatPiWithUsdt = (piAmount: number) =>
  `${formatPiAmount(piAmount)} · ${formatUsdAmount(usdtFromPi(piAmount))}`;
