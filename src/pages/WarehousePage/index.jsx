import React from 'react';
import classNames from "classnames/bind"
import styles from "./WarehousePage.module.scss"

const cx = classNames.bind(styles)

const WarehousePage = () => {
    return (
        <div className={cx('wrapper-warehouse')}>
            <h1>Manage Warehouse</h1>
        </div>
    );
}

export default WarehousePage;
