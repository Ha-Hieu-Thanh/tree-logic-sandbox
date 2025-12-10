import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchConditionData, saveConditionData } from '../api/mockApi';
import { ConditionFormData } from '../types';

// Query keys
export const QUERY_KEYS = {
  conditions: ['conditions'] as const,
};

// ============ Query Hook ============

// Hook lấy toàn bộ dữ liệu điều kiện
export const useConditionData = () => {
  return useQuery({
    queryKey: QUERY_KEYS.conditions,
    queryFn: async () => {
      const response = await fetchConditionData();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ============ Mutation Hook ============

// Hook lưu toàn bộ dữ liệu
export const useSaveConditionData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ConditionFormData) => {
      const response = await saveConditionData(data);
      return response;
    },
    onSuccess: (response) => {
      // Update cache with new data from server
      queryClient.setQueryData(QUERY_KEYS.conditions, response.data);
    },
  });
};

// ============ Combined Hook ============

export interface UseConditionsReturn {
  // Data
  data: ConditionFormData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Mutations
  saveAll: ReturnType<typeof useSaveConditionData>;
  
  // Computed states
  isSaving: boolean;
}

// Combined hook for convenience
export const useConditions = (): UseConditionsReturn => {
  const query = useConditionData();
  const saveAll = useSaveConditionData();
  
  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    saveAll,
    isSaving: saveAll.isPending,
  };
};
