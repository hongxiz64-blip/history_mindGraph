<script lang="ts">
  import { fileTree, fileDataMap, activeFileId, saveWorkspace, isFileSidebarOpen, tracks, nodes, edges, selectedNodeId, isLinkingMode, linkSourceId } from '../store';
  import FileTreeNode from './FileTreeNode.svelte';
  import type { FileTreeNode as FileTreeNodeType } from '../types';

  function createNewFile(targetFolderId: string | null = null) {
    const newId = 'f_' + Math.random().toString(36).substr(2, 6);
    const newName = prompt('输入新纪元名称：', '未命名纪元');
    if (!newName) return;

    $fileDataMap[newId] = { tracks: [], nodes: [], edges: [] };
    const newNode: FileTreeNodeType = { id: newId, type: 'file', name: newName as string };

    if (targetFolderId) {
      function insertIntoFolder(nodesArr: FileTreeNodeType[]): FileTreeNodeType[] {
        return nodesArr.map(n => {
          if (n.id === targetFolderId && n.type === 'folder') {
            return { ...n, isOpen: true, children: [...(n.children || []), newNode] };
          }
          if (n.children) return { ...n, children: insertIntoFolder(n.children) };
          return n;
        });
      }
      $fileTree = insertIntoFolder($fileTree);
    } else {
      $fileTree = [...$fileTree, newNode];
    }
    
    $activeFileId = newId;
    saveWorkspace();
  }

  function createNewFolder() {
    const newId = 'dir_' + Math.random().toString(36).substr(2, 6);
    const newName = prompt('输入新星系(文件夹)名称：', '新星系');
    if (!newName) return;
    $fileTree = [...$fileTree, { id: newId, type: 'folder', name: newName as string, isOpen: true, children: [] }];
    saveWorkspace();
  }

  function handleRename(id: string, currentName: string) {
    const newName = prompt('重命名：', currentName);
    if (!newName || newName === currentName) return;

    function renameNode(nodesArr: FileTreeNodeType[]): FileTreeNodeType[] {
      return nodesArr.map(n => {
        if (n.id === id) return { ...n, name: newName as string };
        if (n.children) return { ...n, children: renameNode(n.children) };
        return n;
      });
    }
    $fileTree = renameNode($fileTree);
    saveWorkspace();
  }

  function handleDelete(id: string) {
    if (!confirm('确定要彻底抹除这个纪元/星系吗？不可恢复！')) return;
    function deleteRecursively(nodesArr: FileTreeNodeType[]): FileTreeNodeType[] {
      return nodesArr.filter(node => {
        if (node.id === id) {
          if (node.id === $activeFileId) $activeFileId = null;
          return false;
        }
        if (node.children) node.children = deleteRecursively(node.children);
        return true;
      });
    }
    $fileTree = deleteRecursively($fileTree);
    saveWorkspace(); 
  }

  function handleDragStart(e: DragEvent, id: string) {
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', id);
      e.dataTransfer.effectAllowed = 'move';
    }
  }

  function handleDrop(e: DragEvent, targetId: string) {
    const sourceId = e.dataTransfer?.getData('text/plain');
    if (!sourceId || sourceId === targetId) return;

    let sourceNode: FileTreeNodeType | null = null;
    function extractNode(nodesArr: FileTreeNodeType[]): FileTreeNodeType[] {
      return nodesArr.filter(n => {
        if (n.id === sourceId) { sourceNode = n; return false; }
        if (n.children) n.children = extractNode(n.children);
        return true;
      });
    }

    let nextTree = extractNode($fileTree);
    if (!sourceNode) return; 

    let isInvalidCycle = false;
    function checkCycle(n: FileTreeNodeType) {
      if (n.id === targetId) isInvalidCycle = true;
      if (n.children) n.children.forEach(checkCycle);
    }
    checkCycle(sourceNode);
    if (isInvalidCycle) { alert("时空悖论：无法将星系吞噬进它自己的内部！"); return; }

    if (targetId === 'ROOT') {
      nextTree = [...nextTree, sourceNode];
    } else {
      function injectNode(nodesArr: FileTreeNodeType[]): FileTreeNodeType[] {
        return nodesArr.map(n => {
          if (n.id === targetId && n.type === 'folder') {
            return { ...n, isOpen: true, children: [...(n.children || []), sourceNode!] };
          }
          if (n.children) return { ...n, children: injectNode(n.children) };
          return n;
        });
      }
      nextTree = injectNode(nextTree);
    }
    $fileTree = nextTree;
    saveWorkspace();
  }

  let fileInput: HTMLInputElement;

  function exportData() {
    let currentFileName = "未命名纪元";
    const findName = (nodesArr: FileTreeNodeType[]) => {
      for (let n of nodesArr) {
        if (n.id === $activeFileId) currentFileName = n.name;
        if (n.children) findName(n.children);
      }
    };
    findName($fileTree);

    const now = new Date();
    const dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    const timeStr = String(now.getHours()).padStart(2, '0') + '-' + String(now.getMinutes()).padStart(2, '0');

    const payload = { tracks: $tracks, nodes: $nodes, edges: $edges };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFileName}_${dateStr}_${timeStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!parsed.tracks || !parsed.nodes || !parsed.edges) { alert('读取失败：格式不匹配！'); return; }
        
        const defaultName = file.name.replace(/\.[^/.]+$/, "");
        const newName = prompt('为导入的纪元命名：', defaultName);
        if (!newName) return;

        const newId = 'f_' + Math.random().toString(36).substr(2, 6);
        $fileDataMap[newId] = { tracks: parsed.tracks, nodes: parsed.nodes, edges: parsed.edges };
        $fileTree = [...$fileTree, { id: newId, type: 'file', name: newName as string }];
        $activeFileId = newId;
        saveWorkspace();
      } catch (error) { alert('解析崩溃：文件损坏。'); }
    };
    reader.readAsText(file);
    (event.target as HTMLInputElement).value = '';
  }
</script>

<div class="h-full bg-[#0B101E] flex flex-col z-[2000] shadow-2xl relative transition-all duration-300 ease-in-out overflow-hidden {$isFileSidebarOpen ? 'w-64 border-r border-slate-800' : 'w-0 border-r-0'}">
  <div class="w-64 flex flex-col h-full">
    
    <div class="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
      <h2 class="text-xs font-black tracking-widest text-slate-400 uppercase">多重宇宙</h2>
      <div class="flex gap-2 items-center">
        <button on:click={() => createNewFile(null)} class="text-slate-400 hover:text-emerald-400 font-bold" title="在根目录新建纪元">📄</button>
        <button on:click={createNewFolder} class="text-slate-400 hover:text-amber-400 font-bold" title="新建星系">📁</button>
        <button on:click={() => $isFileSidebarOpen = false} class="ml-2 text-slate-500 hover:text-white" title="收起面板">◀</button>
      </div>
    </div>

<div class="flex-1 overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar"
         on:dragover|preventDefault
         on:drop|preventDefault={(e) => handleDrop(e, 'ROOT')}>
      {#each $fileTree as node}
        <FileTreeNode 
          {node} 
          onSelect={(id) => $activeFileId = id} 
          onDelete={handleDelete} 
          onRename={handleRename} 
          onCreateInside={createNewFile} 
          onDragStart={handleDragStart} 
          onDrop={handleDrop} 
        />
      {/each}
      <div class="h-20 w-full flex-shrink-0"></div>
    </div>

    <div class="p-4 border-t border-slate-800 flex flex-col gap-2 bg-slate-900/50">
      <input type="file" accept=".json" bind:this={fileInput} on:change={importData} class="hidden" />
      <button on:click={() => fileInput.click()} class="w-full bg-slate-800 hover:bg-amber-600 border border-slate-700 hover:border-amber-400 text-slate-400 hover:text-white py-2 rounded-lg text-xs font-bold transition-colors">
        📂 导入纪元
      </button>
      <button on:click={exportData} class="w-full bg-slate-800 hover:bg-indigo-600 border border-slate-700 hover:border-indigo-400 text-slate-400 hover:text-white py-2 rounded-lg text-xs font-bold transition-colors">
        💾 封存当前纪元
      </button>
    </div>
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
</style>