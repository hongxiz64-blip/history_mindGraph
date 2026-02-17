export interface Track {
  id: string;
  label: string;
  order: number;
  color: string;
}

export interface Node {
  id: string;
  trackId: string;
  label: string;
  description?: string;
  startYear: number;
  endYear: number;
  y: number;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type?: 'war' | 'trade' | 'succession';
}

export type TreeNodeType = 'folder' | 'file';

export interface FileTreeNode {
  id: string;
  type: TreeNodeType;
  name: string;
  isOpen?: boolean;
  children?: FileTreeNode[];
}

export interface WorkspaceData {
  tree: FileTreeNode[];
  dataMap: Record<string, { tracks: Track[], nodes: Node[], edges: Edge[] }>;
}