import { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import {
    Container,
    Paper,
    Typography,
    Button,
    Box,
    Alert,
    AlertTitle,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ThemeProvider,
    createTheme,
    CssBaseline,
    TextField,
    Divider,
    Collapse,
    IconButton,
} from '@mui/material';
import {
    Save,
    CheckCircleOutline,
    ExpandMore,
    ExpandLess,
} from '@mui/icons-material';
import TreeBuilder from './components/TreeBuilder';
import SpecificConditionTable from './components/SpecificConditionTable';
import SpecificConditionDialog from './components/SpecificConditionDialog';
import { generateSQL } from './utils/generateSQL';
import { TreeNode, FieldConfig, ConditionFormData, SpecificCondition } from './types';

// Custom MUI Theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
            50: '#e3f2fd',
            100: '#bbdefb',
        },
        success: {
            main: '#2e7d32',
            light: '#4caf50',
            50: '#e8f5e9',
        },
        warning: {
            main: '#ed6c02',
            light: '#ff9800',
            dark: '#e65100',
            50: '#fff3e0',
        },
        info: {
            main: '#0288d1',
            light: '#03a9f4',
            50: '#e1f5fe',
        },
        grey: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#eeeeee',
            300: '#e0e0e0',
        },
        background: {
            default: '#f5f7fa',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
    },
});

// Extend theme palette
declare module '@mui/material/styles' {
    interface PaletteColor {
        50?: string;
        100?: string;
    }
}

// Danh sách fields mẫu
const AVAILABLE_FIELDS: FieldConfig[] = [
    { id: '1', field: 'user_age', fieldName: 'Tuổi' },
    { id: '2', field: 'user_status', fieldName: 'Trạng thái' },
    { id: '3', field: 'user_role', fieldName: 'Vai trò' },
    { id: '4', field: 'user_email', fieldName: 'Email' },
    { id: '5', field: 'user_name', fieldName: 'Họ tên' },
    { id: '6', field: 'created_at', fieldName: 'Ngày tạo' },
    { id: '7', field: 'updated_at', fieldName: 'Ngày cập nhật' },
    { id: '8', field: 'department_id', fieldName: 'Phòng ban' },
    { id: '9', field: 'is_active', fieldName: 'Đang hoạt động' },
    { id: '10', field: 'salary', fieldName: 'Lương' },
];

// Default empty tree
const createEmptyTree = (): TreeNode => ({
    nodeType: "GROUP",
    logicalOperator: "AND",
    expanded: true,
    children: []
});

// Default form values
const defaultFormValues: ConditionFormData = {
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

// Dialog state type
interface DialogState {
    open: boolean;
    mode: 'view' | 'edit';
    index: number | null;
    tempName: string;
    tempCondition: TreeNode;
}

export default function App() {
    const { control, handleSubmit, watch, setValue } = useForm<ConditionFormData>({
        defaultValues: defaultFormValues
    });

    const { append, remove } = useFieldArray({
        control,
        name: 'specificConditions',
    });

    const [savedData, setSavedData] = useState<ConditionFormData | null>(null);
    const [showGeneralCondition, setShowGeneralCondition] = useState(true);

    // Dialog state
    const [dialogState, setDialogState] = useState<DialogState>({
        open: false,
        mode: 'view',
        index: null,
        tempName: '',
        tempCondition: createEmptyTree(),
    });

    const formData = watch();
    const specificConditions = formData.specificConditions || [];

    // Open dialog for viewing
    const handleView = (index: number) => {
        const condition = specificConditions[index];
        setDialogState({
            open: true,
            mode: 'view',
            index,
            tempName: condition.name,
            tempCondition: JSON.parse(JSON.stringify(condition.condition)),
        });
    };

    // Open dialog for editing
    const handleEdit = (index: number) => {
        const condition = specificConditions[index];
        setDialogState({
            open: true,
            mode: 'edit',
            index,
            tempName: condition.name,
            tempCondition: JSON.parse(JSON.stringify(condition.condition)),
        });
    };

    // Close dialog
    const handleCloseDialog = () => {
        setDialogState(prev => ({ ...prev, open: false }));
    };

    // Save changes from dialog
    const handleSaveDialog = () => {
        if (dialogState.index !== null) {
            setValue(`specificConditions.${dialogState.index}.name`, dialogState.tempName);
            setValue(`specificConditions.${dialogState.index}.condition`, dialogState.tempCondition);
        }
    };

    // Update temp name in dialog
    const handleTempNameChange = (name: string) => {
        setDialogState(prev => ({ ...prev, tempName: name }));
    };

    // Update temp condition in dialog
    const handleTempConditionChange = (condition: TreeNode) => {
        setDialogState(prev => ({ ...prev, tempCondition: condition }));
    };

    const handleAddSpecific = () => {
        const newCondition: SpecificCondition = {
            id: Date.now().toString(),
            name: '',
            condition: createEmptyTree()
        };
        append(newCondition);
        // Open edit dialog for new item
        setTimeout(() => {
            handleEdit(specificConditions.length);
        }, 100);
    };

    const handleDeleteSpecific = (index: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa điều kiện này?')) {
            remove(index);
        }
    };

    const onSubmit = (data: ConditionFormData) => {
        setSavedData(data);
        console.log('Form Data:', data);

        // Generate SQL cho điều kiện chung
        const generalSQL = generateSQL(data.generalCondition, AVAILABLE_FIELDS);
        console.log('General SQL:', generalSQL);

        // Generate SQL cho từng điều kiện riêng
        data.specificConditions.forEach((spec, index) => {
            const specificSQL = generateSQL(spec.condition, AVAILABLE_FIELDS);
            console.log(`Specific ${index + 1} (${spec.name}):`, specificSQL);
        });
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                    py: 4,
                }}
            >
                <Container maxWidth="lg">
                    {/* Header */}
                    <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                            SQL Condition Builder
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                            Xây dựng điều kiện SQL với điều kiện chung và các điều kiện riêng
                        </Typography>

                        {/* Tên điều kiện chung */}
                        <Box sx={{ mb: 4 }}>
                            <Controller
                                name="generalName"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Tên điều kiện chung"
                                        fullWidth
                                        variant="outlined"
                                    />
                                )}
                            />
                        </Box>

                        {/* Điều kiện chung */}
                        <Paper
                            elevation={0}
                            sx={{
                                mb: 4,
                                border: '1px solid',
                                borderColor: 'primary.light',
                                borderRadius: 2,
                                overflow: 'hidden',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 2,
                                    bgcolor: 'primary.50',
                                    cursor: 'pointer',
                                }}
                                onClick={() => setShowGeneralCondition(!showGeneralCondition)}
                            >
                                <Typography variant="subtitle1" fontWeight={600} color="primary.dark">
                                    Điều kiện chung (WHERE)
                                </Typography>
                                <IconButton size="small">
                                    {showGeneralCondition ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                            </Box>
                            <Collapse in={showGeneralCondition}>
                                <Box sx={{ p: 2 }}>
                                    <Controller
                                        name="generalCondition"
                                        control={control}
                                        render={({ field }) => (
                                            <TreeBuilder
                                                value={field.value}
                                                onChange={field.onChange}
                                                fields={AVAILABLE_FIELDS}
                                            />
                                        )}
                                    />
                                </Box>
                            </Collapse>
                        </Paper>

                        <Divider sx={{ my: 4 }} />

                        {/* Điều kiện riêng */}
                        <Box sx={{ mb: 4 }}>
                            <SpecificConditionTable
                                conditions={specificConditions}
                                onView={handleView}
                                onEdit={handleEdit}
                                onAdd={handleAddSpecific}
                                onDelete={handleDeleteSpecific}
                            />
                        </Box>

                        {/* Submit Button */}
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<Save />}
                            onClick={handleSubmit(onSubmit)}
                            sx={{ px: 4 }}
                        >
                            Lưu tất cả
                        </Button>
                    </Paper>

                    {/* SQL Preview */}
                    <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                        <Typography variant="h5" fontWeight={600} gutterBottom>
                            SQL Preview (Real-time)
                        </Typography>

                        {/* General Condition SQL */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                Điều kiện chung: <strong>{formData.generalName || '(Chưa đặt tên)'}</strong>
                            </Typography>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    bgcolor: '#1e1e1e',
                                    borderRadius: 2,
                                    overflow: 'auto',
                                }}
                            >
                                <Typography
                                    component="code"
                                    sx={{
                                        fontFamily: '"Fira Code", "Consolas", monospace',
                                        fontSize: '0.875rem',
                                        color: '#4ec9b0',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-all',
                                    }}
                                >
                                    WHERE {formData.generalCondition ? (generateSQL(formData.generalCondition, AVAILABLE_FIELDS) || '(empty)') : '(empty)'}
                                </Typography>
                            </Paper>
                        </Box>

                        {/* Specific Conditions SQL */}
                        {specificConditions.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                                    Các điều kiện riêng:
                                </Typography>
                                {specificConditions.map((spec, index) => (
                                    <Paper
                                        key={index}
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            mb: 2,
                                            bgcolor: '#263238',
                                            borderRadius: 2,
                                            overflow: 'auto',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                bgcolor: '#37474f',
                                            },
                                        }}
                                        onClick={() => handleView(index)}
                                    >
                                        <Typography
                                            sx={{
                                                fontFamily: '"Fira Code", "Consolas", monospace',
                                                fontSize: '0.75rem',
                                                color: '#90caf9',
                                                mb: 1,
                                            }}
                                        >
                                            -- {spec.name || `Điều kiện riêng #${index + 1}`}
                                        </Typography>
                                        <Typography
                                            component="code"
                                            sx={{
                                                fontFamily: '"Fira Code", "Consolas", monospace',
                                                fontSize: '0.875rem',
                                                color: '#c5e1a5',
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-all',
                                            }}
                                        >
                                            WHERE {generateSQL(spec.condition, AVAILABLE_FIELDS) || '(empty)'}
                                        </Typography>
                                    </Paper>
                                ))}
                            </Box>
                        )}
                    </Paper>

                    {/* Saved Data Preview */}
                    {savedData && (
                        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                            <Typography variant="h5" fontWeight={600} gutterBottom color="success.main">
                                ✓ Dữ liệu đã lưu
                            </Typography>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    bgcolor: 'grey.100',
                                    borderRadius: 2,
                                    overflow: 'auto',
                                    maxHeight: 300,
                                }}
                            >
                                <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                                    {JSON.stringify(savedData, null, 2)}
                                </pre>
                            </Paper>
                        </Paper>
                    )}

                    {/* Instructions */}
                    <Alert
                        severity="info"
                        icon={false}
                        sx={{
                            '& .MuiAlert-message': { width: '100%' },
                        }}
                    >
                        <AlertTitle sx={{ fontWeight: 600 }}>Hướng dẫn</AlertTitle>
                        <List dense disablePadding>
                            {[
                                'Nhập tên điều kiện chung và cấu hình logic điều kiện',
                                'Thêm các điều kiện riêng bằng nút "Thêm điều kiện riêng"',
                                'Click icon 👁️ để xem chi tiết (chỉ đọc)',
                                'Click icon ✏️ để sửa điều kiện riêng',
                                'Click icon 🗑️ để xóa điều kiện riêng',
                                'Nhấn "Lưu tất cả" để lưu toàn bộ form',
                            ].map((text, index) => (
                                <ListItem key={index} disablePadding sx={{ py: 0.25 }}>
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <CheckCircleOutline fontSize="small" color="info" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={text}
                                        primaryTypographyProps={{ variant: 'body2' }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Alert>
                </Container>
            </Box>

            {/* Dialog for View/Edit Specific Condition */}
            <SpecificConditionDialog
                open={dialogState.open}
                mode={dialogState.mode}
                name={dialogState.tempName}
                condition={dialogState.tempCondition}
                fields={AVAILABLE_FIELDS}
                onClose={handleCloseDialog}
                onNameChange={handleTempNameChange}
                onConditionChange={handleTempConditionChange}
                onSave={handleSaveDialog}
            />
        </ThemeProvider>
    );
}
