import React from 'react';
import classNames from 'classnames/bind';
import styles from "./ProductErrorPage.module.scss"

const cx = classNames.bind(styles)

const ProductErrorPage = () => {
    return (
        <div className={cx('wrapper-product-err')}>
            <h1>Product Error</h1>
        </div>
    );
}

export default ProductErrorPage;
