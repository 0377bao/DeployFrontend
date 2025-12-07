import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import classNames from 'classnames/bind';
import styles from './CreateImportReceiptDialog.module.scss';
import { useSelector } from 'react-redux';
import { Modal, Button } from '../../../components';
import { generateCode } from '../../../utils/generate';
import { findSupplier, getAllSupllier } from '../../../services/supplier.service';
import toast from 'react-hot-toast';
import { styleMessage } from '../../../constants';
import { saveReceipt, validatePayloadCreateReceipt } from '../../../services/order.service';
import PopupMessage from '../../../components/PopupMessage';
import globalStyles from '@/components/GlobalStyle/GlobalStyle.module.scss';

const cxGlb = classNames.bind(globalStyles);
const cx = classNames.bind(styles);

const emptyItem = () => ({
    batchID: '',
    productID: '',
    productName: '',
    unit: '',
    requestAmount: '',
    realAmount: '',
    errorAmount: '',
    location: '',
    reasonError: '',
    supplierID: '',
    manufactureDate: '',
    expiryDate: '',
    supplierName: '',
});

const CreateImportReceiptDialog = ({ proposalItem, isOpen, onClose, handleFetchProposalMissingOrderPurchase }) => {
    const currentUser = useSelector((state) => state.AuthSlice.user);
    const [productListImport, setProductListImport] = useState([]);
    const [orderPurchase, setOrderPurchase] = useState({
        code: '',
        publishedDate: new Date().toISOString().slice(0, 10),
        warehouseName: proposalItem?.warehouse?.warehouseName,
        warehouseID: proposalItem?.warehouse?.warehouseID,
        creator: currentUser.empName || '',
        approver: proposalItem?.approver?.employeeName || '',
        proposalID: proposalItem?.proposalID || '',
        note: proposalItem?.note || '',
    });
    const [suppliers, setSuppliers] = useState([]);
    const [showPopupConfirmSaveMissing, setShowPopConfirmSaveMissing] = useState(false);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const res = await getAllSupllier();
                if (res) {
                    setSuppliers(res);
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchSuppliers();
    }, []);

    const updateCellData = (idx, item) => {
        const updateList = productListImport.map((it, index) => (index == idx ? item : it));
        setProductListImport(updateList);
    };

    // const handleFindSupplier = async (supplierID, item, idx) => {
    //     if (!supplierID) return;
    //     try {
    //         const res = await findSupplier(supplierID);
    //         if (res) updateCellData(idx, { ...item, supplierName: res.supplierName });
    //         else {
    //             toast.error('Nhà cung cấp không tồn tại', styleMessage);
    //             return;
    //         }
    //     } catch (err) {
    //         console.log(err);
    //     }
    // };

    const checkRealAmount = (value, it, idx) => {
        if (value === '') {
            it.realAmount = '';
            it.errorAmount = '';
            updateCellData(idx, it);
        } else {
            if (value > it.requestAmount) {
                toast.error('Số lượng thực tế vượt mức yêu cầu!', styleMessage);
                return;
            }
            const num = Number.parseInt(value, 10);
            it.realAmount = isNaN(num) ? '' : num;
            it.errorAmount = isNaN(num) ? '' : it.requestAmount - num;
            updateCellData(idx, it);
        }
    };

    const handleSaveReceipt = async () => {
        const status = productListImport.some((it) => it.errorAmount > 0);
        const payload = {
            orderPurchaseID: orderPurchase.code,
            createdAt: orderPurchase.publishedDate,
            employeeID: currentUser.empId,
            warehouseID: orderPurchase.warehouseID,
            proposalID: orderPurchase.proposalID,
            status: status ? 'INCOMPLETE' : 'COMPLETED',
            orderPurchaseDetails: productListImport.map((item, index) => ({
                orderPurchaseDetailID: index + 1,
                batchID: item.batchID,
                requestedQuantity: item.requestAmount,
                actualQuantity: item.realAmount,
                unitID: item.unit.unitID,
                manufactureDate: item.manufactureDate,
                expiryDate: item.expiryDate,
                productID: item.productID,
                supplierID: item.supplierID,
                positions: [
                    {
                        zoneID: 'ZN1',
                        shelfID: 'SF1',
                        floorID: 'FL1',
                        boxID: 'BX1',
                    },
                ],
            })),
        };

        if (!validatePayloadCreateReceipt(payload)) return;
        if (status) {
            setShowPopConfirmSaveMissing(true);
            return;
        }
        try {
            const res = await saveReceipt(payload);
            if (res) {
                toast.success(res.data.message, styleMessage);
                handleFetchProposalMissingOrderPurchase();
                onClose();
            }
        } catch (err) {
            console.log(err);
            toast.error(err.response.data.message, styleMessage);
            return;
        }
    };

    const handleSaveReceiptMissing = async () => {
        const payload = {
            orderPurchaseID: orderPurchase.code,
            createdAt: orderPurchase.publishedDate,
            employeeID: currentUser.empId,
            warehouseID: orderPurchase.warehouseID,
            proposalID: orderPurchase.proposalID,
            status: 'INCOMPLETE',
            orderPurchaseDetails: productListImport.map((item, index) => ({
                orderPurchaseDetailID: index + 1,
                batchID: item.batchID,
                requestedQuantity: item.requestAmount,
                actualQuantity: item.realAmount,
                unitID: item.unit.unitID,
                manufactureDate: item.manufactureDate,
                expiryDate: item.expiryDate,
                productID: item.productID,
                supplierID: item.supplierID,
                positions: [
                    {
                        zoneID: 'ZN1',
                        shelfID: 'SF1',
                        floorID: 'FL1',
                        boxID: 'BX1',
                    },
                ],
            })),
        };

        if (!validatePayloadCreateReceipt(payload)) return;
        try {
            const res = await saveReceipt(payload);
            toast.success(res.data.message, styleMessage);
            handleFetchProposalMissingOrderPurchase();
            onClose();
        } catch (err) {
            console.log(err);
        }
    };
    const handleResetField = () => {
        const updateProductList = productListImport.map((item) => ({
            ...item,
            batchID: '',
            reasonError: '',
            location: '',
            supplierID: '',
            manufactureDate: '',
            expiryDate: '',
            supplierName: '',
        }));
        setProductListImport(updateProductList);
    };

    useEffect(() => {
        if (!proposalItem) return;
        const formatProductListImport = proposalItem.proposalDetails.map((it) => {
            const batchProduct = emptyItem();
            batchProduct.batchID = it.batchID || '';
            batchProduct.productID = it.productID;
            batchProduct.productName = it.product.productName;
            batchProduct.requestAmount = it.quantity;
            batchProduct.realAmount = it.quantity;
            batchProduct.errorAmount = 0;
            batchProduct.unit = {
                unitID: it.unit.unitID,
                unitName: it.unit.unitName,
            };
            batchProduct.batchID = it.batchID || '';
            return batchProduct;
        });
        setProductListImport(formatProductListImport);
        setOrderPurchase((prev) => ({
            ...prev,
            creator: currentUser.empName,
            approver: proposalItem.approver.employeeName,
            proposalID: proposalItem.proposalID,
            note: proposalItem.note,
            warehouseName: proposalItem.warehouse.warehouseName,
            warehouseID: proposalItem.warehouse.warehouseID,
        }));
    }, [proposalItem, currentUser]);

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose}>
            <div className={cx('wrapper-import-product-dialog')}>
                <main className={cx('container-receive-product')}>
                    <header className={cx('header')}>
                        <div className={cx('headerLeft')}>
                            <h1 className={cx('title')}>Phiếu nhập kho</h1>
                        </div>
                        <div className={cx('headerActions')}>
                            <Button outline borderRadiusMedium onClick={handleResetField}>
                                <span>Làm mới</span>
                            </Button>
                            <Button success borderRadiusMedium onClick={handleSaveReceipt}>
                                Lưu phiếu
                            </Button>
                        </div>
                    </header>
                    <div className={cx('content-container-product')}>
                        {/** Thông tin chung của phiếu */}
                        <section className={cx('card')}>
                            <h2 className={cx('cardTitle')}>Thông tin chung</h2>
                            <div className={cx('grid3')}>
                                <div className={cx('field')}>
                                    <label>Mã phiếu nhập</label>
                                    <div className={cx('field-control')}>
                                        <input
                                            placeholder="Tạo mã phiếu"
                                            value={orderPurchase.code}
                                            onChange={(e) =>
                                                setOrderPurchase((prev) => ({ ...prev, code: e.target.value }))
                                            }
                                        />
                                        <Button
                                            primary
                                            borderRadiusMedium
                                            onClick={() => {
                                                if (orderPurchase.code) {
                                                    toast.error('Mã phiếu đã được tạo!', styleMessage);
                                                    return;
                                                }
                                                setOrderPurchase((prev) => ({
                                                    ...prev,
                                                    code: generateCode('PNK-'),
                                                }));
                                            }}
                                        >
                                            <span>Tạo mã phiếu</span>
                                        </Button>
                                    </div>
                                </div>
                                <div className={cx('field')}>
                                    <label>Ngày lập</label>
                                    <input value={orderPurchase.publishedDate} readOnly className={cxGlb('readOnly')} />
                                </div>
                                <div className={cx('field')}>
                                    <label>Kho nhập</label>
                                    <input value={orderPurchase.warehouseName} readOnly className={cxGlb('readOnly')} />
                                </div>
                                <div className={cx('field')}>
                                    <label>Người lập phiếu</label>
                                    <input
                                        placeholder="Nguyễn Văn A"
                                        value={orderPurchase.creator}
                                        readOnly
                                        className={cxGlb('readOnly')}
                                    />
                                </div>

                                <div className={cx('field')}>
                                    <label>Người duyệt</label>
                                    <input
                                        value={orderPurchase.approver || ''}
                                        readOnly
                                        className={cxGlb('readOnly')}
                                    />
                                </div>

                                <div className={cx('field')}>
                                    <label>Mã phiếu đề xuất</label>
                                    <input
                                        value={orderPurchase.proposalID || ''}
                                        readOnly
                                        className={cxGlb('readOnly')}
                                    />
                                </div>

                                <div className={cx('field', 'colSpan3')}>
                                    <label>Ghi chú</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Nhập bổ sung, trả hàng NCC, nhập khuyến mãi..."
                                        value={orderPurchase.note}
                                        onChange={(e) =>
                                            setOrderPurchase((prev) => ({ ...prev, note: e.target.value }))
                                        }
                                        className={cxGlb('readOnly')}
                                    />
                                </div>
                            </div>
                        </section>
                        {/** Nhập sản phẩm */}
                        <section></section>
                        {/** Table sản phẩm */}
                        <section className={cx('product-receive-list')}>
                            <h2>Danh sách nhập hàng</h2>
                            <div className={cx('tableWrap')}>
                                <table className={cx('table', 'stickyTable')}>
                                    <thead>
                                        <tr>
                                            <th className={cx('stickyCol', 'stickyCol1', 'stt')}>STT</th>
                                            <th className={cx('stickyCol', 'stickyCol2', 'sku')}>Mã sản phẩm</th>
                                            <th className={cx('stickyCol', 'stickyCol3', 'name')}>Tên sản phẩm</th>
                                            <th className={cx('unit')}>Đơn vị tính</th>
                                            <th className={cx('number')}>Số lượng yêu cầu</th>
                                            <th className={cx('number')}>Số lượng thực tế</th>
                                            <th className={cx('number')}>Số lượng thiếu</th>
                                            <th className={cx('note')}>Lý do thiếu</th>
                                            <th className={cx('lot')}>Mã lô</th>
                                            <th className={cx('date')}>Ngày sản xuất</th>
                                            <th className={cx('date')}>Hạn sử dụng</th>
                                            <th className={cx('sku_sup')}>Nhà cung cấp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {proposalItem &&
                                            productListImport.map((it, idx) => (
                                                <tr key={idx}>
                                                    <td className={cx('stickyCol', 'stickyCol1', 'stt')}>{idx + 1}</td>
                                                    <td className={cx('stickyCol', 'stickyCol2', 'sku')}>
                                                        <span>{it.productID ?? ''}</span>
                                                    </td>
                                                    <td className={cx('stickyCol', 'stickyCol3', 'name')}>
                                                        <span>{it.productName ?? ''}</span>
                                                    </td>
                                                    <td className={cx('unit')}>
                                                        <span>{it.unit.unitName ?? ''}</span>
                                                    </td>
                                                    <td className={cx('number')}>
                                                        <span>{it.requestAmount ?? ''}</span>
                                                    </td>
                                                    <td className={cx('number')}>
                                                        <input
                                                            type="number"
                                                            placeholder="Nhập số lượng"
                                                            min={1}
                                                            value={it.realAmount}
                                                            onChange={(e) => {
                                                                const raw = e.target.value.trim();
                                                                checkRealAmount(raw, it, idx);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key == '-') e.preventDefault();
                                                            }}
                                                            className={cxGlb('readOnly')}
                                                        />
                                                    </td>
                                                    <td className={cx('number')}>
                                                        <input
                                                            type="number"
                                                            placeholder="Nhập số lượng"
                                                            min={0}
                                                            value={it.errorAmount}
                                                            readOnly
                                                            className={cxGlb('readOnly')}
                                                        />
                                                    </td>
                                                    <td className={cx('note')}>
                                                        <input
                                                            type="text"
                                                            placeholder="Nhập lý do"
                                                            value={it.reasonError ?? ''}
                                                            onChange={(e) => {
                                                                it.reasonError = e.target.value;
                                                                updateCellData(idx, it);
                                                            }}
                                                            disabled={
                                                                it.realAmount === it.requestAmount || !it.errorAmount
                                                            }
                                                        />
                                                    </td>
                                                    <td className={cx('lot')}>
                                                        <p>{it.batchID ?? ''}</p>
                                                    </td>
                                                    <td className={cx('date')}>
                                                        <input
                                                            type="date"
                                                            placeholder="Nhập ngày sản xuất"
                                                            value={it.manufactureDate ?? ''}
                                                            onChange={(e) => {
                                                                it.manufactureDate = e.target.value;
                                                                updateCellData(idx, it);
                                                            }}
                                                            max={new Date().toISOString().split('T')[0]}
                                                        />
                                                    </td>
                                                    <td className={cx('date')}>
                                                        <input
                                                            type="date"
                                                            placeholder="Nhập hạn sử dụng"
                                                            value={it.expiryDate ?? ''}
                                                            onChange={(e) => {
                                                                it.expiryDate = e.target.value;
                                                                updateCellData(idx, it);
                                                            }}
                                                            min={new Date().toISOString().split('T')[0]}
                                                        />
                                                    </td>
                                                    <td className={cx('sku_sup')}>
                                                        <Select
                                                            showSearch
                                                            style={{
                                                                width: '100%',
                                                                height: '35px',
                                                                borderRadius: '10px',
                                                            }}
                                                            placeholder="Chọn nhà cung cấp"
                                                            optionFilterProp="label"
                                                            filterSort={(optionA, optionB) =>
                                                                (optionA?.label ?? '')
                                                                    .toLowerCase()
                                                                    .localeCompare((optionB?.label ?? '').toLowerCase())
                                                            }
                                                            value={it.supplierID || null}
                                                            onChange={(value) => {
                                                                const selected = suppliers.find(
                                                                    (s) => s.supplierID === value,
                                                                );
                                                                it.supplierID = value;
                                                                it.supplierName = selected ? selected.supplierName : '';
                                                                updateCellData(idx, it);
                                                            }}
                                                            options={suppliers.map((s) => ({
                                                                value: s.supplierID,
                                                                label: `${s.supplierName} - ${s.supplierID}`,
                                                            }))}
                                                            className={cx('custom-select')}
                                                            popupClassName={cx('custom-dropdown')}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
            {showPopupConfirmSaveMissing && (
                <PopupMessage>
                    <div className={cx('wrapper-message')}>
                        <h1>Thông báo</h1>
                        <p className={cx('des')}>
                            Phiếu nhập bị thiếu sản phẩm. Bạn có muốn tạo phiếu nhập thiếu không?
                        </p>
                        <div className={cx('action-confirm')}>
                            <Button
                                primary
                                onClick={() => {
                                    handleSaveReceiptMissing();
                                    setShowPopConfirmSaveMissing(false);
                                }}
                            >
                                <span>Có</span>
                            </Button>
                            <Button outline onClick={() => setShowPopConfirmSaveMissing(false)}>
                                <span>Không</span>
                            </Button>
                        </div>
                    </div>
                </PopupMessage>
            )}
        </Modal>
    );
};

export default CreateImportReceiptDialog;
