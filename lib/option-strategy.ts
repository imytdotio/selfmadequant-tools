import { optionPrice, type OptionInputs, type OptionKind } from './options-pricing'
export type StrategyLeg = { id: number; kind: OptionKind | 'stock'; side: 1 | -1; quantity: number; strike: number; premium: number }
export function expirationPnL(legs: StrategyLeg[], spot: number) {
  return legs.reduce((total, leg) => total + leg.side * leg.quantity * (leg.kind === 'stock' ? spot - leg.premium : 100 * (Math.max(leg.kind === 'call' ? spot - leg.strike : leg.strike - spot, 0) - leg.premium)), 0)
}
export function strategyValue(legs: StrategyLeg[], input: OptionInputs) {
  return legs.reduce((total, leg) => total + leg.side * leg.quantity * (leg.kind === 'stock' ? input.spot - leg.premium : 100 * (optionPrice({ ...input, strike: leg.strike }, leg.kind) - leg.premium)), 0)
}
export function strategyRisk(legs: StrategyLeg[]) {
  if (!legs.length) return { maxProfit: 0, maxLoss: 0, breakevens: [] as number[], allBreakeven: true }
  const knots = [...new Set([0, ...legs.filter(l => l.kind !== 'stock').map(l => l.strike)])].sort((a,b) => a-b)
  const values = knots.map(s => expirationPnL(legs,s))
  const slope = legs.reduce((n,l) => n + (l.kind === 'put' ? 0 : l.side*l.quantity*(l.kind === 'stock' ? 1 : 100)), 0)
  const breakevens: number[] = []
  for (let i=0;i<knots.length;i++) {
    if (Math.abs(values[i]) < 1e-8) breakevens.push(knots[i])
    if (i>0 && values[i-1]*values[i]<0) breakevens.push(knots[i-1]-values[i-1]*(knots[i]-knots[i-1])/(values[i]-values[i-1]))
  }
  const last = knots.length-1
  if (Math.abs(slope)>1e-8) { const root=knots[last]-values[last]/slope; if (root>knots[last]) breakevens.push(root) }
  return { maxProfit: slope>1e-8 ? Infinity : Math.max(...values), maxLoss: slope < -1e-8 ? Infinity : Math.max(0,-Math.min(...values)), breakevens: [...new Set(breakevens)], allBreakeven: values.every(v=>Math.abs(v)<1e-8)&&Math.abs(slope)<1e-8 }
}
export function strategyGreeks(legs: StrategyLeg[], input: OptionInputs) {
  const value = (patch: Partial<OptionInputs>) => strategyValue(legs,{...input,...patch})
  const h = Math.min(input.spot/2,Math.max(.001,input.spot*.001)), base=value({})
  return {
    delta: (value({spot:input.spot+h})-value({spot:input.spot-h}))/(2*h),
    gamma: (value({spot:input.spot+h})-2*base+value({spot:input.spot-h}))/(h*h),
    theta: value({days:Math.max(0,input.days-1)})-base,
    vega: value({volatility:input.volatility+1})-base,
    rho: value({rate:input.rate+1})-base,
  }
}
