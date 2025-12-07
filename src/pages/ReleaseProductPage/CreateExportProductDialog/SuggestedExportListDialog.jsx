import React from 'react';
import classNames from 'classnames/bind';
import styles from './SuggestedExportListDialog.module.scss';
import { Modal, Button } from '../../../components';
import { formatDate } from '../../../utils/formatDate';
import { CheckCircle, X, Box, Calendar, Layers, Package } from 'lucide-react';

const cx = classNames.bind(styles);

const SuggestedExportListDialog = ({ isOpen, onClose, data, onConfirm, type }) => {
    if (!data || data.length === 0) return null;

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={false}>
            <div className={cx('wrapper')}>
                <h2 className={cx('title')}>Gợi ý xuất hàng</h2>

                <div className={cx('list-container')}>
                    {data.map((product, index) => (
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
                                    <span className={cx('meta-label')}>Yêu cầu:</span>
                                    <span className={cx('meta-value')}>
                                        {product.quantityRequired} {product.unitName}
                                    </span>
                                </div>
                            </div>

                            <table className={cx('batch-table')}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '30%' }}>Thông tin lô</th>
                                        <th style={{ width: '55%' }}>Chi tiết hộp</th>
                                        <th style={{ width: '15%', textAlign: 'right' }}>Số lượng xuất</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {product.batches.map((batch, bIndex) => (
                                        <tr key={bIndex}>
                                            <td>
                                                <div className={cx('batch-info-cell')}>
                                                    <span className={cx('batch-id')}>
                                                        <Layers size={16} />
                                                        {batch.batchID}
                                                    </span>
                                                    {type === 'FEFO' ? (
                                                        <span className={cx('batch-date')}>
                                                            <Calendar size={14} />
                                                            HSD: {formatDate(batch.expiryDate)}
                                                        </span>
                                                    ) : (
                                                        <span className={cx('batch-date-import')}>
                                                            <Calendar size={14} />
                                                            Nhập: {formatDate(batch.createdAt)}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                {batch.boxes && batch.boxes.length > 0 ? (
                                                    <div className={cx('box-list')}>
                                                        {batch.boxes.map((box, boxIndex) => (
                                                            <div key={boxIndex} className={cx('box-tag')}>
                                                                <Box size={14} />
                                                                <span>{box.boxID}</span>
                                                                <span className={cx('box-qty')}>x{box.quantity}</span>
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
                                                <span className={cx('qty-export')}>{batch.quantityExport}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>

                <div className={cx('action-row')}>
                    <Button outline borderRadiusMedium onClick={onClose} leftIcon={<X size={18} />}>
                        Đóng
                    </Button>
                    <Button success borderRadiusMedium onClick={onConfirm} leftIcon={<CheckCircle size={18} />}>
                        Xác nhận và lưu phiếu
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default SuggestedExportListDialog;
