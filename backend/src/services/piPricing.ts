export const PI_USDT_RATE = 314159;

export const piFromUsdt = (priceUsdt: unknown) => {
  const amount = Number(priceUsdt);
  return Number.isFinite(amount) && amount > 0 ? amount / PI_USDT_RATE : 0;
};
