# -*- coding: utf-8 -*-
from pathlib import Path
import json,re,html
ROOT=Path(__file__).resolve().parents[1]
D=ROOT/'docs'; DATA=json.loads((ROOT/'research/reports.json').read_text())
def esc(x):return html.escape(str(x),quote=True)
chapters=[('business','业务与收入结构','BUSINESS MODEL',0,2),('moat','行业与护城河','COMPETITIVE ADVANTAGE',2,6),('peers','同行竞争格局','COMPETITIVE LANDSCAPE',6,8),('finance','财务质量与估值','FINANCIAL QUALITY',8,11),('risk','风险与投资决策','INVESTMENT DISCIPLINE',11,14)]
labels=['主营业务','收入来源','护城河','增长驱动','规模与成本','品牌与信任','同行竞争','优势检验','盈利质量','现金与资本','估值逻辑','关键风险','观察指标','决策条件']
svg='<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5"/></svg>'
def form(r):
 m=r['model'];typ=m[0]
 if typ=='index':
  fields=[('priceGrowth','年价格回报假设（%）',m[1],-99,100),('yield','分配收益率假设（%）',m[2],0,30),('fee','基金年费率（%）',m[3],0,10),('years','持有年数',m[4],1,30)]
  note='起始净值归一为 100。假设分配在每年年末再投资；价格回报为费用前、不含分配的假设，已包含估值变化。未计税费、交易成本和换汇。'
  formula='期末指数 = 100 × [(1 + 年价格回报 + 分配收益率) × (1 − 年费率)] ^ 年数。年化总回报由期末指数反推。'
 elif typ=='sales':
  fields=[('entry','买入 P/S 假设（倍）',m[1],.1,100),('growth','总收入年增长（%）',m[2],-99,100),('exit','退出 P/E 假设（倍）',m[3],1,100),('dilution','年股数增长 / 稀释（%）',m[4],-20,50),('years','持有年数',m[5],1,30),('margin','期末净利润率（%）',m[6],0,80)]
  note='采用股权市值 / 收入（P/S），不是企业价值 / 收入（EV/S）。长期净利率需包含利息和税，股数变化显式计入；未来融资还可能改变业务和利润率。默认数值全部为研究情景，非市场报价或公司承诺。'
  formula='期末价格指数 = 100 × [(1 + 收入增长)/(1 + 股数增长)] ^ 年数 × 期末净利率 × 退出 P/E ÷ 买入 P/S。未计分红与税费。'
 else:
  metric='P/B' if typ=='book' else 'P/E';growth='每股净资产年增长（%）' if typ=='book' else '正常化每股盈利年增长（%）'
  fields=[('entry','买入 '+metric+' 假设（倍）',m[1],.1,100),('growth',growth,m[2],-99,100),('exit','退出 '+metric+' 假设（倍）',m[3],.1,100),('yield','年现金分配 / 初始投资（%）',m[4],0,30),('years','持有年数',m[5],1,30)]
  note='起始投资归一为 100；每股增长已包含净股数变化，不额外叠加回购。现金分配按初始投资的固定比例逐年累加、不再投资。默认倍数与增长均为情景，不是当前估值。'+('每股净资产模型无法完整体现经营企业的内在价值。' if typ=='book' else '')
  formula='期末价格指数 = 100 × (1 + 每股增长)^年数 × 退出倍数 ÷ 买入倍数；期末总财富加上累计现金分配。年化财富增长由总财富反推，不是逐期现金流 IRR。'
 inputs=''.join(f'<label>{esc(label)}<input data-key="{key}" type="number" value="{value}" min="{minimum}" max="{maximum}" step="any" required></label>' for key,label,value,minimum,maximum in fields)
 return f'<div class="panel model" data-model="{typ}"><p>{esc(note)}</p><div class="inputs">{inputs}</div><div class="model-result" aria-live="polite"></div><p class="note">{esc(formula)}</p><p class="note">调整任一参数后即时重算。负回报表示本金损失；模型没有为估值结果赋予实现概率。</p><button class="reset-model" type="button">恢复研究情景</button></div>'
for r in DATA:
 t=r['ticker'];dest=D/'reports'/t;dest.mkdir(parents=True,exist_ok=True)
 src=r['sources'];source_links=''.join(f'<p id="source-{i+1}"><a href="{esc(x["url"])}" target="_blank" rel="noopener">[{i+1}] {esc(x["title"])} ↗</a></p>' for i,x in enumerate(src))
 facts=''.join(f'<div class="fact"><small>{esc(a)}</small><strong>{esc(b)}</strong><span>{esc(c)} <a href="#source-{2 if t=="NVDA" and j==2 else 1}">[{2 if t=="NVDA" and j==2 else 1}]</a></span></div>' for j,(a,b,c) in enumerate(r['facts']))
 navitems=[(a,b) for a,b,*_ in chapters]+[('valuation','估值与回报测算')]
 nav='<nav class="chapter-index" id="catalog" aria-label="报告章节"><div class="eyebrow">READING GUIDE</div><h2>按章节阅读</h2><p>先理解业务，再检验竞争、财务、风险与价格。</p><ol>'+''.join(f'<li><a href="#{a}"><span class="chapter-number">{i+1:02}</span><span>{b}</span><span aria-hidden="true">↓</span></a></li>' for i,(a,b) in enumerate(navitems))+'</ol><a class="source-entry" href="#sources">数据来源与研究口径 ↓</a></nav>'
 sections=''
 for i,(ident,title,en,lo,hi) in enumerate(chapters):
  cards=''
  for n in range(lo,hi):
   heading,text=r['rows'][n]
   body=''.join('<p>'+esc(x)+'</p>' for x in re.split(r'(?<=。)',text) if x)
   # Factual financial values link directly to the corresponding primary release.
   citation=' <a class="source-ref" href="#source-1">披露来源 [1]</a>' if n in (8,9) else ''
   cards+=f'<article class="insight"><div class="insight-meta"><span class="insight-number">{n+1:02}</span><span>{labels[n]}</span></div><h3>{esc(heading)}</h3><div class="insight-body">{body}{citation}</div></article>'
  prev=f'<a href="#{chapters[i-1][0]}">← 上一节：{chapters[i-1][1]}</a>' if i else '<span>报告开始</span>'
  nxt=navitems[i+1]
  pager=f'<nav class="chapter-pager" aria-label="章节切换">{prev}<a href="#catalog">返回目录 ↑</a><a href="#{nxt[0]}">下一节：{nxt[1]} →</a></nav>'
  sections+=f'<section id="{ident}" class="reading-section"><div class="section-heading"><div class="eyebrow">{i+1:02} / {en}</div><h2>{title}</h2><p class="section-deck">{esc(r["rows"][lo][0])}</p><p class="section-context">{esc(r["name"])} · {hi-lo} 个分析维度 · 研究判断与观察框架</p></div><div class="insight-grid">{cards}</div>{pager}</section>'
 type_names={'earnings':'每股盈利情景','sales':'收入与成熟利润情景','book':'每股净资产情景','index':'指数总回报情景'}
 canonical='https://antuotuo2000.github.io/RBLX/reports/'+t+'/'
 content=f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(r['name'])}（{t}）｜投资分析全景报告</title><meta name="description" content="{esc(r['thesis'])}"><link rel="canonical" href="{canonical}"><link rel="stylesheet" href="../../assets/research.css"></head><body data-ticker="{t}"><div class="masthead" id="top"><a href="../../"><b>WANGAN <em>RESEARCH</em></b></a><div><a href="../../">全部研究</a><a href="#catalog">章节目录</a><a href="#valuation">估值测算</a><button id="present" type="button"><span>全屏演示</span>{svg}</button></div></div><header><div><small>INDEPENDENT EQUITY RESEARCH / {esc(r['sector'])}</small><h1>{esc(r['name'])}，<br><em>{esc(r['headline'])}</em></h1><p>{esc(r['thesis'])}</p></div><div class="hero-side"><span>{t} / 研究更新 {r['date']}</span><strong>14 个维度</strong><span>{esc(r['period'])}<br>{type_names[r['model'][0]]} · 可全屏演示</span></div></header><main><div class="intro"><strong>研究结论</strong><p>{esc(r['thesis'])}</p><span class="note">财报事实见来源链接；其余为分析判断与前瞻情景。未接入实时行情，不据此声称当前低估或给出确定回报。</span></div><div class="facts" aria-label="已核实数据快照">{facts}</div>{nav}{sections}<section id="valuation"><h2>估值与回报测算</h2><p class="section-context">{type_names[r['model'][0]]} · 改变假设，检验价格与回报的关系</p>{form(r)}<nav class="chapter-pager"><a href="#risk">← 返回风险分析</a><a href="#catalog">返回目录 ↑</a><a href="#sources">数据来源 →</a></nav></section><section class="sources" id="sources"><h2>数据来源与研究口径</h2>{source_links}<p class="note">核查日期：2026-11-13。财报期：{esc(r['period'])}。B = 十亿，M = 百万；货币以指标标注为准。报告汇率与固定汇率、GAAP 与调整后指标分别列示，不混用。未来指引与模型均不是已实现结果。</p><p class="note">报告中的竞争优势、风险和决策条件是基于披露的研究判断，不是公司保证。模型默认参数用于敏感性分析，未包含个人税务、交易及换汇成本；本报告不构成个性化投资建议。</p><a href="#catalog">返回章节目录 ↑</a></section></main><footer><span>WANGAN RESEARCH · {t} · 2026.11.13</span><a href="../../">全部研究</a><button type="button" onclick="window.print()">打印 / 保存 PDF</button></footer><script src="../../assets/research.js"></script></body></html>'''
 (dest/'index.html').write_text(content,encoding='utf-8')
# Preserve homepage features and external supplementary research; route each main report locally.
index=(D/'index.html').read_text()
for r in DATA:
 t=r['ticker'];index=index.replace('href="https://antuotuo2000.github.io/'+t+'/"','href="reports/'+t+'/"')
index=index.replace('href="roblox.html"','href="reports/RBLX/"')
index=index.replace('中文研究 · 可交互估值 · 持续更新','24 份统一报告 · 情景估值 · 全屏演示')
index=index.replace('页面支持站内搜索；新报告需加入目录后才能在这里检索。','全部 24 份主报告已于 2026-11-13 重新分析并统一排版，支持章节导航与全屏演示。附属专题保留原链接；历史持仓标签不代表本次新增推荐。')
index=re.sub(r'<script id="research-analytics">.*?</script>','',index,flags=re.S)
index=re.sub(r'<span class="footer-wechat">.*?</span>','',index,flags=re.S)
(D/'index.html').write_text(index,encoding='utf-8')
(D/'roblox.html').write_text('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=reports/RBLX/"><title>Roblox 研究报告</title><a href="reports/RBLX/">打开更新后的 Roblox 报告</a></html>',encoding='utf-8')
urls=['https://antuotuo2000.github.io/RBLX/']+['https://antuotuo2000.github.io/RBLX/reports/'+r['ticker']+'/' for r in DATA]
(D/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+x+'</loc><lastmod>2026-11-13</lastmod></url>' for x in urls)+'</urlset>')
print('Built',len(DATA),'reports and updated local directory links')
