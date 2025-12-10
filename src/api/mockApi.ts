import { ConditionFormData } from '../types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock database - lưu trong memory
let mockDatabase: ConditionFormData = {
  generalName: 'Điều kiện lọc người dùng',
  generalCondition: {
    nodeType: "GROUP",
    logicalOperator: "AND",
    expanded: true,
    children: [
      {
        nodeType: "CONDITION",
        itemParamId: "1",
        typeCheck: ">=",
        paramValue: "18"
      }
    ]
  },
  specificConditions: [
    {
      id: '1',
      name: 'Điều kiện VIP',
      condition: {
        nodeType: "GROUP",
        logicalOperator: "AND",
        expanded: true,
        children: [
          {
            nodeType: "CONDITION",
            itemParamId: "3",
            typeCheck: "=",
            paramValue: "vip"
          }
        ]
      }
    },
    {
      id: '2',
      name: 'Điều kiện nhân viên mới',
      condition: {
        nodeType: "GROUP",
        logicalOperator: "AND",
        expanded: true,
        children: [
          {
            nodeType: "CONDITION",
            itemParamId: "6",
            typeCheck: ">=",
            paramValue: "2024-01-01"
          }
        ]
      }
    }
  ]
};

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ============ GET API ============

// Lấy toàn bộ dữ liệu điều kiện
export const fetchConditionData = async (): Promise<ApiResponse<ConditionFormData>> => {
  await delay(800); // Simulate network delay
  console.log('[Mock API] GET /api/conditions');
  
  return {
    success: true,
    data: JSON.parse(JSON.stringify(mockDatabase)),
    message: 'Lấy dữ liệu thành công'
  };
};

// ============ PUT API ============

// Lưu toàn bộ dữ liệu
export const saveConditionData = async (data: ConditionFormData): Promise<ApiResponse<ConditionFormData>> => {
  await delay(1000);
  console.log('[Mock API] PUT /api/conditions', data);
  
  mockDatabase = JSON.parse(JSON.stringify(data));
  
  return {
    success: true,
    data: JSON.parse(JSON.stringify(mockDatabase)),
    message: 'Lưu dữ liệu thành công'
  };
};
