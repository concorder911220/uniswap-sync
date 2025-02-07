export class CreatePoolDto {
  liquidity: string;
  sqrtPrice: string;
  tick?: string; // Optional property
  feeTier: string;
  token0: {
    symbol: string;
    id: string;
    decimals: number;
  };
  token1: {
    symbol: string;
    id: string;
    decimals: number;
  };
}

export class CreatePoolEetherDto {
  liquidity: string;
  sqrtPrice: string;
  tick: string;
  feeTier: string;
  token0: string;
  token1: string;
}
