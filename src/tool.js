/*! Eretek Online Araçlar #100 — BT Değişiklik ve Geri Dönüş Planı */
ERT.def('100', {
	run: function (v, c) {
		var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(v.start || '');
		if (!m) { throw c.fe('start', 'req'); }
		var t0 = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
		var parse = function (txt, f, max) { return c.lines(txt || '', max, f).map(function (l, i) { var p = /^(\d+(?:[.,]\d+)?)\s*[;|]\s*(.+)$/.exec(l); if (!p) { throw c.fe(f, 'stepFmt', { r: i + 1 }); } return { min: ERT.parseNum(p[1].replace(',', '.'), 'en'), d: p[2].trim() }; }); };
		var steps = parse(v.steps, 'steps', 100), rb = v.rollback ? parse(v.rollback, 'rollback', 100) : [];
		if (!steps.length) { throw c.fe('steps', 'req'); }
		var hm = function (t) { return new Date(t).toISOString().slice(11, 16); }, tl = [], t = t0, sum = 0, rsum = 0;
		steps.forEach(function (s, i) { tl.push([i + 1, hm(t), hm(t + s.min * 60000), s.min, s.d]); t += s.min * 60000; sum += s.min; });
		rb.forEach(function (s) { rsum += s.min; });
		var lastGo = v.dur - rsum, msgs = [], vv = { impl: sum, rollback: rsum, slack: v.dur - sum - rsum };
		msgs.push(sum + rsum <= v.dur ? ['ok', c.t('fits', { s: v.dur - sum - rsum })] : ['err', c.t('nofit', { s: sum + rsum - v.dur })]);
		if (!rb.length) { msgs.push(['err', c.t('noRb')]); }
		if (!v.checks) { msgs.push(['warn', c.t('noChk')]); }
		if (v.risk === 'high' && !v.approvers) { msgs.push(['warn', c.t('noAppr')]); }
		msgs.push(['info', c.t('pnr', { t: hm(t0 + Math.max(0, lastGo) * 60000) })]);
		var md = [], L = function (s) { md.push(s); };
		L('# ' + (v.title || c.t('defTitle'))); L('');
		L('| ' + c.t('k_sys') + ' | ' + (v.system || '–') + ' |'); L('|---|---|');
		L('| ' + c.t('k_win') + ' | ' + m[1] + '-' + m[2] + '-' + m[3] + ' ' + m[4] + ':' + m[5] + ' – ' + hm(t0 + v.dur * 60000) + ' (' + v.dur + ' ' + c.t('min') + ') |');
		L('| ' + c.t('k_risk') + ' | ' + c.t('r_' + v.risk) + ' |'); L('| ' + c.t('k_appr') + ' | ' + (v.approvers || '–') + ' |'); L('| ' + c.t('k_pnr') + ' | ' + hm(t0 + Math.max(0, lastGo) * 60000) + ' |'); L('');
		L('## ' + c.t('h_steps')); L(''); L('| # | ' + c.t('c_s') + ' | ' + c.t('c_e') + ' | ' + c.t('c_m') + ' | ' + c.t('c_d') + ' | ✓ |'); L('|---|---|---|---|---|---|');
		tl.forEach(function (r) { L('| ' + r[0] + ' | ' + r[1] + ' | ' + r[2] + ' | ' + r[3] + ' | ' + r[4].replace(/\|/g, '/') + ' | ☐ |'); }); L('');
		L('## ' + c.t('h_checks')); L(''); c.lines(v.checks || '', 100, 'checks').forEach(function (x) { L('- [ ] ' + x); }); if (!v.checks) { L('- [ ] –'); } L('');
		L('## ' + c.t('h_rb')); L(''); L(c.t('trigger') + ': ' + (v.trigger || '–')); L('');
		rb.forEach(function (s, i) { L((i + 1) + '. ' + s.d + ' (' + s.min + ' ' + c.t('min') + ')'); }); if (!rb.length) { L('–'); } L('');
		L('## ' + c.t('h_comm')); L(''); c.lines(v.comm || '', 100, 'comm').forEach(function (x) { L('- ' + x); }); if (!v.comm) { L('–'); } L('');
		var text = md.join('\n');
		return { big: c.t('big', { n: steps.length, s: sum, r: rsum }), msgs: msgs, tables: [{ cols: ['#', c.t('c_s'), c.t('c_e'), c.t('c_m'), c.t('c_d')], rows: tl }], pre: { h: 'Markdown', text: text }, x: { md: { name: 'change-plan', text: text }, copy: text }, v: vv };
	}
});
