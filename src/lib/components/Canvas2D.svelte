<script lang="ts">
// 将原来的 import initialTracks 改成从 store 引入 tracks
import { nodes, edges, tracks, activeTrackId, selectedNodeId, draggedNodeId, isLinkingMode, linkSourceId } from '../store';
  import { initialTracks } from '../data';

  let panX = 400;
  let panY = 100;
  let scale = 1;
  let isDraggingBg = false;

  const YEAR_TO_PIXEL = 2; 
  const GLASS_STYLE = 'bg-white/[0.02] border border-white/20 backdrop-blur-md text-white/80 shadow-[0_4px_30px_rgba(0,0,0,0.1)]';
  // --- 1. 背景全局交互 ---
  function handlePointerDown(e: PointerEvent) {
    if ((e.target as HTMLElement).closest('.node-item')) return;
    
    // 点击背景：立刻清空选中，关闭侧边栏
    $selectedNodeId = null; 

    isDraggingBg = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if ($draggedNodeId) {
      const dy = e.movementY / scale;
      $nodes = $nodes.map(n => n.id === $draggedNodeId ? { ...n, y: n.y + dy } : n);
    } else if (isDraggingBg) {
      panX += e.movementX;
      panY += e.movementY;
    }
  }

  function handlePointerUp() {
    isDraggingBg = false;
    $draggedNodeId = null;
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    scale = Math.max(0.2, Math.min(scale * (e.deltaY > 0 ? 0.9 : 1.1), 3));
  }

function handleBgDblClick(e: MouseEvent) {
    if ($isLinkingMode || $selectedNodeId) return;
    
    // 【核心拦截】：如果用户删光了阵营，没有画笔，则禁止建点
    if (!$activeTrackId) { alert("请先在左下角选择或创建一个阵营画笔！"); return; }
    
    const clickX = (e.clientX - panX) / scale;
    const clickY = (e.clientY - panY) / scale;
    const clickedYear = Math.round(clickX / YEAR_TO_PIXEL);
    
    const newId = 'n_' + Math.random().toString(36).substr(2, 6);
    $nodes = [...$nodes, { 
      id: newId, 
      trackId: $activeTrackId, // 👈 【核心对接】：使用当前手持的画笔阵营！
      label: '新文明', 
      startYear: clickedYear, 
      endYear: clickedYear + 100, 
      y: clickY - 24 
    }];
    $selectedNodeId = newId; 
  }

  // --- 3. 节点实体交互 (事件终极解耦) ---
  function handleNodePointerDown(nodeId: string, e: PointerEvent) {
    e.stopPropagation(); 
    if ($isLinkingMode) return; // 连线模式禁止拖拽

    // 【动作 1：纯粹拖动】：仅抓取节点，绝不打开侧边栏！
    $draggedNodeId = nodeId;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handleNodeClick(nodeId: string, e: MouseEvent) {
    e.stopPropagation();

    if ($isLinkingMode) {
      // 连线引擎保持在单击中执行
      if (!$linkSourceId) {
        $linkSourceId = nodeId;
      } else if ($linkSourceId !== nodeId) {
        const newId = 'e_' + Math.random().toString(36).substr(2, 6);
        $edges = [...$edges, { id: newId, source: $linkSourceId, target: nodeId}];
        $linkSourceId = null;
        
      }
    } else {
      // 【动作 2：纯粹单击】：现在什么都不做，完美预留给你未来加“选中高亮”等功能
    }
  }

  function handleNodeDblClick(nodeId: string, e: MouseEvent) {
    e.stopPropagation(); // 阻止背景双击事件冒泡
    if ($isLinkingMode) return;

    // 【动作 3：双击唤醒】：双击才精准打开侧边栏进行深层编辑！
    $selectedNodeId = nodeId;
  }

  // --- 4. 派生视觉属性 ---
$: nodeRectMap = new Map(($nodes || []).map(n => {
  const track = ($tracks || []).find(t => t.id === n.trackId);
    return [n.id, {
      x: n.startYear * YEAR_TO_PIXEL,
      y: n.y,
      w: Math.max((n.endYear - n.startYear) * YEAR_TO_PIXEL, 40),
      h: 48,
      color: track ? track.color : GLASS_STYLE
      }];
  }));

  function formatYear(year: number) { return year < 0 ? `前${Math.abs(year)}` : `${year}`; }
</script>

<div class="w-full h-full bg-[#0B101E] relative overflow-hidden select-none {$isLinkingMode ? 'cursor-crosshair' : ''}"
     on:pointerdown={handlePointerDown} on:pointermove={handlePointerMove} on:pointerup={handlePointerUp} 
     on:wheel|nonpassive={handleWheel} on:dblclick={handleBgDblClick}>

  <div class="absolute transform-origin-top-left" style="transform: translate({panX}px, {panY}px) scale({scale});">
    
    {#each Array.from({ length: 40 }, (_, i) => -1600 + i * 100) as year}
      <div class="absolute top-[-2000px] w-px h-[6000px] bg-slate-800/50 pointer-events-none" style="left: {year * YEAR_TO_PIXEL}px;"></div>
      <div class="absolute top-[-40px] text-[10px] font-bold text-slate-500 -translate-x-1/2 pointer-events-none" style="left: {year * YEAR_TO_PIXEL}px;">{formatYear(year)}</div>
    {/each}

    {#each Array.from({ length: 20 }, (_, i) => i * 200 - 1000) as yGuide}
      <div class="absolute left-[-4000px] h-px w-[8000px] bg-white/[0.03] pointer-events-none" style="top: {yGuide}px;"></div>
    {/each}

    <svg class="absolute top-0 left-0 overflow-visible pointer-events-none z-10" style="width: 1px; height: 1px;">
      {#each $edges as edge}
        {@const s = nodeRectMap.get(edge.source)} {@const t = nodeRectMap.get(edge.target)}
        {#if s && t}
          {@const startX = s.x + s.w} {@const startY = s.y + s.h / 2}
          {@const endX = t.x} {@const endY = t.y + t.h / 2}
          {@const baseColor = edge.type === 'war' ? '#ef4444' : edge.type === 'succession' ? '#3b82f6' : edge.type === 'trade' ? '#22c55e' : '#64748b'}
          <path d="M {startX} {startY} C {startX + 100} {startY}, {endX - 100} {endY}, {endX} {endY}" 
                stroke={baseColor} stroke-width="2" fill="none" opacity="0.6" stroke-dasharray={edge.type ? "0" : "4,4"} />
        {/if}
      {/each}
    </svg>

    {#each $nodes as node}
      {@const rect = nodeRectMap.get(node.id)}
      {#if rect}
        <div class="node-item absolute rounded-lg border flex items-center shadow-lg hover:shadow-xl hover:scale-[1.02] hover:z-50 transition-shadow cursor-pointer backdrop-blur-sm {$isLinkingMode && $linkSourceId === node.id ? 'ring-4 ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.8)]' : ''} {rect.color}"
             style="left: {rect.x}px; top: {rect.y}px; width: {rect.w}px; height: {rect.h}px; z-index: {$selectedNodeId === node.id || $draggedNodeId === node.id ? 40 : 20};"
             on:pointerdown={(e) => handleNodePointerDown(node.id, e)}
             on:click={(e) => handleNodeClick(node.id, e)}
             on:dblclick={(e) => handleNodeDblClick(node.id, e)}>
          
          <div class="absolute left-1/2 -translate-x-1/2 text-xs font-bold text-white whitespace-nowrap z-10 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{node.label}</div>
          
          {#if rect.w > 120}
            <div class="absolute left-0 px-2 text-[9px] font-black text-white/50 h-full flex items-center bg-black/30 border-r border-white/10 rounded-l-lg pointer-events-none">{formatYear(node.startYear)}</div>
            <div class="absolute right-0 px-2 text-[9px] font-black text-white/50 h-full flex items-center bg-black/30 border-l border-white/10 rounded-r-lg pointer-events-none">{formatYear(node.endYear)}</div>
          {/if}
        </div>
      {/if}
    {/each}
  </div>
</div>