<script lang="ts">
import { nodes, edges, tracks, selectedNodeId } from '../store'; // 引入 tracks，删掉 initialTracks  import { initialTracks } from '../data';

  $: focusNode = $nodes.find(n => n.id === $selectedNodeId);
  $: relatedEdges = $edges.filter(e => e.source === $selectedNodeId || e.target === $selectedNodeId);

  // 通用更新节点引擎
  function updateNode(updates: Partial<typeof $nodes[0]>) {
    $nodes = $nodes.map(n => n.id === $selectedNodeId ? { ...n, ...updates } : n);
  }

  function deleteNode() {
    if (!confirm("确定要在历史长河中抹除这个文明吗？")) return;
    $edges = $edges.filter(e => e.source !== $selectedNodeId && e.target !== $selectedNodeId);
    $nodes = $nodes.filter(n => n.id !== $selectedNodeId);
    $selectedNodeId = null;
  }

  function updateEdgeType(id: string, type: string) {
    $edges = $edges.map(e => e.id === id ? { ...e, type: type === 'unknown' ? undefined : type as any } : e);
  }

  function deleteEdge(id: string) {
    $edges = $edges.filter(e => e.id !== id);
  }

  function getNodeName(id: string) {
    return $nodes.find(n => n.id === id)?.label || '未知实体';
  }
</script>

{#if $selectedNodeId && focusNode}
  <div class="absolute right-0 top-0 w-80 h-full bg-[#0B101E]/95 border-l border-slate-800 p-6 z-[2000] shadow-2xl flex flex-col gap-5 overflow-y-auto backdrop-blur-xl pointer-events-auto">
    <div class="flex justify-between items-center border-b border-slate-800 pb-3">
      <h2 class="text-indigo-400 font-black tracking-widest text-sm">文明属性档案</h2>
      <button on:click={() => $selectedNodeId = null} class="text-slate-500 hover:text-white bg-slate-800 hover:bg-red-900 rounded-full w-7 h-7 flex items-center justify-center transition-colors">✕</button>
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-[10px] text-slate-500 font-bold uppercase">文明名称</label>
      <input type="text" value={focusNode.label} on:input={(e) => updateNode({ label: e.currentTarget.value })} 
             class="bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm outline-none focus:border-indigo-500" />
    </div>
    <div class="flex flex-col gap-1.5">
      <label class="text-[10px] text-slate-500 font-bold uppercase">历史注记</label>
      <textarea value={focusNode.description || ''} 
                on:input={(e) => updateNode({ description: e.currentTarget.value })} 
                placeholder="暂无历史注记..."
                class="bg-slate-900/80 border border-slate-700 rounded p-2 text-slate-300 text-xs leading-relaxed outline-none focus:border-indigo-500 resize-none h-28 custom-scrollbar"></textarea>
    </div>
<div class="flex flex-col gap-1.5">
      <label class="text-[10px] text-slate-500 font-bold uppercase">阵营色彩</label>
      <select value={focusNode.trackId} on:change={(e) => updateNode({ trackId: e.currentTarget.value })}
              class="bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm outline-none focus:border-indigo-500 cursor-pointer">
        {#each $tracks as track}  <option value={track.id}>{track.label}</option>
        {/each}
      </select>
    </div>

    <div class="flex flex-col gap-1.5 p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
      <label class="text-[10px] text-slate-500 font-bold uppercase mb-1">存活纪元 (绝对锁定宽度)</label>
      <div class="flex gap-2 items-center">
        <input type="number" value={focusNode.startYear} on:input={(e) => updateNode({ startYear: parseInt(e.currentTarget.value) || 0 })} 
               class="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-emerald-400 text-sm outline-none text-center font-mono" />
        <span class="text-slate-600 font-black">➔</span>
        <input type="number" value={focusNode.endYear} on:input={(e) => updateNode({ endYear: parseInt(e.currentTarget.value) || 0 })} 
               class="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-red-400 text-sm outline-none text-center font-mono" />
      </div>
    </div>

    <div class="flex flex-col gap-3 mt-2 border-t border-slate-800 pt-4 flex-1">
      <label class="text-[10px] text-slate-500 font-bold uppercase">关联脉络 ({relatedEdges.length})</label>
      <div class="flex flex-col gap-2 overflow-y-auto">
        {#each relatedEdges as edge}
          {@const isSource = edge.source === $selectedNodeId}
          <div class="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-xs">
            <div class="flex justify-between items-center text-slate-300 mb-2">
              <span class="truncate pr-2">{isSource ? '输出 ➔' : '承受 ⬅'} <span class="font-bold">{getNodeName(isSource ? edge.target : edge.source)}</span></span>
              <button on:click={() => deleteEdge(edge.id)} class="text-slate-500 hover:text-red-400">✕</button>
            </div>
            <select value={edge.type || 'unknown'} on:change={(e) => updateEdgeType(edge.id, e.currentTarget.value)} 
                    class="bg-slate-950 border border-slate-700 rounded w-full p-1.5 text-slate-400 outline-none">
              <option value="unknown">⚪ 模糊交互</option><option value="war">🔴 战争与征服</option>
              <option value="trade">🟢 贸易与文化</option><option value="succession">🔵 继承与分裂</option>
            </select>
          </div>
        {/each}
      </div>
    </div>

    <button on:click={deleteNode} class="mt-auto bg-red-950/40 hover:bg-red-900 text-red-400 py-3 rounded-lg font-bold text-sm border border-red-900/50 transition-colors">
      🗑️ 抹除此文明
    </button>
  </div>
{/if}

<style>
  input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
</style>