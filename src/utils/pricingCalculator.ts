export type WeightUnit = 'kg' | 'quintal' | 'ton';
export type PriceUnit = 'kg' | 'quintal';

/**
 * Normalizes any quantity to kilograms (kg)
 * 1 quintal = 100 kg
 * 1 ton = 1,000 kg
 */
export function normalizeToKg(quantity: number, unit: WeightUnit): number {
  if (quantity < 0) return 0;
  switch (unit) {
    case 'quintal':
      return quantity * 100;
    case 'ton':
      return quantity * 1000;
    case 'kg':
    default:
      return quantity;
  }
}

/**
 * Normalizes price to price per kg
 */
export function normalizePricePerKg(price: number, priceUnit: PriceUnit): number {
  if (price <= 0) return 0;
  if (priceUnit === 'quintal') {
    return price / 100;
  }
  return price;
}

/**
 * Converts price per kg to target unit
 */
export function convertPricePerKgTo(pricePerKg: number, targetUnit: PriceUnit): number {
  if (targetUnit === 'quintal') {
    return pricePerKg * 100;
  }
  return pricePerKg;
}

/**
 * Calculates total valuation for a crop or offer
 */
export function calculateTotalOfferValue(
  price: number,
  priceUnit: PriceUnit,
  quantity: number,
  quantityUnit: WeightUnit
): number {
  const totalKg = normalizeToKg(quantity, quantityUnit);
  const pricePerKg = normalizePricePerKg(price, priceUnit);
  return Math.round(totalKg * pricePerKg);
}

export interface PriceComparison {
  diffAmountPerKg: number;
  diffPercent: number;
  isFavorable: boolean; // offer >= benchmark or expected
  badgeText: string;
  badgeColor: 'emerald' | 'amber' | 'red';
}

/**
 * Compares an offered price against benchmark (or expected farmer price)
 */
export function compareWithBenchmark(
  offeredPrice: number,
  offeredPriceUnit: PriceUnit,
  benchmarkPrice: number,
  benchmarkPriceUnit: PriceUnit
): PriceComparison {
  const offerKg = normalizePricePerKg(offeredPrice, offeredPriceUnit);
  const benchmarkKg = normalizePricePerKg(benchmarkPrice, benchmarkPriceUnit);

  if (benchmarkKg === 0) {
    return {
      diffAmountPerKg: 0,
      diffPercent: 0,
      isFavorable: true,
      badgeText: 'Fair Market',
      badgeColor: 'emerald',
    };
  }

  const diffAmountPerKg = offerKg - benchmarkKg;
  const diffPercent = Math.round(((offerKg - benchmarkKg) / benchmarkKg) * 100 * 10) / 10;

  if (diffPercent >= 5) {
    return {
      diffAmountPerKg,
      diffPercent,
      isFavorable: true,
      badgeText: `+${diffPercent}% Above Market`,
      badgeColor: 'emerald',
    };
  } else if (diffPercent >= -5) {
    return {
      diffAmountPerKg,
      diffPercent,
      isFavorable: true,
      badgeText: 'Near Market Benchmark',
      badgeColor: 'emerald',
    };
  } else if (diffPercent >= -15) {
    return {
      diffAmountPerKg,
      diffPercent,
      isFavorable: false,
      badgeText: `${diffPercent}% Below Market`,
      badgeColor: 'amber',
    };
  } else {
    return {
      diffAmountPerKg,
      diffPercent,
      isFavorable: false,
      badgeText: `${diffPercent}% Underpriced`,
      badgeColor: 'red',
    };
  }
}
