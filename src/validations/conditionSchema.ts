import * as yup from 'yup';
import { ConditionFormData, TreeNode } from '../types';

// Schema cho TreeNode - sử dụng mixed() để tránh vấn đề recursive typing
const treeNodeSchema = yup.mixed<TreeNode>().required();

// Schema cho SpecificCondition
const specificConditionSchema = yup.object({
  id: yup.string().required(),
  name: yup
    .string()
    .required('Vui lòng nhập tên điều kiện riêng')
    .min(1, 'Tên điều kiện không được để trống')
    .max(100, 'Tên điều kiện không được quá 100 ký tự'),
  condition: treeNodeSchema,
});

// Schema chính cho form
export const conditionFormSchema = yup.object({
  generalName: yup
    .string()
    .required('Vui lòng nhập tên điều kiện chung')
    .min(1, 'Tên điều kiện không được để trống')
    .max(200, 'Tên điều kiện không được quá 200 ký tự'),
  generalCondition: treeNodeSchema,
  specificConditions: yup
    .array()
    .of(specificConditionSchema)
    .default([]),
}) as yup.ObjectSchema<ConditionFormData>;

// Helper function để validate tree node có ít nhất 1 điều kiện thực sự
export const validateTreeHasConditions = (node: TreeNode): boolean => {
  if (node.nodeType === 'CONDITION') {
    return !!node.itemParamId && node.itemParamId.trim() !== '';
  }
  if (node.nodeType === 'GROUP') {
    return node.children.some((child) => validateTreeHasConditions(child));
  }
  return false;
};

// Helper function để validate một điều kiện đơn đã đầy đủ thông tin
export const validateConditionComplete = (node: TreeNode): { valid: boolean; message?: string } => {
  if (node.nodeType === 'CONDITION') {
    if (!node.itemParamId || node.itemParamId.trim() === '') {
      return { valid: false, message: 'Chưa chọn trường dữ liệu' };
    }
    if (!node.typeCheck) {
      return { valid: false, message: 'Chưa chọn toán tử' };
    }
    if (!['IS NULL', 'IS NOT NULL'].includes(node.typeCheck)) {
      if (!node.paramValue || node.paramValue.trim() === '') {
        return { valid: false, message: 'Chưa nhập giá trị' };
      }
    }
    return { valid: true };
  }
  
  if (node.nodeType === 'GROUP') {
    for (const child of node.children) {
      const result = validateConditionComplete(child);
      if (!result.valid) {
        return result;
      }
    }
    return { valid: true };
  }
  
  return { valid: false, message: 'Loại node không hợp lệ' };
};
