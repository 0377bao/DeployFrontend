import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './CheckPage.module.scss';
import { Button, MyTable } from '../../components';

const cx = classNames.bind(styles);
const tableColumns = [
    {
        title: 'Mã hàng',
        dataIndex: 'itemCode',
        key: 'itemCode',
        width: '10%',
    },
    {
        title: 'Tên hàng',
        dataIndex: 'itemName',
        key: 'itemName',
        width: '20%',
    },
    {
        title: 'Vị trí lưu trữ',
        dataIndex: 'storageLocation',
        key: 'storageLocation',
        width: '10%',
    },
    {
        title: 'Đơn vị tính',
        dataIndex: 'unit',
        key: 'unit',
        width: '10%',
    },
    {
        title: 'Tồn hệ thống',
        dataIndex: 'systemStock',
        key: 'systemStock',
        width: '10%',
    },
    {
        title: 'Tồn thực tế',
        dataIndex: 'actualStock',
        key: 'actualStock',
        width: '10%',
    },
    {
        title: 'Chênh lệch',
        dataIndex: 'difference',
        key: 'difference',
        width: '10%',
    },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: '10%',
    },
    {
        title: 'Xóa',
        dataIndex: 'actions',
        key: 'actions',
        width: '10%',
    },
];

const CheckPage = () => {
    const [page, setPage] = useState(1);
    const [inventoryCheckId, setInventoryCheckId] = useState('');
    const [inventoryCheckDate, setInventoryCheckDate] = useState('');
    const [staffName, setStaffName] = useState('');
    const [note, setNote] = useState('');

    return (
        <div className={cx('wrapper-check')}>
            <div className={cx('info-check', 'container-check')}>
                <h4>Thông tin phiếu kiểm kê</h4>

                <div className={cx('form-info')}>
                    <div className={cx('form-group')}>
                        <label htmlFor="inventoryCheckId">Mã phiếu kiểm kê</label>
                        <input
                            type="text"
                            id="inventoryCheckId"
                            value={inventoryCheckId}
                            onChange={(e) => setInventoryCheckId(e.target.value)}
                            placeholder="Nhập mã phiếu kiểm kê"
                        />
                    </div>
                    <div className={cx('form-group')}>
                        <label htmlFor="inventoryCheckDate">
                            <span style={{ color: 'red' }}>*</span> Ngày kiểm kê
                        </label>
                        <input
                            type="date"
                            id="inventoryCheckDate"
                            value={inventoryCheckDate}
                            onChange={(e) => setInventoryCheckDate(e.target.value)}
                            placeholder="Chọn ngày kiểm kê"
                        />
                    </div>
                    <div className={cx('form-group')}>
                        <label htmlFor="staffName">
                            <span style={{ color: 'red' }}>*</span> Nhân viên phụ trách
                        </label>
                        <input
                            type="text"
                            id="staffName"
                            value={staffName}
                            onChange={(e) => setStaffName(e.target.value)}
                            placeholder="Nhập tên nhân viên phụ trách kiểm kê"
                        />
                    </div>
                    <div className={cx('form-group')}>
                        <label htmlFor="note">Ghi chú</label>
                        <input
                            type="text"
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Nhập ghi chú"
                        />
                    </div>
                </div>
            </div>

            <div className={cx('filter-check', 'container-check')}>
                <h4>Tìm kiếm sản phẩm cần kiểm kê</h4>
                <div className={cx('form-group')}>
                    <label htmlFor="inventoryCheckId">
                        <span style={{ color: 'red' }}>*</span> Mã phiếu kiểm kê
                    </label>
                    <input
                        type="text"
                        id="inventoryCheckId"
                        value={inventoryCheckId}
                        placeholder="Nhập mã phiếu kiểm kê"
                    />
                </div>
            </div>

            <div className={cx('table-check', 'container-check')}>
                <div className={cx('title-table')}>
                    <h4>Danh sách hàng hóa kiểm kê</h4>
                    <Button medium className={cx('btn-complete-check')}>
                        Hoàn tất kiểm kê
                    </Button>
                </div>
                <MyTable columns={tableColumns} data={[]} />
            </div>
        </div>
    );
};

export default CheckPage;
