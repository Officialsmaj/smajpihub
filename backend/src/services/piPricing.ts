export const PI_USDT_RATE = 314159;

export const piFromUsdt = (priceUsdt: unknown) => {
  const amount = Number(priceUsdt);
  return Number.isFinite(amount) && amount > 0 ? amount / PI_USDT_RATE : 0;
};

export const usdtFromPi = (pricePi: unknown) => {
  const amount = Number(pricePi);
  return Number.isFinite(amount) && amount > 0 ? amount * PI_USDT_RATE : 0;
};

export const servicePaymentSnapshot = (priceUsdt: unknown) => {
  const normalizedUsdt = Number(priceUsdt);
  return {
    priceUsdt: Number.isFinite(normalizedUsdt) && normalizedUsdt > 0 ? normalizedUsdt : 0,
    amountPi: piFromUsdt(normalizedUsdt),
    piRateUsed: PI_USDT_RATE,
  };
};
