<script lang="ts">
  import { tracks, activeTrackId } from '../store';
  import { COLOR_PALETTE } from '../data';

  // 新建阵营：智能分配一个未使用的颜色
  function createNewTrack() {
    const existingColors = $tracks.map(t => t.color);
    const availableColor = COLOR_PALETTE.find(c => !existingColors.includes(c)) || COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    
    const newId = 't_' + Math.random().toString(36).substr(2, 6);
    const newTrack = {
      id: newId,
      label: '新阵营 ' + ($tracks.length + 1),
      order: $tracks.length,
      color: availableColor
    };
    
    $tracks = [...$tracks, newTrack];
    $activeTrackId = newId; // 自动切换到新画笔
  }

  // 重命名阵营
  function updateTrackName(id: string, newName: string) {
    $tracks = $tracks.map(t => t.id === id ? { ...t, label: newName } : t);
  }
</script>

<div class="absolute bottom-8 left-8 w-64 bg-[#0B101E]/95 border border-slate-800 rounded-xl shadow-2xl p-4 flex flex-col gap-3 backdrop-blur-xl z-[2000] pointer-events-auto">
  <div class="flex justify-between items-center border-b border-slate-800 pb-2">
    <h3 class="text-xs font-black tracking-widest text-slate-400 uppercase">时空阵营与画笔</h3>
  </div>

  <div class="flex flex-col gap-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
    {#each $tracks as track}
      <div class="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border {$activeTrackId === track.id ? 'bg-slate-800/80 border-slate-500 shadow-inner' : 'border-transparent hover:bg-slate-900/50'}"
           on:click={() => $activeTrackId = track.id}>
        
        <div class="w-3 h-3 rounded-full border {track.color.split(' ')[0]} {track.color.split(' ')[1]} shadow-sm"></div>
        
        <input type="text" value={track.label} 
               on:blur={(e) => updateTrackName(track.id, e.currentTarget.value)}
               on:keydown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
               class="flex-1 bg-transparent border-none outline-none text-xs font-bold {$activeTrackId === track.id ? 'text-white' : 'text-slate-400'} focus:text-white" />
        
        {#if $activeTrackId === track.id}
          <span class="text-[9px] bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">画笔</span>
        {/if}
      </div>
    {/each}
  </div>

  <button on:click={createNewTrack} class="w-full mt-1 py-2 rounded-lg border border-dashed border-slate-700 text-slate-500 text-xs font-bold hover:bg-slate-800 hover:text-white hover:border-slate-500 transition-all">
    + 铸造新阵营
  </button>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
</style>