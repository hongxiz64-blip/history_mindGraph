import { writable, get } from 'svelte/store';
import { initialTracks, initialNodes, initialEdges } from './data';
import type { Track, Node, Edge, FileTreeNode, WorkspaceData } from './types';

// --- 核心实体与视图状态 ---
export const tracks = writable<Track[]>([]);
export const nodes = writable<Node[]>([]);
export const edges = writable<Edge[]>([]);
export const activeTrackId = writable<string | null>(null);
export const selectedNodeId = writable<string | null>(null);
export const draggedNodeId = writable<string | null>(null);
export const isLinkingMode = writable(false);
export const linkSourceId = writable<string | null>(null);
export const isBulkPanelOpen = writable(false);

// --- 侧边栏与文件系统状态 ---
export const isFileSidebarOpen = writable(true); // 控制侧边栏展开
export const fileTree = writable<FileTreeNode[]>([]);
export const fileDataMap = writable<WorkspaceData['dataMap']>({});
export const activeFileId = writable<string | null>(null);

// --- 工作区持久化引擎 ---
const WORKSPACE_KEY = 'holo_workspace_v1';

function initWorkspace() {
  const rawWorkspace = localStorage.getItem(WORKSPACE_KEY);
  
  if (rawWorkspace) {
    try {
      const parsed = JSON.parse(rawWorkspace);
      fileTree.set(parsed.tree || []);
      fileDataMap.set(parsed.dataMap || {});
      
      if (parsed.tree && parsed.tree.length > 0) {
        const findFirstFile = (nodesArr: any[]): any => {
          for (let node of nodesArr) {
            if (node.type === 'file') return node;
            if (node.children) {
              const found = findFirstFile(node.children);
              if (found) return found;
            }
          }
          return null;
        };
        const firstFile = findFirstFile(parsed.tree);
        if (firstFile) {
          activeFileId.set(firstFile.id);
          loadFileDataToView(firstFile.id);
          return; 
        }
      }
    } catch (e) { console.warn("读取工作区崩溃，尝试重置"); }
  }

  // 尝试抢救旧版本单文件数据
  const oldRaw = localStorage.getItem('holo_2d_core_v5');
  let fallbackTracks = initialTracks;
  let fallbackNodes = initialNodes;
  let fallbackEdges = initialEdges;

  if (oldRaw) {
    try {
      const oldData = JSON.parse(oldRaw);
      if (oldData.tracks && oldData.tracks.length > 0) fallbackTracks = oldData.tracks;
      if (oldData.nodes) fallbackNodes = oldData.nodes;
      if (oldData.edges) fallbackEdges = oldData.edges;
    } catch (e) {}
  }

  const defaultFileId = 'f_default';
  fileTree.set([{ id: defaultFileId, type: 'file', name: oldRaw ? '旧日纪元 (已迁移)' : '默认纪元' }]);
  fileDataMap.set({
    [defaultFileId]: { tracks: fallbackTracks, nodes: fallbackNodes, edges: fallbackEdges }
  });
  activeFileId.set(defaultFileId);
  loadFileDataToView(defaultFileId);
}
export function loadFileDataToView(fileId: string) {
  const map = get(fileDataMap);
  // 终极防空指针：如果找不到数据，强制塞入空数组
  const data = map[fileId] || { tracks: [], nodes: [], edges: [] }; 
  
  tracks.set(data.tracks || []);
  nodes.set(data.nodes || []);
  edges.set(data.edges || []);
  
  const currentTracks = data.tracks || [];
  activeTrackId.set(currentTracks.length > 0 ? currentTracks[0].id : null);
  selectedNodeId.set(null); 
}

export function saveWorkspace() {
  const currentId = get(activeFileId);
  if (currentId) {
    fileDataMap.update(map => {
      map[currentId] = { tracks: get(tracks), nodes: get(nodes), edges: get(edges) };
      return map;
    });
  }
  localStorage.setItem(WORKSPACE_KEY, JSON.stringify({
    tree: get(fileTree),
    dataMap: get(fileDataMap)
  }));
}

initWorkspace();
activeFileId.subscribe(id => { if (id) loadFileDataToView(id); });

let saveTimeout: any;
function triggerAutoSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveWorkspace, 500);
}
tracks.subscribe(triggerAutoSave);
nodes.subscribe(triggerAutoSave);
edges.subscribe(triggerAutoSave);
fileTree.subscribe(triggerAutoSave);