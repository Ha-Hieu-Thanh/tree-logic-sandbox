import { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
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
    CircularProgress,
    Snackbar,
    Backdrop,
    Chip,
    FormHelperText,
} from '@mui/material';
import {
    Save,
    CheckCircleOutline,
    ExpandMore,
    ExpandLess,
    Refresh,
    Error as ErrorIcon,
} from '@mui/icons-material';
import TreeBuilder from './components/TreeBuilder';
import SpecificConditionTable from './components/SpecificConditionTable';
import SpecificConditionDialog from './components/SpecificConditionDialog';
import { generateSQL } from './utils/generateSQL';
import { useConditions } from './hooks/useConditions';
import { conditionFormSchema, validateTreeHasConditions } from './validations/conditionSchema';
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
    generalName: '',
    generalCondition: createEmptyTree(),
    specificConditions: []
};

// Dialog state type
interface DialogState {
    open: boolean;
    mode: 'view' | 'edit';
    index: number | null;
    tempName: string;
    tempCondition: TreeNode;
}

// Snackbar state type
interface SnackbarState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
}

export default function App() {
    // TanStack Query hooks
    const {
        data: serverData,
        isLoading,
        isError,
        error,
        saveAll,
        isSaving,
    } = useConditions();

    // React Hook Form with Yup validation
    const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ConditionFormData>({
        defaultValues: defaultFormValues,
        resolver: yupResolver(conditionFormSchema) as any,
        mode: 'onSubmit', // Validate on submit
    });

    const { append, remove } = useFieldArray({
        control,
        name: 'specificConditions',
    });

    // Local state
    const [showGeneralCondition, setShowGeneralCondition] = useState(true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'success',
    });

    // Dialog state
    const [dialogState, setDialogState] = useState<DialogState>({
        open: false,
        mode: 'view',
        index: null,
        tempName: '',
        tempCondition: createEmptyTree(),
    });

    // Sync server data to form when loaded
    useEffect(() => {
        if (serverData) {
            reset(serverData);
            setHasUnsavedChanges(false);
        }
    }, [serverData, reset]);

    const formData = watch();
    const specificConditions = formData.specificConditions || [];

    // Show snackbar helper
    const showSnackbar = (message: string, severity: SnackbarState['severity']) => {
        setSnackbar({ open: true, message, severity });
    };

    // Mark as having unsaved changes
    const markUnsaved = () => {
        setHasUnsavedChanges(true);
    };

    // Open dialog for viewing
    const handleView = (index: number) => {
        const condition = specificConditions[index];
        if (!condition) return;
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
        if (!condition) return;
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

    // Save changes from dialog (local only - not to server)
    const handleSaveDialog = () => {
        if (dialogState.index !== null) {
            setValue(`specificConditions.${dialogState.index}.name`, dialogState.tempName);
            setValue(`specificConditions.${dialogState.index}.condition`, dialogState.tempCondition);
            markUnsaved();
            showSnackbar('Đã cập nhật điều kiện riêng (chưa lưu xuống server)', 'info');
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

    // Add new specific condition (local only)
    const handleAddSpecific = () => {
        const newCondition: SpecificCondition = {
            id: Date.now().toString(),
            name: '',
            condition: createEmptyTree(),
        };
        append(newCondition);
        markUnsaved();
        showSnackbar('Đã thêm điều kiện riêng (chưa lưu xuống server)', 'info');

        // Open edit dialog for new item
        setTimeout(() => {
            handleEdit(specificConditions.length);
        }, 100);
    };

    // Delete specific condition (local only)
    const handleDeleteSpecific = (index: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa điều kiện này?')) {
            remove(index);
            markUnsaved();
            showSnackbar('Đã xóa điều kiện riêng (chưa lưu xuống server)', 'info');
        }
    };

    // Save all data to server
    const onSubmit = async (data: ConditionFormData) => {
        // Custom validation: kiểm tra điều kiện chung có ít nhất 1 điều kiện
        if (!validateTreeHasConditions(data.generalCondition)) {
            showSnackbar('Điều kiện chung phải có ít nhất 1 điều kiện đã cấu hình đầy đủ', 'error');
            return;
        }

        // Custom validation: kiểm tra các điều kiện riêng có tên và có ít nhất 1 điều kiện
        for (let i = 0; i < data.specificConditions.length; i++) {
            const spec = data.specificConditions[i];
            if (!spec.name || spec.name.trim() === '') {
                showSnackbar(`Điều kiện riêng #${i + 1} chưa có tên`, 'error');
                return;
            }
            if (!validateTreeHasConditions(spec.condition)) {
                showSnackbar(`Điều kiện riêng "${spec.name}" phải có ít nhất 1 điều kiện đã cấu hình đầy đủ`, 'error');
                return;
            }
        }

        try {
            await saveAll.mutateAsync(data);
            setHasUnsavedChanges(false);
            showSnackbar('Lưu tất cả dữ liệu thành công!', 'success');
            console.log('Saved Data:', data);

            // Generate SQL cho điều kiện chung
            const generalSQL = generateSQL(data.generalCondition, AVAILABLE_FIELDS);
            console.log('General SQL:', generalSQL);

            // Generate SQL cho từng điều kiện riêng
            data.specificConditions.forEach((spec, index) => {
                const specificSQL = generateSQL(spec.condition, AVAILABLE_FIELDS);
                console.log(`Specific ${index + 1} (${spec.name}):`, specificSQL);
            });
        } catch (err) {
            console.error('Save error:', err);
            showSnackbar('Lỗi khi lưu dữ liệu!', 'error');
        }
    };

    // Handle form validation errors
    const onError = (formErrors: any) => {
        console.log('Validation errors:', formErrors);

        if (formErrors.generalName) {
            showSnackbar(formErrors.generalName.message || 'Tên điều kiện chung không hợp lệ', 'error');
            return;
        }

        if (formErrors.generalCondition) {
            showSnackbar('Điều kiện chung không hợp lệ', 'error');
            return;
        }

        if (formErrors.specificConditions) {
            showSnackbar('Một số điều kiện riêng không hợp lệ. Vui lòng kiểm tra lại.', 'error');
            return;
        }

        showSnackbar('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.', 'error');
    };

    // Refresh data from server
    const handleRefresh = () => {
        if (hasUnsavedChanges) {
            if (window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn tải lại dữ liệu từ server?')) {
                window.location.reload();
            }
        } else {
            window.location.reload();
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'background.default',
                    }}
                >
                    <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress size={60} />
                        <Typography variant="h6" sx={{ mt: 2 }}>
                            Đang tải dữ liệu từ server...
                        </Typography>
                    </Box>
                </Box>
            </ThemeProvider>
        );
    }

    // Error state
    if (isError) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'background.default',
                    }}
                >
                    <Alert severity="error" sx={{ maxWidth: 500 }}>
                        <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
                        {error?.message || 'Không thể kết nối đến server'}
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            sx={{ mt: 2 }}
                            onClick={handleRefresh}
                            startIcon={<Refresh />}
                        >
                            Thử lại
                        </Button>
                    </Alert>
                </Box>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />

            {/* Loading Backdrop */}
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={isSaving}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress color="inherit" />
                    <Typography sx={{ mt: 2 }}>Đang lưu dữ liệu...</Typography>
                </Box>
            </Backdrop>

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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                    <Typography variant="h4" component="h1" fontWeight={700}>
                                        SQL Condition Builder
                                    </Typography>
                                    {hasUnsavedChanges && (
                                        <Chip
                                            label="Có thay đổi chưa lưu"
                                            color="warning"
                                            size="small"
                                        />
                                    )}
                                </Box>
                                <Typography variant="body1" color="text.secondary">
                                    Xây dựng điều kiện SQL với điều kiện chung và các điều kiện riêng
                                </Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                startIcon={<Refresh />}
                                onClick={handleRefresh}
                                size="small"
                            >
                                Refresh
                            </Button>
                        </Box>

                        {/* Status indicator */}
                        <Alert severity="info" sx={{ mb: 4 }}>
                            <strong>Lưu ý:</strong> Mọi thay đổi chỉ được lưu xuống database khi nhấn nút "Lưu tất cả".
                            Thêm/Sửa/Xóa điều kiện riêng chỉ thay đổi trên giao diện.
                        </Alert>

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
                                        error={!!errors.generalName}
                                        helperText={errors.generalName?.message}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            markUnsaved();
                                        }}
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
                                                onChange={(value) => {
                                                    field.onChange(value);
                                                    markUnsaved();
                                                }}
                                                fields={AVAILABLE_FIELDS}
                                            />
                                        )}
                                    />
                                    {errors.generalCondition && (
                                        <FormHelperText error sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <ErrorIcon fontSize="small" />
                                            {typeof errors.generalCondition.message === 'string'
                                                ? errors.generalCondition.message
                                                : 'Vui lòng cấu hình điều kiện chung'}
                                        </FormHelperText>
                                    )}
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

                        {/* Validation Errors Summary */}
                        {Object.keys(errors).length > 0 && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                <AlertTitle>Có lỗi validation</AlertTitle>
                                <List dense disablePadding>
                                    {errors.generalName && (
                                        <ListItem disablePadding>• {errors.generalName.message}</ListItem>
                                    )}
                                    {errors.generalCondition && (
                                        <ListItem disablePadding>• Điều kiện chung không hợp lệ</ListItem>
                                    )}
                                    {errors.specificConditions && (
                                        <ListItem disablePadding>• Một số điều kiện riêng không hợp lệ</ListItem>
                                    )}
                                </List>
                            </Alert>
                        )}

                        {/* Submit Button */}
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                            onClick={handleSubmit(onSubmit as any, onError)}
                            disabled={isSaving}
                            color={hasUnsavedChanges ? 'warning' : 'primary'}
                            sx={{ px: 4 }}
                        >
                            {isSaving ? 'Đang lưu...' : hasUnsavedChanges ? 'Lưu tất cả (có thay đổi)' : 'Lưu tất cả'}
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
                                        key={spec.id || index}
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
                                '📡 Dữ liệu được load từ server khi mở trang (GET API)',
                                '➕ Thêm/✏️ Sửa/🗑️ Xóa điều kiện riêng → chỉ thay đổi trên giao diện',
                                '💾 Nhấn "Lưu tất cả" → gọi PUT API lưu toàn bộ dữ liệu xuống database',
                                '⚠️ Thay đổi chưa lưu sẽ hiển thị badge cảnh báo',
                                '🔄 Refresh sẽ tải lại dữ liệu từ server (mất các thay đổi chưa lưu)',
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

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
}
