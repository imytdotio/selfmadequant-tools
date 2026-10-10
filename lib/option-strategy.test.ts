import { describe,it,expect } from 'vitest'
import { expirationPnL,strategyRisk,strategyValue,strategyGreeks,type StrategyLeg } from './option-strategy'
import { DEFAULT_OPTION } from './options-pricing'
const call:StrategyLeg={id:1,kind:'call',side:1,quantity:1,strike:100,premium:6}
describe('option strategy accounting',()=>{
  it('handles debit spreads and exact break-even',()=>{
    const legs=[call,{...call,id:2,side:-1 as const,strike:110,premium:2}]
    expect(strategyRisk(legs)).toMatchObject({maxProfit:600,maxLoss:400,breakevens:[104]})
    expect(expirationPnL(legs,104)).toBe(0)
  })
  it('detects naked call tail risk and bounded long puts',()=>{
    expect(strategyRisk([{...call,side:-1}])).toMatchObject({maxProfit:600,maxLoss:Infinity,breakevens:[106]})
    expect(strategyRisk([{...call,kind:'put'}])).toMatchObject({maxProfit:9400,maxLoss:600,breakevens:[94]})
  })
  it('accounts for stock in shares and covered calls',()=>{
    const legs:StrategyLeg[]=[{...call,kind:'stock',quantity:100,premium:100},{...call,side:-1,strike:110,premium:2}]
    expect(strategyRisk(legs)).toMatchObject({maxProfit:1200,maxLoss:9800,breakevens:[98]})
    expect(expirationPnL(legs,150)).toBe(1200)
  })
  it('matches expiry valuation and offsets opposite legs',()=>{
    const legs=[call,{...call,id:2,side:-1 as const}]
    expect(strategyRisk(legs).allBreakeven).toBe(true)
    expect(strategyValue([call],{...DEFAULT_OPTION,days:0,spot:112})).toBe(expirationPnL([call],112))
    expect(strategyGreeks(legs,DEFAULT_OPTION)).toEqual({delta:0,gamma:0,theta:0,vega:0,rho:0})
  })
})
