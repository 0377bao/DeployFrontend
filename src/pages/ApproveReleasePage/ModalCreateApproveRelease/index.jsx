import React, { useState, useEffect, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import classNames from 'classnames/bind';
import styles from './ModalCreateApproveRelease.module.scss';
import { Modal, Button, MyTable } from '../../../components';
import { useSelector } from 'react-redux';
import { generateCode } from '../../../utils/generate';
import { getProductById, getProductCanExportById } from '../../../services/product.service';
import toast from 'react-hot-toast';
import { styleMessage } from '../../../constants';
import { getAllCustomer, getAllCustomerNotPagination } from '../../../services/customer.service';
import { Select } from 'antd';
import { createOrderReleaseProposal, updateStatusOrderReleaseProposal } from '../../../services/proposal.service';
import globalStyles from '@/components/GlobalStyle/GlobalStyle.module.scss';
import { authIsAdmin } from '../../../common';
import { getUnitsByProduct } from '../../../services/unit.service';

const cx = classNames.bind(styles);
const cxGlb = classNames.bind(globalStyles);

const currency = (n) => (isNaN(n) ? '0' : new Intl.NumberFormat('vi-VN').format(Number(n)));
const emptyItem = () => ({ sku: '', name: '', qty: 1, note: '', baseUnitName: '' });

const ModalCreateApproveRelease = ({
    isOpen,
    onClose,
    initialData = null,
    typeDetail = false,
    refetchData = () => {},
}) => {
    const warehouse = useSelector((s) => s.WareHouseSlice?.warehouse) || 'Thủ Đức';
    const currentUser = useSelector((s) => s.AuthSlice?.user) || 'Đạt';
    const [productIDSearch, setProductIDSearch] = useState(null);
    const [productListExported, setProductListExported] = useState([]);
    const [proposalListItem, setProposalListItem] = useState(
        initialData ? initialData.orderReleaseProposalDetails : [],
    );

    console.log('initialData', initialData);

    const [unitList, setUnitList] = useState([]);
    const totals = useMemo(() => {
        if (productListExported.length === 0 && proposalListItem.length === 0) return { unique: 0, totalQty: 0 };
        if (productListExported.length > 0) {
            return { unique: productListExported.length, totalQty: productListExported.reduce((a, b) => a + b.qty, 0) };
        }
        return {
            unique: proposalListItem.length,
            totalQty: proposalListItem.reduce((a, b) => a + b.amountRequiredExport, 0),
        };
    }, [productListExported, proposalListItem]);

    const [customerOptions, setCustomerOptions] = useState([]);

    useEffect(() => {
        const fetchCustomers = async () => {
            const res = await getAllCustomerNotPagination();
            if (Array.isArray(res)) {
                setCustomerOptions(
                    res.map((c) => ({
                        value: c.customerID,
                        label: `${c.customerID} - ${c.customerName}`,
                        customerName: c.customerName,
                    })),
                );
            }
            console.log('customerOptions', customerOptions);
        };
        fetchCustomers();
    }, []);

    const [form, setForm] = useState({
        receiptCode: '',
        createdDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
        warehouse: warehouse?.warehouseName || '',
        createdBy: currentUser.empName,
        customerID: '',
        customerName: '',
        note: '',
    });

    const handleReset = () => {
        setForm({
            receiptCode: '',
            createdDate: new Date().toLocaleDateString('en-CA'),
            warehouse: warehouse?.warehouseName || '',
            createdBy: currentUser.empName,
            customerID: '',
            customerName: '',
            note: '',
        });
        setProductListExported([]);
    };

    const handleSearchProduct = async (productID) => {
        if (!productID) return;
        if (typeDetail) {
            if (productID == '') setProposalListItem(initialData.orderReleaseProposalDetails);
            else {
                console.log(proposalListItem);
                const productItemSearch = proposalListItem.filter(
                    (p) => p.productID.toLowerCase() === productID.toLowerCase(),
                );
                setProposalListItem(productItemSearch);
            }
        } else {
            try {
                const res = await getProductCanExportById(productID, warehouse.warehouseID);
                const resUnitProduct = await getUnitsByProduct(productID);

                if (res.data.status != 'OK') setProductListExported([]);
                if (resUnitProduct.data.status === 'OK' && resUnitProduct.data.length === 0) {
                    toast.error('Sản phẩm hiện đang hết hàng', styleMessage);
                    return;
                }
                const newItem = emptyItem();
                newItem.sku = res.data.product.productID || '';
                newItem.name = res.data.product.productName || '';

                if (!unitList.find((u) => u.productID === productID)) {
                    setUnitList((prev) => [
                        ...prev,
                        {
                            productID: res.data.product.productID,
                            unitList: resUnitProduct.data.data,
                        },
                    ]);
                }
                const formatProduct = [...productListExported, newItem];
                setProductListExported(formatProduct);
            } catch (err) {
                console.error(err);
            } finally {
                setProductIDSearch('');
            }
        }
    };

    const removeRow = (idx) => setProductListExported((prev) => prev.filter((_, i) => i !== idx));
    const updateCell = (idx, key, val) =>
        setProductListExported((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));

    const handleApproveProposal = async (proposalID, status) => {
        try {
            const resultApprove = await updateStatusOrderReleaseProposal({
                orderReleaseProposalID: proposalID,
                employeeIDApproval: currentUser.empId,
                status: status,
            });
            if (resultApprove.data?.status === 'OK') {
                toast.success('Cập nhật trạng thái phiếu đề xuất xuất kho thành công', styleMessage);
                onClose();
                refetchData();
            } else return;
        } catch (err) {
            console.log(err);
            toast.error(err.message, styleMessage);
            return;
        }
    };

    const handleBlurQuantity = (e, productName) => {
        const val = Number(e.target.value);
        if (!Number.isInteger(val) || val <= 0) {
            toast.error(`Số lượng xuất của sản phẩm ${productName || ''} phải là số nguyên dương`, styleMessage);
            setTimeout(() => {
                e.target.focus();
            }, 0);
        }
    };

    const handleShowProposalDetail = (items) => {
        if (items) {
            return items.map((it, idx) => {
                return (
                    <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>
                            <input
                                value={typeDetail ? it.product?.productID || '' : it.sku || ''}
                                onChange={(e) => updateCell(idx, 'sku', e.target.value)}
                                placeholder="Mã sản phẩm"
                                readOnly={typeDetail}
                                className={cxGlb('readOnly')}
                            />
                        </td>
                        <td>
                            <input
                                value={typeDetail ? it.product?.productName || '' : it.name || ''}
                                onChange={(e) => updateCell(idx, 'name', e.target.value)}
                                readOnly
                                placeholder="Tên sản phẩm"
                                className={cxGlb('readOnly')}
                            />
                        </td>
                        <td>
                            {typeDetail ? (
                                <input value={it.unit?.unitName} readOnly className={cxGlb('readOnly')} />
                            ) : (
                                <select value={it.unit} onChange={(e) => updateCell(idx, 'unit', e.target.value)}>
                                    <option value="">-- Chọn đơn vị --</option>
                                    {unitList
                                        .find((u) => u.productID === it.sku)
                                        ?.unitList.map((unit, idx) => (
                                            <option key={idx} value={unit.unitID}>
                                                {unit.unitName}
                                            </option>
                                        ))}
                                </select>
                            )}
                        </td>
                        <td>
                            <input
                                value={it.amountRequiredExport}
                                onChange={(e) => updateCell(idx, 'amountRequiredExport', e.target.value)}
                                onBlur={(e) => handleBlurQuantity(e, typeDetail ? it.product?.productName : it.name)}
                                readOnly={typeDetail}
                                min={1}
                                type="number"
                                placeholder="Số lượng xuất"
                            />
                        </td>
                        <td>
                            <input
                                value={typeDetail ? it.note || 'Không có ghi chú' : it.note || ''}
                                onChange={(e) => updateCell(idx, 'note', e.target.value)}
                                placeholder="Ghi chú"
                                className={cx(typeDetail ? 'readOnly' : '')}
                            />
                        </td>
                        <td>
                            {!typeDetail && (
                                <button className={cx('iconBtn')} onClick={() => removeRow(idx)} title="Xóa dòng">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </td>
                    </tr>
                );
            });
        }
    };

    // submit release order proposal
    const handleSubmit = async () => {
        if (!form.receiptCode) {
            toast.error('Vui lòng tạo mã phiếu đề xuất xuất kho', styleMessage);
            return;
        }
        if (!form.customerID || !form.customerName) {
            toast.error('Vui lòng nhập mã khách hàng và tìm kiếm tên khách hàng', styleMessage);
            return;
        }
        if (productListExported.length === 0) {
            toast.error('Vui lòng thêm sản phẩm vào danh sách đề xuất xuất kho', styleMessage);
            return;
        } else {
            productListExported.forEach((it) => {
                if (!it.qty) {
                    toast.error(`Vui lòng nhập số lượng xuất của sản phẩm ${it.name}`, styleMessage);
                    return;
                }
            });
        }

        // Validate unit
        const missingUnitItems = productListExported.filter((item) => !item.unit);
        if (missingUnitItems.length > 0) {
            const names = missingUnitItems.map((i) => i.name).join(', ');
            toast.error(`Vui lòng chọn đơn vị tính cho các sản phẩm: ${names}`, styleMessage);
            return;
        }

        // Validate quantity
        const invalidQtyItems = productListExported.filter((item) => {
            const qty = Number(item.amountRequiredExport);
            return !Number.isInteger(qty) || qty <= 0;
        });
        if (invalidQtyItems.length > 0) {
            const names = invalidQtyItems.map((i) => i.name).join(', ');
            toast.error(`Số lượng xuất của sản phẩm: ${names} không hợp lệ`, styleMessage);
            return;
        }

        // Validate duplicate
        const seen = new Set();
        const duplicates = [];
        productListExported.forEach((item) => {
            const key = `${item.sku}-${item.unit}`;
            if (seen.has(key)) {
                duplicates.push(item);
            } else {
                seen.add(key);
            }
        });

        if (duplicates.length > 0) {
            const names = duplicates.map((i) => i.name).join(', ');
            toast.error(`Các sản phẩm sau bị trùng đơn vị tính: ${names}`, styleMessage);
            return;
        }

        try {
            const formatData = {
                orderReleaseProposalID: form.receiptCode,
                warehouseID: warehouse.warehouseID,
                employeeIDCreate: currentUser.empId,
                customerID: form.customerID,
                note: form.note,
                orderReleaseProposalDetails: productListExported.map((it) => ({
                    productID: it.sku,
                    productName: it.name,
                    unitID: it.unit,
                    quantity: it.amountRequiredExport,
                    note: it.note,
                    amountRequiredExport: it.amountRequiredExport,
                })),
                status: 'PENDING',
            };
            const res = await createOrderReleaseProposal(formatData);
            console.log('data submit', res);
            if (res.data.status === 'OK') {
                toast.success('Tạo phiếu đề xuất xuất kho thành công', styleMessage);
                onClose();
                handleReset();
                refetchData();
            }
        } catch (err) {
            return;
        }
    };

    useEffect(() => {
        if (!initialData) return;
        setProposalListItem(initialData.orderReleaseProposalDetails);
    }, [initialData]);

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={false}>
            <div className={cx('page')}>
                {/* Header */}
                <header className={cx('header')}>
                    <div className={cx('headerLeft')}>
                        <h1 className={cx('title')}>Phiếu đề xuất xuất kho</h1>
                    </div>
                    {!typeDetail && (
                        <div className={cx('headerActions')}>
                            <Button outline borderRadiusMedium onClick={handleReset}>
                                <span>Làm mới</span>
                            </Button>
                            <Button success borderRadiusMedium onClick={handleSubmit}>
                                Gửi phê duyệt
                            </Button>
                        </div>
                    )}
                    {typeDetail && initialData?.status === 'PENDING' && authIsAdmin(currentUser) && (
                        <div>
                            <Button
                                success
                                onClick={() => handleApproveProposal(initialData.orderReleaseProposalID, 'COMPLETED')}
                            >
                                <span>Chấp nhận</span>
                            </Button>
                            <Button
                                error
                                onClick={() => handleApproveProposal(initialData.orderReleaseProposalID, 'REFUSE')}
                            >
                                <span>Từ chối</span>
                            </Button>
                        </div>
                    )}
                </header>

                <main className={cx('container')}>
                    {/* Thông tin chung */}
                    <section className={cx('card')}>
                        <h2 className={cx('cardTitle')}>Thông tin chung</h2>
                        <div className={cx('grid4')}>
                            <div className={cx('field')}>
                                <label>Mã phiếu</label>
                                <div className={cx('field-control')}>
                                    <input
                                        className={cx(typeDetail ? 'readOnly' : '')}
                                        placeholder="Tạo mã phiếu"
                                        readOnly={true}
                                        value={
                                            typeDetail
                                                ? initialData?.orderReleaseProposalID || ''
                                                : form.receiptCode || ''
                                        }
                                        onChange={(e) => setForm((prev) => ({ ...prev, receiptCode: e.target.value }))}
                                    />
                                    {!typeDetail && (
                                        <Button
                                            small
                                            primary
                                            borderRadiusSmall
                                            onClick={() =>
                                                setForm((prev) => ({ ...prev, receiptCode: generateCode('PDX-XK-') }))
                                            }
                                        >
                                            <span>Tạo mã phiếu</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className={cx('field')}>
                                <label>Ngày tạo phiếu</label>
                                <input
                                    className={cxGlb('readOnly')}
                                    type="date"
                                    value={typeDetail ? initialData?.createdAt?.split('T')[0] : form.createdDate}
                                    readOnly
                                />
                            </div>
                            <div className={cx('field')}>
                                <label>Kho xuất</label>
                                <input
                                    className={cxGlb('readOnly')}
                                    value={
                                        typeDetail
                                            ? initialData?.warehouse?.warehouseName
                                            : warehouse.warehouseName || ''
                                    }
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className={cx('second-grid')}>
                            <div className={cx('field')}>
                                <label>Người lập phiếu</label>
                                <input
                                    className={cxGlb('readOnly')}
                                    value={
                                        typeDetail
                                            ? initialData?.creator?.employeeName || ''
                                            : currentUser.empName || ''
                                    }
                                    readOnly
                                />
                            </div>
                            <div className={cx('field')}>
                                <label>Chọn khách hàng</label>
                                <Select
                                    style={{ width: '100%', height: '35px', borderRadius: '10px' }}
                                    showSearch
                                    className={cx(typeDetail ? 'readOnly' : '', 'custom-select')}
                                    popupClassName={cx('custom-dropdown')}
                                    value={
                                        typeDetail
                                            ? initialData?.customer?.customerID || ''
                                            : form.customerID || undefined
                                    }
                                    disabled={typeDetail}
                                    placeholder="Nhập hoặc chọn mã khách hàng"
                                    optionFilterProp="children"
                                    onChange={(value, option) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            customerID: value,
                                            customerName: option.customerName,
                                        }));
                                    }}
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={customerOptions}
                                />
                            </div>
                            {/* <div className={cx('field')}>
                                <label>Tên khách hàng</label>
                                <input
                                    className={cxGlb('readOnly')}
                                    value={
                                        typeDetail ? initialData?.customer?.customerName || '' : form.customerName || ''
                                    }
                                    readOnly={typeDetail}
                                    placeholder="Tên khách hàng"
                                />
                            </div> */}
                        </div>
                        <div className={cx('field', 'colSpan4')}>
                            <label>Ghi chú</label>
                            <textarea
                                rows={3}
                                placeholder="Nhập bổ sung, trả hàng NCC, nhập khuyến mãi..."
                                value={typeDetail ? initialData?.note || 'Không có ghi chú' : form.note}
                                onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                                readOnly={typeDetail}
                                className={cx(typeDetail ? 'readOnly' : '')}
                            />
                        </div>
                    </section>

                    {/* Danh sách hàng hóa */}
                    <section className={cx('card')}>
                        <div className={cx('cardHeader')}>
                            <h2 className={cx('cardTitle')}>Danh sách hàng hóa đề xuất xuất</h2>
                        </div>

                        <div className={cx('search')}>
                            <div className={cx('input')}>
                                <input
                                    placeholder="Nhập mã sản phẩm"
                                    value={productIDSearch}
                                    onChange={(e) => setProductIDSearch(e.target.value)}
                                />
                            </div>
                            <Button
                                primary
                                medium
                                borderRadiusSmall
                                className={cx('btn-filter')}
                                onClick={() => handleSearchProduct(productIDSearch)}
                            >
                                Tìm kiếm
                            </Button>
                        </div>

                        <div className={cx('tableWrap')}>
                            <table className={cx('table')}>
                                <thead>
                                    <tr>
                                        <th className={cx('stt')}>STT</th>
                                        <th className={cx('productID')}>Mã SP</th>
                                        <th className={cx('productName')}>Tên SP</th>
                                        <th className={cx('unitName')}>Đơn vị xuất</th>
                                        <th className={cx('amount')}>Số lượng xuất</th>
                                        <th className={cx('note')}>Ghi chú</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {typeDetail
                                        ? handleShowProposalDetail(proposalListItem)
                                        : handleShowProposalDetail(productListExported)}
                                </tbody>
                            </table>
                        </div>

                        {/* Tổng hợp */}
                        <div className={cx('summary')}>
                            <div>
                                <span className={cx('muted')}>Số mặt hàng: </span>
                                <b>{totals.unique}</b>
                            </div>
                            <div>
                                <span className={cx('muted')}>Tổng số lượng: </span>
                                <b>{currency(totals.totalQty)}</b>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className={cx('footer')}>
                    <p>© {new Date().getFullYear()} Kho Hàng • Phiếu đề xuất nhập kho</p>
                </footer>
            </div>
        </Modal>
    );
};

export default ModalCreateApproveRelease;
