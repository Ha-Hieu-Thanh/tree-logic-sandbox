import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  Chip,
} from '@mui/material';
import { Close, Edit, Visibility } from '@mui/icons-material';
import TreeBuilder from './TreeBuilder';
import { TreeNode, FieldConfig } from '../types';

interface SpecificConditionDialogProps {
  open: boolean;
  mode: 'view' | 'edit';
  name: string;
  condition: TreeNode;
  fields: FieldConfig[];
  onClose: () => void;
  onNameChange?: (name: string) => void;
  onConditionChange?: (condition: TreeNode) => void;
  onSave?: () => void;
}

const SpecificConditionDialog: React.FC<SpecificConditionDialogProps> = ({
  open,
  mode,
  name,
  condition,
  fields,
  onClose,
  onNameChange,
  onConditionChange,
  onSave,
}) => {
  const isViewMode = mode === 'view';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: isViewMode ? 'info.50' : 'warning.50',
          borderBottom: '1px solid',
          borderColor: isViewMode ? 'info.light' : 'warning.light',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isViewMode ? (
            <Visibility color="info" />
          ) : (
            <Edit color="warning" />
          )}
          <Typography variant="h6" fontWeight={600}>
            {isViewMode ? 'Chi tiết điều kiện riêng' : 'Sửa điều kiện riêng'}
          </Typography>
          <Chip
            label={isViewMode ? 'Chỉ xem' : 'Đang sửa'}
            size="small"
            color={isViewMode ? 'info' : 'warning'}
            sx={{ ml: 1 }}
          />
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Tên điều kiện riêng */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Tên điều kiện riêng
          </Typography>
          {isViewMode ? (
            <Typography variant="body1" fontWeight={500}>
              {name || <em style={{ color: '#999' }}>Chưa đặt tên</em>}
            </Typography>
          ) : (
            <TextField
              value={name}
              onChange={(e) => onNameChange?.(e.target.value)}
              fullWidth
              size="small"
              placeholder="Nhập tên điều kiện riêng"
            />
          )}
        </Box>

        {/* Logic điều kiện */}
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Logic điều kiện
          </Typography>
          {isViewMode ? (
            <Box
              sx={{
                opacity: 0.8,
                pointerEvents: 'none',
                '& button': { display: 'none' },
                '& input, & select': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              <TreeBuilder
                value={condition}
                onChange={() => {}}
                fields={fields}
              />
            </Box>
          ) : (
            <TreeBuilder
              value={condition}
              onChange={(newCondition) => onConditionChange?.(newCondition)}
              fields={fields}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} color="inherit">
          {isViewMode ? 'Đóng' : 'Hủy'}
        </Button>
        {!isViewMode && (
          <Button
            onClick={() => {
              onSave?.();
              onClose();
            }}
            variant="contained"
            color="primary"
          >
            Lưu thay đổi
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SpecificConditionDialog;

