import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './CreateImportReceiptMissingDialog.module.scss';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { generateCode } from '../../../utils/generate';
import { styleMessage } from '../../../constants';
import { Modal, Button } from '../../../components';
import { saveReceipt, validatePayloadCreateReceiptMissing } from '../../../services/order.service';

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
});

const CreateImportReceiptMissingDialog = ({ orderPurchaseMissing, isOpen, onClose, handleFetchOrderMissing }) => {
    console.log(orderPurchaseMissing);
    const currentUser = useSelector((state) => state.AuthSlice.user);
    const warehouse = useSelector((state) => state.WareHouseSlice.warehouse);
    const [productListImport, setProductListImport] = useState([]);
    const [orderPurchase, setOrderPurchase] = useState({
        code: '',
        publishedDate: new Date().toISOString().slice(0, 10),
        warehouseName: warehouse.warehouseName,
        warehouseID: warehouse.warehouseID,
        creator: currentUser.empName || '',
        proposalID: orderPurchaseMissing?.orderPurchaseID || '',
        note: orderPurchaseMissing?.note || '',
    });

    const handleResetField = () => {
        const updateList = productListImport.map((it) => ({
            ...it,
            batchID: '',
            manufactureDate: '',
            expiryDate: '',
            realAmount: '',
        }));
        setOrderPurchase((prev) => ({ ...prev, note: '' }));
        setProductListImport(updateList);
    };

    const handleSaveReceiptMissing = async () => {
        const payload = {
            orderPurchaseID: orderPurchase.code,
            employeeID: currentUser.empID,
            warehouseID: warehouse.warehouseID,
            proposalID: orderPurchaseMissing?.orderPurchase?.proposalID,
            status: 'COMPLETED',
            type: 'SUPPLEMENT',

            originalOrderPurchaseID: orderPurchaseMissing?.orderPurchaseID || '',
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
            })),
        };
        if (!validatePayloadCreateReceiptMissing(payload)) return;
        try {
            const res = await saveReceipt(payload);
            if (res) {
                toast.success(res.data.message, styleMessage);
                handleFetchOrderMissing();
                onClose();
            }
        } catch (err) {
            console.log(err);
            toast.error(err.response.data.message, styleMessage);
            return;
        }
    };

    const updateCellData = (idx, item) => {
        const updateList = productListImport.map((it, index) => (index == idx ? item : it));
        setProductListImport(updateList);
    };

    useEffect(() => {
        if (!orderPurchaseMissing) return;
        const listProduct = orderPurchaseMissing?.orderPurchaseMissingDetails?.map((it) => {
            const productItem = emptyItem();
            productItem.productID = it?.orderPurchaseDetail?.batch?.product?.productID;
            productItem.productName = it?.orderPurchaseDetail?.batch?.product?.productName;
            productItem.unit = {
                unitID: it?.orderPurchaseDetail?.batch?.unitID,
                unitName: it?.orderPurchaseDetail?.batch?.unit?.unitName,
            };
            productItem.requestAmount = it?.missingQuantity;
            productItem.realAmount = it?.missingQuantity;
            productItem.supplierID = it?.orderPurchaseDetail?.batch?.supplierID;
            productItem.supplierName = it?.orderPurchaseDetail?.batch?.supplier?.supplierName;
            productItem.batchID = it?.batch?.batchID;
            return productItem;
        });
        setProductListImport(listProduct);
    }, [orderPurchaseMissing]);

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose}>
            <div className={cx('wrapper-import-receipt-missing')}>
                <main className={cx('container-receive-product')}>
                    <header className={cx('header')}>
                        <div className={cx('headerLeft')}>
                            <h1 className={cx('title')}>Phiếu nhập kho bổ sung</h1>
                        </div>
                        <div className={cx('headerActions')}>
                            <Button outline borderRadiusMedium onClick={handleResetField}>
                                <span>Làm mới</span>
                            </Button>
                            <Button success borderRadiusMedium onClick={handleSaveReceiptMissing}>
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
                                    <label>Mã phiếu nhập bổ sung</label>
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
                                    <input value={orderPurchase.publishedDate} readOnly />
                                </div>
                                <div className={cx('field')}>
                                    <label>Kho nhập</label>
                                    <input value={orderPurchase.warehouseName} readOnly />
                                </div>
                                <div className={cx('field')}>
                                    <label>Người lập phiếu</label>
                                    <input placeholder="Nguyễn Văn A" value={orderPurchase.creator} readOnly />
                                </div>

                                <div className={cx('field')}>
                                    <label>Mã phiếu nhập thiếu</label>
                                    <input value={orderPurchase.proposalID || ''} readOnly />
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
                                    />
                                </div>
                            </div>
                        </section>
                        {/** Nhập sản phẩm */}
                        <section></section>
                        {/** Table sản phẩm */}
                        <section className={cx('product-receive-list')}>
                            <h2>Danh sách nhập hàng</h2>
                            <table className={cx('table')}>
                                <thead>
                                    <tr>
                                        <th className={cx('stt')}>STT</th>
                                        <th>Mã sản phẩm</th>
                                        <th>Tên sản phẩm</th>
                                        <th>Đơn vị tính</th>
                                        <th>Mã nhà cung cấp</th>
                                        <th>Tên nhà cung cấp</th>
                                        <th>Số lượng thiếu</th>
                                        <th>Số lượng bổ sung</th>
                                        <th>Mã lô</th>
                                        <th>Ngày sản xuất</th>
                                        <th>Hạn sử dụng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderPurchaseMissing &&
                                        productListImport.length > 0 &&
                                        productListImport.map((it, idx) => {
                                            return (
                                                <tr key={idx}>
                                                    <td className={cx('stt')}>{idx + 1}</td>
                                                    <td>
                                                        <span>{it.productID ?? ''}</span>
                                                    </td>
                                                    <td>
                                                        <span>{it.productName ?? ''}</span>
                                                    </td>
                                                    <td>
                                                        <span>{it.unit.unitName ?? ''}</span>
                                                    </td>

                                                    <td>
                                                        <span>{it.supplierID ?? ''}</span>
                                                    </td>
                                                    <td>
                                                        <span>{it.supplierName ?? ''}</span>
                                                    </td>
                                                    <td>
                                                        <span>{it.requestAmount ?? ''}</span>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            placeholder="Nhập số lượng bổ sung"
                                                            min={1}
                                                            value={it.realAmount ?? ''}
                                                            onChange={(e) => {
                                                                if (e.target.value > it.requestAmount) {
                                                                    toast.error(
                                                                        'Số lượng nhập bù không được lớn hơn số lượng thiếu',
                                                                        styleMessage,
                                                                    );
                                                                    return;
                                                                }
                                                                it.realAmount = e.target.value;
                                                                updateCellData(idx, it);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (
                                                                    e.key === 'e' ||
                                                                    e.key === 'E' ||
                                                                    e.key === '+' ||
                                                                    e.key === '-'
                                                                ) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <span>{it.batchID}</span>
                                                    </td>
                                                    <td>
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
                                                    <td>
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
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </section>
                    </div>
                </main>
            </div>
        </Modal>
    );
};

export default CreateImportReceiptMissingDialog;
