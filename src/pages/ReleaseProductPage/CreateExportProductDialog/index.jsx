import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './CreateExportProductDialog.module.scss';
import { Modal, Button } from '../../../components';
import { useDispatch, useSelector } from 'react-redux';
import { clearAllBatchProductList } from '../../../lib/redux/batchProduct/BatchProduct';
import toast from 'react-hot-toast';
import { styleMessage } from '../../../constants';
import { checkOrderReleaseID, saveOrderRelease } from '../../../services/order.service';
import ExportInfoSheet from './ExportInfoSheet';
import ExportProduct from './ExportProduct';
import parseToken from '../../../utils/parseToken';
import { getTotalValidAmountByProductAndUnit } from '../../../services/unit.service';
import { suggestExportProduct } from '../../../services/order.service';
import SuggestedExportListDialog from './SuggestedExportListDialog';
import ManualExport3D from './ManualExport3D';

const cx = classNames.bind(styles);

const CreateExportProductDialog = ({ isOpen, onClose, fetchData, proposalRelease }) => {
    const warehouse = parseToken('warehouse');
    const currentUser = useSelector((state) => state.AuthSlice.user);

    const [formData, setFormData] = useState({
        receiptCode: '',
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: currentUser.empName || '',
        warehouse: warehouse.warehouseName,
        customerID: '',
        customerName: '',
        note: '',
        orderReleaseProposalID: proposalRelease ? proposalRelease.orderReleaseProposalID : '',
        orderReleaseDetails: [],
        approver: proposalRelease?.approver?.employeeName,
    });
    const contentSliceRef = useRef(null);
    const [productListSelected, setProductListSelected] = useState([]); // danh sách sản phẩm được chọn để export
    const [showMethodSelection, setShowMethodSelection] = useState(false);
    const [insufficientProducts, setInsufficientProducts] = useState([]);
    const [showInsufficientModal, setShowInsufficientModal] = useState(false);
    const [suggestedData, setSuggestedData] = useState([]);
    const [showSuggestedModal, setShowSuggestedModal] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [showManualExportModal, setShowManualExportModal] = useState(false);

    const validate = async (payload) => {
        if (!payload.receiptCode) {
            toast.error('Vui lòng tạo mã phiếu xuất kho', styleMessage);
            return false;
        }
        if (!/^PX-/.test(payload.receiptCode)) {
            toast.error('Mã phiếu xuất kho phải bắt đầu bằng PX-', styleMessage);
            return false;
        }
        if (!payload.customerID) {
            toast.error('Vui lòng nhập mã khách hàng', styleMessage);
            return false;
        }
        const res = await checkOrderReleaseID(payload.receiptCode);

        if (res?.exists) {
            toast.error(res?.message, styleMessage);
            return false;
        }
        return true;
    };

    const handleChooseBatch = async () => {
        if (!(await validate(formData))) return;
        const items = productListSelected.map((item) => ({
            productID: item.productID,
            unitID: item.unit.unitID,
        }));

        const res = await getTotalValidAmountByProductAndUnit(items);
        let insufficientList = [];

        if (res.data?.status === 'OK') {
            res.data.data.forEach((item) => {
                const product = productListSelected.find(
                    (p) => p.productID === item.productID && p.unit.unitID === item.unitID,
                );
                if (product && item.totalValidAmount < product.amountRequiredExport) {
                    insufficientList.push({
                        productID: product.productID,
                        productName: product.productName,
                        required: product.amountRequiredExport,
                        available: item.totalValidAmount,
                        unit: product.unit.unitName,
                    });
                }
            });
        }

        if (insufficientList.length > 0) {
            setInsufficientProducts(insufficientList);
            setShowInsufficientModal(true);
        } else {
            setShowMethodSelection(true);
        }
    };

    const handleSelectMethod = async (method) => {
        setShowMethodSelection(false);
        setSelectedMethod(method);

        if (method === 'MANUAL') {
            setShowManualExportModal(true);
            return;
        }

        const payload = {
            type: method,
            items: productListSelected.map((item) => ({
                productID: item.productID,
                unitID: item.unit.unitID,
                quantity: item.amountRequiredExport,
            })),
        };

        try {
            const res = await suggestExportProduct({ payload });
            if (res && res.status === 'OK') {
                const dataWithNames = res.data.map((item) => {
                    const originalProduct = productListSelected.find((p) => p.productID === item.productID);
                    return {
                        ...item,
                        productName: originalProduct ? originalProduct.productName : item.productID,
                    };
                });
                // setSuggestedData(dataWithNames);
                // setShowSuggestedModal(true);
                // toast.success(res.message, styleMessage);

                // Pass suggested data to ManualExport3D
                setSuggestedData(dataWithNames);
                setShowManualExportModal(true);
            } else {
                toast.error(res?.message || 'Có lỗi xảy ra khi gợi ý xuất hàng', styleMessage);
            }
        } catch (error) {
            console.error(error);
            toast.error('Lỗi kết nối server', styleMessage);
        }
    };

    const handleManualExportConfirm = async (data) => {
        // Group by batchID
        const groupedByBatch = data.reduce((acc, item) => {
            if (!acc[item.batchID]) {
                acc[item.batchID] = {
                    batchID: item.batchID,
                    quantityExported: 0,
                    orderReleaseBatchBoxDetails: [],
                };
            }
            acc[item.batchID].quantityExported += item.quantity;
            acc[item.batchID].orderReleaseBatchBoxDetails.push({
                batchID: item.batchID,
                boxID: item.boxID,
                quantityExported: item.quantity,
            });
            return acc;
        }, {});

        const orderReleaseDetails = Object.values(groupedByBatch);

        const payload = {
            orderReleaseID: formData.receiptCode,
            customerID: formData.customerID,
            note: formData.note,
            orderReleaseProposalID: formData.orderReleaseProposalID,
            orderReleaseDetails: orderReleaseDetails,
        };

        console.log('payload', payload);

        try {
            const res = await saveOrderRelease(payload);
            if (res.data?.status === 'OK') {
                toast.success('Tạo phiếu xuất kho thành công', styleMessage);
                setShowManualExportModal(false);
                onClose();
                if (fetchData) fetchData();
            } else {
                toast.error(res?.data?.message || 'Có lỗi xảy ra khi tạo phiếu xuất kho', styleMessage);
            }
        } catch (error) {
            console.error(error);
            toast.error('Lỗi kết nối server', styleMessage);
        }
    };

    const handleCloseModal = () => {
        onClose();
    };

    const handleResetForm = () => {
        setFormData((prev) => ({
            ...prev,
            receiptCode: '',
            note: '',
        }));
    };

    useEffect(() => {
        if (!proposalRelease) return;
        setFormData({
            receiptCode: '',
            createdDate: new Date().toISOString().split('T')[0],
            createdBy: currentUser.empName || '',
            warehouse: warehouse.warehouseName,
            customerID: proposalRelease?.customer?.customerID || '',
            customerName: proposalRelease?.customer?.customerName || '',
            note: proposalRelease?.note || '',
            orderReleaseProposalID: proposalRelease.orderReleaseProposalID || '',
            orderReleaseDetails: [],
            approver: proposalRelease?.approver?.employeeName || '',
        });
        setProductListSelected(
            (proposalRelease?.orderReleaseProposalDetails || []).map((item) => ({
                productID: item.productID,
                productName: item.productName,
                unit: item.unit,
                amountRequiredExport: item.amountRequiredExport,
            })),
        );
    }, [proposalRelease]);

    return (
        <>
            <Modal isOpenInfo={isOpen} onClose={handleCloseModal} showButtonClose={false}>
                <div className={cx('dialog-content-release')}>
                    <header className={cx('dialog-header')}>
                        <h1 className={cx('dialog-title')}>Phiếu xuất kho</h1>
                        <div className={cx('header-action')}>
                            <Button outline borderRadiusMedium className={cx('btn-reset')} onClick={handleResetForm}>
                                <span>Làm mới</span>
                            </Button>
                            <Button success borderRadiusMedium className={cx('btn-submit')} onClick={handleChooseBatch}>
                                Chọn lô xuất
                            </Button>
                        </div>
                    </header>

                    <main className={cx('content')}>
                        <div ref={contentSliceRef} className={cx('slice-content')}>
                            <ExportInfoSheet
                                formData={formData}
                                setFormData={setFormData}
                                className={cx('content-normal-info')}
                            />

                            <ExportProduct
                                className={cx('table-product-release')}
                                productListResult={productListSelected}
                            />
                        </div>
                    </main>
                </div>
            </Modal>

            {/* Modal chọn phương thức xuất */}
            <Modal
                isOpenInfo={showMethodSelection}
                onClose={() => setShowMethodSelection(false)}
                showButtonClose={false}
            >
                <div className={cx('selection-dialog')}>
                    <h3 className={cx('selection-title')}>Chọn phương thức xuất kho</h3>
                    <div className={cx('selection-options')}>
                        <Button
                            primary
                            borderRadiusMedium
                            className={cx('btn-option')}
                            onClick={() => handleSelectMethod('FEFO')}
                        >
                            Xuất theo FEFO (Hết hạn trước xuất trước)
                        </Button>
                        <Button
                            primary
                            borderRadiusMedium
                            className={cx('btn-option')}
                            onClick={() => handleSelectMethod('FIFO')}
                        >
                            Xuất theo FIFO (Nhập trước xuất trước)
                        </Button>
                        <Button
                            outline
                            borderRadiusMedium
                            className={cx('btn-option')}
                            onClick={() => handleSelectMethod('MANUAL')}
                        >
                            Tự chọn lô
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal thông báo không đủ số lượng */}
            <Modal
                isOpenInfo={showInsufficientModal}
                onClose={() => setShowInsufficientModal(false)}
                showButtonClose={true}
            >
                <div className={cx('insufficient-dialog')}>
                    <h3 className={cx('insufficient-title')}>Sản phẩm không đủ số lượng</h3>
                    <div className={cx('table-container')}>
                        <table className={cx('insufficient-table')}>
                            <thead>
                                <tr>
                                    <th>Mã sản phẩm</th>
                                    <th>Sản phẩm</th>
                                    <th className={cx('text-center')}>Yêu cầu</th>
                                    <th className={cx('text-center')}>Hiện có</th>
                                </tr>
                            </thead>
                            <tbody>
                                {insufficientProducts.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.productID}</td>
                                        <td>{item.productName}</td>
                                        <td className={cx('text-center', 'font-bold')}>
                                            {item.required} {item.unit}
                                        </td>
                                        <td className={cx('text-center', 'font-bold', 'text-danger')}>
                                            {item.available} {item.unit}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal>

            {/* Modal hiển thị gợi ý xuất hàng */}
            {/* <SuggestedExportListDialog
                isOpen={showSuggestedModal}
                onClose={() => setShowSuggestedModal(false)}
                data={suggestedData}
                onConfirm={handleConfirmSuggestion}
                type={selectedMethod}
            /> */}

            {/* Modal tự chọn lô 3D */}
            <ManualExport3D
                isOpen={showManualExportModal}
                onClose={() => {
                    setShowManualExportModal(false);
                    setSuggestedData([]); // Reset suggested data when closing
                }}
                products={productListSelected}
                onConfirm={handleManualExportConfirm}
                suggestedData={suggestedData}
            />
        </>
    );
};

export default CreateExportProductDialog;
