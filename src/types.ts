export interface FieldConfig {
  id: string;
  field: string;
  fieldName: string;
}

export interface RuleNode {
  nodeType: "CONDITION";
  itemParamId: string;
  typeCheck: string;
  paramValue: string;
}

export interface GroupNode {
  nodeType: "GROUP";
  logicalOperator: "AND" | "OR";
  expanded: boolean;
  children: TreeNode[];
}

export type TreeNode = RuleNode | GroupNode;

export interface TreeBuilderProps {
  value?: TreeNode;
  onChange?: (value: TreeNode) => void;
  fields: FieldConfig[];
}

// Điều kiện riêng
export interface SpecificCondition {
  id: string;
  name: string;
  condition: TreeNode;
}

// Form data chính
export interface ConditionFormData {
  generalName: string;           // Tên điều kiện chung
  generalCondition: TreeNode;    // Điều kiện chung (tree)
  specificConditions: SpecificCondition[]; // Mảng điều kiện riêng
}
