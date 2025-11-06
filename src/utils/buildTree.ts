import { Types } from "mongoose";
import { ICalcNode } from "../models/CalcNode";

export type CalcNodeTree = {
  _id: Types.ObjectId;
  value: number;
  parent?: Types.ObjectId | null;
  operationType?: string | null;
  operand?: number | null;
  author: Types.ObjectId;
  createdAt: Date;
  children: CalcNodeTree[];
};

export function buildTree(nodes: ICalcNode[]): CalcNodeTree[] {
  const map = new Map<string, CalcNodeTree>();
  nodes.forEach((n) => {
    map.set(n._id.toString(), {
      _id: n._id,
      value: n.value,
      parent: n.parent ?? null,
      operationType: n.operationType ?? null,
      operand: n.operand ?? null,
      author: n.author,
      createdAt: n.createdAt,
      children: [],
    });
  });

  const roots: CalcNodeTree[] = [];
  for (const node of map.values()) {
    if (node.parent) {
      const parent = map.get(node.parent.toString());
      if (parent) parent.children.push(node);
      else roots.push(node); 
    } else {
      roots.push(node);
    }
  }

  const sortRec = (arr: CalcNodeTree[]) => {
    arr.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    arr.forEach((c) => sortRec(c.children));
  };
  sortRec(roots);

  return roots;
}
