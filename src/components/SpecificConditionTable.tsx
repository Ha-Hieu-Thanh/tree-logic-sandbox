import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Button,
  Box,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Delete,
  Add,
  Visibility,
  Edit,
} from '@mui/icons-material';
import { SpecificCondition, TreeNode } from '../types';

interface SpecificConditionTableProps {
  conditions: SpecificCondition[];
  onView: (index: number) => void;
  onEdit: (index: number) => void;
  onAdd: () => void;
  onDelete: (index: number) => void;
}

// Đếm số điều kiện trong tree
const countConditions = (node: TreeNode): number => {
  if (node.nodeType === 'CONDITION') {
    return 1;
  }
  return node.children.reduce((sum, child) => sum + countConditions(child), 0);
};

const SpecificConditionTable: React.FC<SpecificConditionTableProps> = ({
  conditions,
  onView,
  onEdit,
  onAdd,
  onDelete,
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Danh sách điều kiện riêng
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<Add />}
          onClick={onAdd}
        >
          Thêm điều kiện riêng
        </Button>
      </Box>

      {conditions.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: 'grey.50',
            border: '1px dashed',
            borderColor: 'grey.300',
            borderRadius: 2,
          }}
        >
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Chưa có điều kiện riêng nào
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={onAdd}
          >
            Thêm điều kiện riêng đầu tiên
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={1}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600, width: 60 }}>STT</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tên điều kiện</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 120 }} align="center">Số điều kiện</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 150 }} align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {conditions.map((condition, index) => (
                <TableRow
                  key={index}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => onView(index)}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {condition.name || <em style={{ color: '#999' }}>Chưa đặt tên</em>}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={countConditions(condition.condition)}
                      size="small"
                      variant="outlined"
                      sx={{ minWidth: 32 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Chi tiết">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(index);
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sửa">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(index);
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(index);
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default SpecificConditionTable;
