import React from 'react';
import classNames from 'classnames/bind';
import styles from './ExportInfoSheet.module.scss';
import { generateCode } from '../../../../utils/generate';
import { Button } from '@/components';
import globalStyles from '@/components/GlobalStyle/GlobalStyle.module.scss';

const cxGlb = classNames.bind(globalStyles);
const cx = classNames.bind(styles);

const ExportInfoSheet = ({ formData, setFormData, className }) => {
    return (
        <section className={cx('info-sheet', className)}>
            <h2 className={cx('content-header')}>Thông tin chung</h2>
            <div className={cx('grid4')}>
                <div className={cx('field')}>
                    <label>Mã phiếu</label>
                    <div className={cx('field-control')}>
                        <input
                            type="text"
                            placeholder="Nhập mã phiếu"
                            value={formData.receiptCode || ''}
                            onChange={(e) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    receiptCode: e.target.value,
                                }));
                            }}
                        />
                        <Button
                            primary
                            small
                            borderRadiusMedium
                            onClick={() => {
                                setFormData((prev) => ({
                                    ...prev,
                                    receiptCode: `${generateCode('PX-')}`,
                                }));
                            }}
                        >
                            <span>Tạo mã phiếu</span>
                        </Button>
                    </div>
                </div>
                <div className={cx('field')}>
                    <label>Ngày lập</label>
                    <input
                        type="date"
                        readOnly
                        value={new Date().toISOString().split('T')[0]}
                        className={cxGlb('readOnly')}
                    />
                </div>
                <div className={cx('field')}>
                    <label>Kho</label>
                    <input type="text" readOnly value={formData.warehouse || ''} className={cxGlb('readOnly')} />
                </div>
                <div className={cx('field')}>
                    <label>Người duyệt</label>
                    <input type="text" value={formData?.approver || ''} readOnly className={cxGlb('readOnly')} />
                </div>
            </div>

            <div className={cx('grid4')}>
                <div className={cx('field')}>
                    <label>Người lập phiếu</label>
                    <input type="text" value={formData.createdBy} readOnly className={cxGlb('readOnly')} />
                </div>
                <div className={cx('field')}>
                    <label>Mã khách hàng</label>
                    <input type="text" value={formData.customerID} readOnly className={cxGlb('readOnly')} />
                </div>
                <div className={cx('field')}>
                    <label>Tên khách hàng</label>
                    <input type="text" value={formData.customerName || ''} readOnly className={cxGlb('readOnly')} />
                </div>
                <div className={cx('field')}>
                    <label>Mã phiếu đề xuất</label>
                    <input
                        type="text"
                        value={formData.orderReleaseProposalID || ''}
                        readOnly
                        className={cxGlb('readOnly')}
                    />
                </div>
            </div>

            <div className={cx('field', 'colSpan4')}>
                <label>Ghi chú</label>
                <textarea
                    rows={3}
                    placeholder="Nhập ghi chú..."
                    value={formData.note}
                    onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
                />
            </div>
        </section>
    );
};

export default ExportInfoSheet;
