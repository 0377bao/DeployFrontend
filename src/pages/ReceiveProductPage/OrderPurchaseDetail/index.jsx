import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './OrderPurchaseDetail.module.scss';
import { Modal, Button } from '../../../components';
import { generateCode } from '../../../utils/generate';
import toast from 'react-hot-toast';
import { formatTypeOrderPurchase, styleMessage } from '../../../constants';
import PopupMessage from '../../../components/PopupMessage';
import { convertDateVN } from '../../../common';

const cx = classNames.bind(styles);

const OrderPurchaseDetail = ({ orderPurchaseDetail, isOpen, onClose }) => {
    console.log(orderPurchaseDetail);

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose}>
            <div className={cx('wrapper-import-product-dialog')}>
                <main className={cx('container-receive-product')}>
                    <header className={cx('header')}>
                        <div className={cx('headerLeft')}>
                            <h1 className={cx('title')}>Phiếu nhập kho</h1>
                        </div>
                    </header>
                    <div className={cx('content-container-product')}>
                        {/** Thông tin chung của phiếu */}
                        <section className={cx('card')}>
                            <h2 className={cx('cardTitle')}>Thông tin chung</h2>
                            <div className={cx('grid3')}>
                                <div className={cx('field')}>
                                    <label>Mã phiếu nhập</label>
                                    <input
                                        placeholder="Tạo mã phiếu"
                                        value={orderPurchaseDetail.orderPurchaseID}
                                        readOnly
                                    />
                                </div>
                                <div className={cx('field')}>
                                    <label>Ngày lập</label>
                                    <input value={convertDateVN(orderPurchaseDetail.createdAt)} readOnly />
                                </div>
                                <div className={cx('field')}>
                                    <label>Kho nhập</label>
                                    <input value={orderPurchaseDetail.warehouse.warehouseName} readOnly />
                                </div>
                                <div className={cx('field')}>
                                    <label>Người lập phiếu</label>
                                    <input value={orderPurchaseDetail.employee.employeeName} readOnly />
                                </div>
                                <div className={cx('field')}>
                                    <label>Loại phiếu</label>
                                    <input value={formatTypeOrderPurchase[orderPurchaseDetail.type]} readOnly />
                                </div>

                                {orderPurchaseDetail.type === 'SUPPLEMENT' ? (
                                    <div className={cx('field')}>
                                        <label>Mã phiếu nhập gốc</label>
                                        <input value={orderPurchaseDetail.originalOrderPurchaseID || ''} readOnly />
                                    </div>
                                ) : (
                                    <div className={cx('field')}>
                                        <label>Mã phiếu đề xuất</label>
                                        <input value={orderPurchaseDetail.proposalID || ''} readOnly />
                                    </div>
                                )}

                                <div className={cx('field', 'colSpan3')}>
                                    <label>Ghi chú</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Nhập bổ sung, trả hàng NCC, nhập khuyến mãi..."
                                        value={orderPurchaseDetail.note}
                                    />
                                </div>
                            </div>
                        </section>
                        {/** Table sản phẩm */}
                        <section className={cx('product-receive-list')}>
                            <h2>Danh sách nhập hàng</h2>
                            <div className={cx('tableWrap')}>
                                <table className={cx('table', 'stickyTable')}>
                                    <thead>
                                        <tr>
                                            <th className={cx('stickyCol', 'stickyCol1', 'stt')}>STT</th>
                                            <th className={cx('stickyCol', 'stickyCol2')}>Mã sản phẩm</th>
                                            <th className={cx('stickyCol', 'stickyCol3')}>Tên sản phẩm</th>
                                            <th>Đơn vị tính</th>
                                            <th>Số lượng yêu cầu</th>
                                            <th>Số lượng thực tế</th>
                                            <th>Số lượng thiếu</th>
                                            <th>Mã lô</th>
                                            <th>Ngày sản xuất</th>
                                            <th>Hạn sử dụng</th>
                                            <th>Mã nhà cung cấp</th>
                                            <th>Tên nhà cung cấp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderPurchaseDetail?.orderPurchaseDetail?.map((it, idx) => {
                                            return (
                                                <tr key={idx}>
                                                    <td className={cx('stickyCol', 'stickyCol1', 'stt')}>{idx + 1}</td>
                                                    <td className={cx('stickyCol', 'stickyCol2')}>
                                                        <p>{it.batch.productID ?? ''}</p>
                                                    </td>
                                                    <td className={cx('stickyCol', 'stickyCol3')}>
                                                        <p>{it.batch.product.productName ?? ''}</p>
                                                    </td>
                                                    <td>
                                                        <p>{it.batch.unit.unitName ?? ''}</p>
                                                    </td>
                                                    <td>
                                                        <p>{it.requestedQuantity}</p>
                                                    </td>
                                                    <td>
                                                        <p>{it.actualQuantity}</p>
                                                    </td>
                                                    <td>
                                                        <p>{it.defectiveQuantity}</p>
                                                    </td>
                                                    <td>
                                                        <p>{it.batch.batchID ?? ''}</p>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="date"
                                                            value={new Date(it.batch.manufactureDate)
                                                                .toISOString()
                                                                .slice(0, 10)}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="date"
                                                            value={new Date(it.batch.expiryDate)
                                                                .toISOString()
                                                                .slice(0, 10)}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <p>{it.batch.supplier.supplierID ?? ''}</p>
                                                    </td>
                                                    <td>
                                                        <p>{it.batch.supplier.supplierName ?? ''}</p>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </Modal>
    );
};

export default OrderPurchaseDetail;
