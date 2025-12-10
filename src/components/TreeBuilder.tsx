import React from 'react';
import {
  Box,
  Paper,
  IconButton,
  Select,
  MenuItem,
  TextField,
  Button,
  Typography,
  Collapse,
  Stack,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  Add,
  Delete,
} from '@mui/icons-material';
import { TreeNode, GroupNode, RuleNode, TreeBuilderProps } from '../types';

const OPERATORS = [
  { value: '=', label: '=' },
  { value: '!=', label: '!=' },
  { value: '>', label: '>' },
  { value: '<', label: '<' },
  { value: '>=', label: '>=' },
  { value: '<=', label: '<=' },
  { value: 'LIKE', label: 'LIKE' },
  { value: 'IN', label: 'IN' },
  { value: 'NOT IN', label: 'NOT IN' },
  { value: 'IS NULL', label: 'IS NULL' },
  { value: 'IS NOT NULL', label: 'IS NOT NULL' },
];

const TreeBuilder: React.FC<TreeBuilderProps> = ({ value, onChange, fields }) => {
  const defaultTree: GroupNode = {
    nodeType: "GROUP",
    logicalOperator: "AND",
    expanded: true,
    children: []
  };

  const tree = value || defaultTree;

  const updateTree = (newTree: TreeNode) => {
    onChange?.(newTree);
  };

  const getNodeAtPath = (tree: TreeNode, path: number[]): TreeNode => {
    let current = tree;
    for (const index of path) {
      if (current.nodeType === "GROUP") {
        current = current.children[index];
      }
    }
    return current;
  };

  const addCondition = (path: number[]) => {
    const newCondition: RuleNode = {
      nodeType: "CONDITION",
      itemParamId: "",
      typeCheck: "=",
      paramValue: ""
    };

    const newTree = JSON.parse(JSON.stringify(tree));
    const targetGroup = getNodeAtPath(newTree, path) as GroupNode;
    targetGroup.children.push(newCondition);
    updateTree(newTree);
  };

  const addGroup = (path: number[]) => {
    const newGroup: GroupNode = {
      nodeType: "GROUP",
      logicalOperator: "AND",
      expanded: true,
      children: []
    };

    const newTree = JSON.parse(JSON.stringify(tree));
    const targetGroup = getNodeAtPath(newTree, path) as GroupNode;
    targetGroup.children.push(newGroup);
    updateTree(newTree);
  };

  const removeNode = (path: number[]) => {
    if (path.length === 0) return;

    const newTree = JSON.parse(JSON.stringify(tree));
    const parentPath = path.slice(0, -1);
    const index = path[path.length - 1];
    const parent = getNodeAtPath(newTree, parentPath) as GroupNode;
    parent.children.splice(index, 1);
    updateTree(newTree);
  };

  const updateNode = (path: number[], updates: Partial<TreeNode>) => {
    const newTree = JSON.parse(JSON.stringify(tree));
    const node = getNodeAtPath(newTree, path);
    Object.assign(node, updates);
    updateTree(newTree);
  };

  const toggleExpanded = (path: number[]) => {
    const newTree = JSON.parse(JSON.stringify(tree));
    const node = getNodeAtPath(newTree, path) as GroupNode;
    node.expanded = !node.expanded;
    updateTree(newTree);
  };

  const renderConditionNode = (node: RuleNode, path: number[]) => {
    return (
      <Paper
        key={path.join('-')}
        elevation={0}
        sx={{
          p: 1.5,
          bgcolor: 'grey.50',
          border: '1px solid',
          borderColor: 'grey.200',
          borderRadius: 1,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* Field Select - hiển thị fieldName, lưu id */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Tên trường</InputLabel>
            <Select
              value={node.itemParamId}
              onChange={(e) => updateNode(path, { itemParamId: e.target.value })}
              label="Tên trường"
            >
              <MenuItem value="">
                <em>-- Chọn trường --</em>
              </MenuItem>
              {fields.map((field) => (
                <MenuItem key={field.id} value={field.id}>
                  {field.fieldName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Operator Select */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={node.typeCheck}
              onChange={(e) => updateNode(path, { typeCheck: e.target.value })}
            >
              {OPERATORS.map((op) => (
                <MenuItem key={op.value} value={op.value}>
                  {op.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Value Input */}
          {!['IS NULL', 'IS NOT NULL'].includes(node.typeCheck) && (
            <TextField
              size="small"
              value={node.paramValue}
              onChange={(e) => updateNode(path, { paramValue: e.target.value })}
              placeholder="Giá trị"
              sx={{ flex: 1, minWidth: 120 }}
            />
          )}

          <IconButton
            size="small"
            color="error"
            onClick={() => removeNode(path)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      </Paper>
    );
  };

  const renderGroupNode = (node: GroupNode, path: number[], isRoot: boolean = false) => {
    return (
      <Box key={path.join('-')} sx={{ ml: isRoot ? 0 : 3, mt: isRoot ? 0 : 2 }}>
        <Paper
          elevation={isRoot ? 2 : 1}
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: isRoot ? 'primary.light' : 'grey.300',
            borderRadius: 2,
          }}
        >
          {/* Group Header */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <IconButton
              size="small"
              onClick={() => toggleExpanded(path)}
              sx={{ color: 'grey.600' }}
            >
              {node.expanded ? <ExpandMore /> : <ChevronRight />}
            </IconButton>

            <FormControl size="small">
              <Select
                value={node.logicalOperator}
                onChange={(e) => updateNode(path, { logicalOperator: e.target.value as "AND" | "OR" })}
                sx={{
                  fontWeight: 600,
                  bgcolor: node.logicalOperator === 'AND' ? 'primary.50' : 'warning.50',
                  '& .MuiSelect-select': {
                    color: node.logicalOperator === 'AND' ? 'primary.main' : 'warning.dark',
                  },
                }}
              >
                <MenuItem value="AND">AND</MenuItem>
                <MenuItem value="OR">OR</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ flex: 1 }} />

            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<Add />}
              onClick={() => addCondition(path)}
              sx={{ textTransform: 'none' }}
            >
              Điều kiện
            </Button>

            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => addGroup(path)}
              sx={{ textTransform: 'none' }}
            >
              Nhóm
            </Button>

            {!isRoot && (
              <IconButton
                size="small"
                color="error"
                onClick={() => removeNode(path)}
              >
                <Delete fontSize="small" />
              </IconButton>
            )}
          </Stack>

          {/* Children */}
          <Collapse in={node.expanded}>
            {node.children.length > 0 ? (
              <Stack spacing={1.5}>
                {node.children.map((child, index) =>
                  renderNode(child, [...path, index])
                )}
              </Stack>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: 'italic', py: 1.5 }}
              >
                Chưa có điều kiện. Nhấn nút "Điều kiện" hoặc "Nhóm" để thêm.
              </Typography>
            )}
          </Collapse>
        </Paper>
      </Box>
    );
  };

  const renderNode = (node: TreeNode, path: number[], isRoot: boolean = false) => {
    if (node.nodeType === "GROUP") {
      return renderGroupNode(node, path, isRoot);
    } else {
      return renderConditionNode(node, path);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {renderNode(tree, [], true)}
    </Box>
  );
};

export default TreeBuilder;
