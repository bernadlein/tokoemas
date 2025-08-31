export type GoldPrice = { source: string; ts: number; priceUSD?: number; priceIDR?: number, error?: string }
async function tryJson(url: string, options?: any){
  try{ const r = await fetch(url, options); if(!r.ok) throw new Error(await r.text()); return await r.json() }catch(e:any){ return { __err: e?.message || 'error' } }
}
export async function fetchGoldPriceIDR(manualRateIDR?: number): Promise<GoldPrice>{
  const m = await tryJson('https://api.metals.live/v1/spot/gold')
  if(!m.__err && Array.isArray(m) && m.length){
    const last = Array.isArray(m[0]) ? m[m.length-1][1] : m[m.length-1]
    const usdPerGram = Number(last) / 31.1034768
    const usdToIdr = manualRateIDR ? manualRateIDR : 16000
    return { source: 'metals.live', ts: Date.now(), priceUSD: usdPerGram, priceIDR: usdPerGram * usdToIdr }
  }
  return { source: 'manual', ts: Date.now(), priceUSD: undefined, priceIDR: manualRateIDR || undefined, error: m.__err || 'fallback' }
}
export function applyMarkup(perGramIDR: number, category: 'perhiasan'|'logammulia', markups: { perhiasan: number, logammulia: number }){
  const pct = category === 'perhiasan' ? markups.perhiasan : markups.logammulia
  return perGramIDR * (1 + pct)
}
