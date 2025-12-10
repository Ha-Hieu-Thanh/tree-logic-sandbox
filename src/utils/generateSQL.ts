import { TreeNode, FieldConfig } from '../types';

/**
 * Generate SQL từ tree
 * @param node - TreeNode cần generate
 * @param fields - Danh sách fields để tra cứu field name từ id
 */
export const generateSQL = (node: TreeNode, fields: FieldConfig[]): string => {
  // Tạo map để tra cứu nhanh field từ id
  const fieldMap = new Map(fields.map(f => [f.id, f.field]));

  const generate = (node: TreeNode): string => {
    if (node.nodeType === "CONDITION") {
      // Tra cứu field từ id, fallback về itemParamId nếu không tìm thấy
      const fieldName = fieldMap.get(node.itemParamId) || node.itemParamId;
      
      if (['IS NULL', 'IS NOT NULL'].includes(node.typeCheck)) {
        return `${fieldName} ${node.typeCheck}`;
      }
      if (node.typeCheck === 'LIKE') {
        return `${fieldName} LIKE '%${node.paramValue}%'`;
      }
      if (node.typeCheck === 'IN' || node.typeCheck === 'NOT IN') {
        return `${fieldName} ${node.typeCheck} (${node.paramValue})`;
      }
      return `${fieldName} ${node.typeCheck} '${node.paramValue}'`;
    } else {
      if (node.children.length === 0) return '';
      if (node.children.length === 1) return generate(node.children[0]);
      
      const conditions = node.children
        .map(child => generate(child))
        .filter(sql => sql.length > 0);
      
      if (conditions.length === 0) return '';
      if (conditions.length === 1) return conditions[0];
      
      return `(${conditions.join(` ${node.logicalOperator} `)})`;
    }
  };

  return generate(node);
};
