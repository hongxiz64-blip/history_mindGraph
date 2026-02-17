<script lang="ts">
  import { activeFileId } from '../store';
  import type { FileTreeNode as FileTreeNodeType } from '../types';

  export let node: FileTreeNodeType;
  export let onSelect: (id: string) => void;
  export let onDelete: (id: string) => void;
  export let onRename: (id: string, currentName: string) => void;
  export let onCreateInside: (folderId: string) => void;
  export let onDragStart: (e: DragEvent, id: string) => void;
  export let onDrop: (e: DragEvent, targetId: string) => void;

  function handleClick() {
    if (node.type === 'folder') {
      node.isOpen = !node.isOpen;
    } else {
      onSelect(node.id);
    }
  }
</script>

<div class="flex flex-col">
  <div class="group flex items-center justify-between px-2 py-1.5 cursor-pointer rounded-md hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700 {node.type === 'file' && $activeFileId === node.id ? 'bg-indigo-900/40 text-indigo-300' : 'text-slate-400'}"
       draggable="true"
       on:dragstart={(e) => onDragStart(e, node.id)}
       on:dragover|preventDefault
       on:drop|preventDefault|stopPropagation={(e) => onDrop(e, node.id)}
       on:click={handleClick}>
    
    <div class="flex items-center gap-2 overflow-hidden">
      {#if node.type === 'folder'}
        <span class="text-[10px] w-3 text-slate-500">{node.isOpen ? '▼' : '▶'}</span>
        <span class="text-amber-500/80">📁</span>
      {:else}
        <span class="text-[10px] w-3"></span>
        <span class="text-slate-500">📄</span>
      {/if}
      <span class="text-sm font-bold truncate w-24" title={node.name}>{node.name}</span>
    </div>
    
    <div class="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity bg-[#0B101E]/80 px-1 rounded">
      {#if node.type === 'folder'}
        <button on:click|stopPropagation={() => onCreateInside(node.id)} class="text-slate-500 hover:text-emerald-400 text-xs" title="在此创建新纪元">+</button>
      {/if}
      <button on:click|stopPropagation={() => onRename(node.id, node.name)} class="text-slate-500 hover:text-blue-400 text-xs" title="重命名">✎</button>
      <button on:click|stopPropagation={() => onDelete(node.id)} class="text-slate-500 hover:text-red-400 text-xs" title="抹除">✕</button>
    </div>
  </div>

  {#if node.type === 'folder' && node.isOpen && node.children}
    <div class="pl-3 border-l border-slate-700/50 ml-3.5 mt-0.5 flex flex-col gap-0.5">
      {#each node.children as child}
        <svelte:self node={child} {onSelect} {onDelete} {onRename} {onCreateInside} {onDragStart} {onDrop} />
      {/each}
    </div>
  {/if}
</div>