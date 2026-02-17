import type { Track, Node, Edge } from './types';

// 【核心新增】：精选暗黑美学色卡库 (剔除了刺眼的纯色，保证沉浸感)
export const COLOR_PALETTE = [
  'bg-blue-900/40 border-blue-500 text-blue-100',       // 0: 经典蓝
  'bg-emerald-900/40 border-emerald-500 text-emerald-100', // 1: 翡翠绿
  'bg-red-900/40 border-red-500 text-red-100',         // 2: 帝国红
  'bg-amber-900/40 border-amber-500 text-amber-100',     // 3: 琥珀黄
  'bg-purple-900/40 border-purple-500 text-purple-100',   // 4: 贵族紫
  'bg-cyan-900/40 border-cyan-500 text-cyan-100',       // 5: 青色
  'bg-rose-900/40 border-rose-500 text-rose-100',       // 6: 玫瑰红
  'bg-fuchsia-900/40 border-fuchsia-500 text-fuchsia-100', // 7: 紫红
  'bg-teal-900/40 border-teal-500 text-teal-100',       // 8: 蓝绿
  'bg-orange-900/40 border-orange-500 text-orange-100',   // 9: 橙色
  'bg-indigo-900/40 border-indigo-500 text-indigo-100',   // 10: 靛蓝
  'bg-slate-800/60 border-slate-500 text-slate-200'      // 11: 中性灰
];

export const initialTracks: Track[] = [
  { id: 't_hellen', label: '希腊文明圈', order: 0, color: COLOR_PALETTE[0] },
  { id: 't_macedon', label: '马其顿与继业者', order: 1, color: COLOR_PALETTE[1] },
  { id: 't_rome', label: '罗马文明圈', order: 2, color: COLOR_PALETTE[2] }
];

// ... 下面的 initialNodes 和 initialEdges 保持你原有的不变 ...
export const initialNodes: Node[] = [
  { id: 'n_mycenae', trackId: 't_hellen', label: '迈锡尼文明', startYear: -1600, endYear: -1100, y: 100 },
  { id: 'n_athens', trackId: 't_hellen', label: '雅典城邦', startYear: -800, endYear: -338, y: 50 },
  { id: 'n_sparta', trackId: 't_hellen', label: '斯巴达城邦', startYear: -900, endYear: -192, y: 130 },
  { id: 'n_macedon', trackId: 't_macedon', label: '马其顿帝国', startYear: -359, endYear: -323, y: 220 },
  { id: 'n_seleucid', trackId: 't_macedon', label: '塞琉古帝国', startYear: -312, endYear: -63, y: 220 },
  { id: 'n_ptolemy', trackId: 't_macedon', label: '托勒密王朝', startYear: -305, endYear: -30, y: 300 },
  { id: 'n_rome_kingdom', trackId: 't_rome', label: '罗马王政', startYear: -753, endYear: -509, y: 400 },
  { id: 'n_rome_republic', trackId: 't_rome', label: '罗马共和国', startYear: -509, endYear: -27, y: 400 },
  { id: 'n_rome_empire', trackId: 't_rome', label: '罗马帝国', startYear: -27, endYear: 395, y: 400 },
  { id: 'n_west_rome', trackId: 't_rome', label: '西罗马帝国', startYear: 395, endYear: 476, y: 350 },
  { id: 'n_byzantine', trackId: 't_rome', label: '拜占庭帝国', startYear: 395, endYear: 1453, y: 450 }
];

export const initialEdges: Edge[] = [
  { id: 'e_peloponnesian', source: 'n_athens', target: 'n_sparta', type: 'war' },
  { id: 'e_mac_ath', source: 'n_macedon', target: 'n_athens', type: 'war' },
  { id: 'e_mac_sel', source: 'n_macedon', target: 'n_seleucid', type: 'succession' },
  { id: 'e_mac_pto', source: 'n_macedon', target: 'n_ptolemy', type: 'succession' },
  { id: 'e_rome_2', source: 'n_rome_republic', target: 'n_rome_empire', type: 'succession' },
  { id: 'e_rome_4', source: 'n_rome_empire', target: 'n_byzantine', type: 'succession' }
];