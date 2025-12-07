import React from 'react';
import classNames from "classnames/bind"
import styles from "./WarehouseTransferPage.module.scss"

const cx = classNames.bind(styles)

const WarehouseTransferPage = () => {
    return (
        <div className={cx('wrapper-warehouse-transfer')}>
            <h1>Transfer Warehouse Order</h1>
        </div>
    );
}

export default WarehouseTransferPage;
