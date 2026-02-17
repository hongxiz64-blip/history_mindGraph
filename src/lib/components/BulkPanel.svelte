<script lang="ts">
  import { nodes, tracks } from '../store';
  import { COLOR_PALETTE } from '../data';

  export let onClose: () => void;
  
  let inputText = "";
  let errorMsg = "";

  function executeBulkInsert() {
    if (!inputText.trim()) return;

    const lines = inputText.split('\n');
    let newNodes = [];
    let startY = 100; // 给新节点分配阶梯式的初始 Y 坐标

    for (const line of lines) {
      if (!line.trim()) continue;
      
      // 容错切割：支持中英文逗号、以及 Excel 的制表符(Tab)
      const parts = line.split(/[,，\t]+/).map(s => s.trim());

      if (parts.length < 3) {
        errorMsg = `解析失败: "${line}" 缺少必要参数(名称,起,终)`;
        return;
      }

      const label = parts[0];
      let startYear = parseInt(parts[1], 10);
      let endYear = parseInt(parts[2], 10);

      if (isNaN(startYear) || isNaN(endYear)) {
        errorMsg = `年份必须是数字: "${line}"`;
        return;
      }

      if (startYear > endYear) {
        [startYear, endYear] = [endYear, startYear];
      }

      const trackName = parts[3];
      // 【核心修复】：将索引 4 之后所有被意外切碎的文本，用全角逗号重新缝合起来
      const description = parts.slice(4).join('，').trim(); 
      let finalTrackId = ""; // 之前修复过的 TS 报错点
      // 阵营智能嗅探与创世
      if (trackName) {
        let existingTrack = $tracks.find(t => t.label === trackName);
        if (!existingTrack) {
          const existingColors = $tracks.map(t => t.color);
          const availableColor = COLOR_PALETTE.find(c => !existingColors.includes(c)) || COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
          const newTrackId = 't_' + Math.random().toString(36).substr(2, 6);
          
          existingTrack = { id: newTrackId, label: trackName, order: $tracks.length, color: availableColor };
          $tracks = [...$tracks, existingTrack];
        }
        finalTrackId = existingTrack.id;
      }

      newNodes.push({
        id: 'n_' + Math.random().toString(36).substr(2, 6),
        label,
        startYear,
        endYear,
        trackId: finalTrackId, // 没有名字就是 undefined (玻璃态)
        description,
        y: startY // 阶梯排布，防止重叠
      });

      startY += 65; // 下一个国家往下挪 65 像素
    }

    $nodes = [...$nodes, ...newNodes];
    onClose(); // 注入完毕，功成身退
  }
</script>

<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[3000] flex items-center justify-center pointer-events-auto">
  <div class="bg-[#0f172a] border border-slate-700 w-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
    
    <div class="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50">
      <h2 class="text-emerald-400 font-black tracking-widest text-sm uppercase">⚡ 批量降临控制台</h2>
      <button on:click={onClose} class="text-slate-500 hover:text-white">✕</button>
    </div>

    <div class="p-6 flex flex-col gap-4">
      <div class="text-xs text-slate-400 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800">
        <p class="font-bold text-slate-300 mb-1">支持从 Excel 或文本直接复制粘贴。格式法则：</p>
        <code class="text-emerald-500 font-mono">名称, 起始年份, 终止年份, [阵营名], [历史注记]</code>
        <p class="mt-2 text-slate-500">示例：<br>雅典城邦, -800, -338, 希腊文明圈<br>神秘海民, -1200, -1178 (没有阵营则降级为玻璃态)</p>
      </div>

      <textarea bind:value={inputText} on:input={() => errorMsg = ""}
                placeholder="在此粘贴历史数据..."
                class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 font-mono outline-none focus:border-emerald-500 resize-none custom-scrollbar"></textarea>
      
      {#if errorMsg}
        <div class="text-red-400 text-xs font-bold bg-red-900/20 p-2 rounded border border-red-900/50">{errorMsg}</div>
      {/if}
    </div>

    <div class="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
      <button on:click={onClose} class="px-5 py-2 rounded-lg text-slate-400 hover:text-white text-sm font-bold transition-colors">取消</button>
      <button on:click={executeBulkInsert} class="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg text-sm font-black tracking-wider shadow-lg transition-transform active:scale-95">注入时空</button>
    </div>
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 6px; }
</style>