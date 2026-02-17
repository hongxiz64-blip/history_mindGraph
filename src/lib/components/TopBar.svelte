<script lang="ts">
  import { isLinkingMode, linkSourceId, selectedNodeId, isBulkPanelOpen } from '../store';
</script>

<div class="absolute top-6 w-full px-6 flex justify-center pointer-events-none z-[2000]">
  <div class="pointer-events-auto flex items-center h-12">
    {#if $isLinkingMode}
      <div class="bg-blue-600/90 text-white pl-6 pr-2 py-2 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] border border-blue-400 flex items-center gap-4 animate-pulse">
        <span class="font-bold text-sm">
          {$linkSourceId ? '步骤 2：请点击目标文明' : '步骤 1：请点击起源文明'}
        </span>
        <button on:click={() => { $isLinkingMode = false; $linkSourceId = null; }} 
                class="bg-blue-800 hover:bg-blue-900 border border-blue-400/50 px-4 py-1.5 rounded-full text-sm font-bold shadow-inner active:scale-95 transition-all">
          完成 (Esc)
        </button>
      </div>
    {:else}
      <div class="flex gap-4 items-center bg-slate-900/60 p-2 rounded-full border border-slate-700/50 backdrop-blur-md shadow-2xl">
        <button on:click={() => { $isLinkingMode = true; $selectedNodeId = null; }} 
                class="bg-slate-800 hover:bg-blue-600 border border-slate-600 hover:border-blue-400 text-white px-5 py-2 rounded-full shadow transition-all active:scale-95 font-bold text-xs tracking-wider">
          🔗 连续连线
        </button>
        
        <button on:click={() => $isBulkPanelOpen = true}
                class="bg-emerald-900/60 hover:bg-emerald-600 border border-emerald-700 hover:border-emerald-400 text-emerald-100 px-5 py-2 rounded-full shadow transition-all active:scale-95 font-bold text-xs tracking-wider">
          ⚡ 批量注入
        </button>
      </div>
    {/if}
  </div>
</div>