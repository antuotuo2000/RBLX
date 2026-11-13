# WANGAN Research

24 份中文投资研究集中于本仓库，由 GitHub Pages 的 `main /docs` 发布。

- 首页：`docs/index.html`
- 报告：`docs/reports/<TICKER>/index.html`
- 研究记录：`research/reports.json`（包含来源、数据期、14 项分析与情景参数）
- 共用样式与交互：`docs/assets/research.css`、`research.js`
- 更新日期：2026-11-13；各报告的财报截止期不同，具体见页内标注。

## 重新生成

```sh
python3 research/build_data.py
python3 scripts/build.py
```

`build_data.py` 是本次逐公司编写的结构化研究内容。修改后重新运行以上两步。
默认估值参数为敏感性分析假设，不是实时行情、目标价或保证回报。
模型按业务类型区分盈利、收入及成熟利润、净资产、指数总回报。
各报告支持章节导航、打印和全屏演示；浏览器不支持原生全屏时仍可在页面内演示。

既有目录中的附属新闻、管理层和风险专题继续保留原站链接；本次重做范围为 24 份主报告。
原 `docs/roblox.html` 自动跳转到新报告，旧内容可从 Git 历史查阅。
