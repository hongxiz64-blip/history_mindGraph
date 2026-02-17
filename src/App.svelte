<script lang="ts">
  import Canvas2D from './lib/components/Canvas2D.svelte';
  import TopBar from './lib/components/TopBar.svelte';
  import TrackPanel from './lib/components/TrackPanel.svelte';
  import Sidebar from './lib/components/Sidebar.svelte';
  import BulkPanel from './lib/components/BulkPanel.svelte';
  import FileSidebar from './lib/components/FileSidebar.svelte';
  import { isBulkPanelOpen, isFileSidebarOpen } from './lib/store';
</script>

<main class="flex w-screen h-screen overflow-hidden bg-black text-white relative">
  
  <FileSidebar />

  {#if !$isFileSidebarOpen}
    <button on:click={() => $isFileSidebarOpen = true} 
            class="absolute top-6 left-6 z-[2500] bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 border border-slate-600 text-white p-2.5 rounded-lg shadow-2xl transition-all hover:scale-105"
            title="展开多重宇宙">
      📂
    </button>
  {/if}

  <div class="flex-1 relative overflow-hidden">
    <TopBar />
    <Canvas2D />
    <TrackPanel />
    <Sidebar />
  </div>

</main>

{#if $isBulkPanelOpen}
  <BulkPanel onClose={() => $isBulkPanelOpen = false} />
{/if}