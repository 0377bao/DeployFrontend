import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModalOrderReleaseDetail.module.scss';
import { Modal } from '../../../components';
import globalStyle from '@/components/GlobalStyle/GlobalStyle.module.scss';
import parseToken from '../../../utils/parseToken';
import { Package, Layers, Calendar, Box, Printer as PrinterIcon } from 'lucide-react';
import { formatDate } from '../../../utils/formatDate';
import { QRCode } from 'antd';
import Printer from '../../../components/Printer';

const cx = classNames.bind(styles);
const cxGlb = classNames.bind(globalStyle);

const OrderReleaseTemplate = ({ orderReleaseItem, warehouse, orderDetail }) => {
    return (
        <div className={cx('modal-order-release-detail')}>
            <section className={cx('order-release-normal-info')}>
                <div className={cx('info-left')}>
                    <h1 className={cx('order-release-title')}>Phiếu xuất kho</h1>
                    <div className={cx('info-grid', orderReleaseItem?.status === 'COMPLETED' ? 'grid-4' : 'grid-3')}>
                        <div className={cx('grid-item')}>
                            <span>Mã phiếu</span>
                            <input type="text" readOnly value={orderReleaseItem?.orderReleaseID || ''} />
                        </div>
                        <div className={cx('grid-item')}>
                            <span>Ngày lập</span>
                            <input type="date" readOnly value={orderReleaseItem?.createdAt?.split('T')[0] || ''} />
                        </div>
                        {orderReleaseItem?.status === 'COMPLETED' && (
                            <div className={cx('grid-item')}>
                                <span>Ngày xuất</span>
                                <input type="date" readOnly value={orderReleaseItem?.updatedAt?.split('T')[0] || ''} />
                            </div>
                        )}
                        <div className={cx('grid-item')}>
                            <span>Kho</span>
                            <input type="text" readOnly value={warehouse.warehouseName} />
                        </div>
                        <div className={cx('grid-item')}>
                            <span>Người lập phiếu</span>
                            <input type="text" readOnly value={orderReleaseItem?.employees?.employeeName || ''} />
                        </div>
                        <div className={cx('grid-item')}>
                            <span>Mã khách hàng</span>
                            <input type="text" readOnly value={orderReleaseItem?.customers?.customerID || ''} />
                        </div>
                        <div className={cx('grid-item', orderReleaseItem?.status === 'COMPLETED' && 'col-span-2')}>
                            <span>Tên khách hàng</span>
                            <input type="text" readOnly value={orderReleaseItem?.customers?.customerName || ''} />
                        </div>
                    </div>
                </div>
                <div className={cx('info-right')}>
                    <div className={cx('qr-code')}>
                        <QRCode value={orderReleaseItem?.orderReleaseID || 'N/A'} size={120} bordered={false} />
                    </div>
                </div>
            </section>

            <section className={cx('order-release-batch-detail')}>
                <p className={cx('order-release-sub-title')}>Chi tiết xuất kho</p>

                {orderDetail.map((product, index) => (
                    <div key={index} className={cx('product-card')}>
                        <div className={cx('product-header')}>
                            <div className={cx('product-info')}>
                                <span className={cx('product-name')}>
                                    <Package size={20} color="#4f46e5" />
                                    {product.productName}
                                </span>
                                <span className={cx('product-id')}>{product.productID}</span>
                            </div>
                            <div className={cx('product-meta')}>
                                <span className={cx('meta-label')}>Tổng xuất:</span>
                                <span className={cx('meta-value')}>
                                    {product.quantityExported} {product.unitName}
                                </span>
                            </div>
                        </div>

                        <table className={cx('batch-table')}>
                            <thead>
                                <tr>
                                    <th style={{ width: '30%' }}>Thông tin lô</th>
                                    <th style={{ width: '55%' }}>Chi tiết hộp</th>
                                    <th style={{ width: '15%', textAlign: 'right' }}>Số lượng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {product.batchOfProductExported.map((batchDetail, bIndex) => (
                                    <tr key={bIndex}>
                                        <td>
                                            <div className={cx('batch-info-cell')}>
                                                <span className={cx('batch-id')}>
                                                    <Layers size={16} />
                                                    {batchDetail.batch.batchID}
                                                </span>
                                                <span className={cx('batch-date')}>
                                                    <Calendar size={14} />
                                                    HSD: {formatDate(batchDetail.batch.expiryDate)}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            {batchDetail.orderReleaseBatchBoxDetails &&
                                            batchDetail.orderReleaseBatchBoxDetails.length > 0 ? (
                                                <div className={cx('box-list')}>
                                                    {batchDetail.orderReleaseBatchBoxDetails.map((box, boxIndex) => (
                                                        <div key={boxIndex} className={cx('box-tag')}>
                                                            <Box size={14} />
                                                            <span>{box.boxID}</span>
                                                            <span className={cx('box-qty')}>
                                                                x{box.quantityExported}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                                                    Không có hộp
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={cx('qty-export')}>{batchDetail.quantityExported}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </section>
        </div>
    );
};

const ModalOrderReleaseDetail = ({ isOpen, onClose, orderReleaseItem }) => {
    const [orderDetail, setOrderDetail] = useState([]);
    const warehouse = parseToken('warehouse');

    useEffect(() => {
        if (!orderReleaseItem || !orderReleaseItem.orderReleaseDetails) return;
        const groupDetail = []; // nhóm chi tiết sản phẩm trùng

        orderReleaseItem.orderReleaseDetails.forEach((item) => {
            const product = item.batch.product;
            const unitName = item.batch.unit.unitName;
            const existProduct = groupDetail.find(
                (prod) => prod.productID === product.productID && prod.unitName === unitName,
            );
            if (existProduct) {
                existProduct.quantityExported += item.quantityExported;
                existProduct.batchOfProductExported.push(item);
            } else {
                groupDetail.push({
                    productID: product.productID,
                    productName: product.productName,
                    unitName: unitName,
                    quantityExported: item.quantityExported,
                    batchOfProductExported: [item],
                });
            }
        });

        setOrderDetail(groupDetail);
    }, [orderReleaseItem]);

    const renderPrintButton = (key) => (
        <Printer
            key={key}
            buttonLabel="In phiếu xuất kho"
            Icon={<PrinterIcon size={18} />}
            propsButton={{
                primary: true,
                small: true,
                borderRadiusSmall: true,
                style: { marginRight: '12px' },
            }}
        >
            <OrderReleaseTemplate orderReleaseItem={orderReleaseItem} warehouse={warehouse} orderDetail={orderDetail} />
        </Printer>
    );

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={true} arrButton={[renderPrintButton]}>
            <OrderReleaseTemplate orderReleaseItem={orderReleaseItem} warehouse={warehouse} orderDetail={orderDetail} />
        </Modal>
    );
};

export default ModalOrderReleaseDetail;
