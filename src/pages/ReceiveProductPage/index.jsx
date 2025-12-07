import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ReceiveProductPage.module.scss';
import { MyTable, Button, Modal } from '../../components';
import { ClipboardClock, Eye, PlusCircle, Trash, FileMinus } from 'lucide-react';
import HistoryReceiveAndReleasePage from '../HistoryReceiveAndReleasePage';
import Tippy from '@tippyjs/react';
import InputBase from '../../components/InputBase';
import ReceiveProductMissingPage from '../ReceiveProductMissingPage';
import ImportProduct from './ImportProduct';
const cx = classNames.bind(styles);

const ReceiveProductPage = () => {
    const [tabActive, setTabActive] = useState(1);

    const handleActiveTab = (index) => setTabActive(index);

    return (
        <div className={cx('wrapper-receive-product')}>
            <section className={cx('header-tab')}>
                <Button
                    active={tabActive == 1 ? true : false}
                    onClick={() => handleActiveTab(1)}
                    leftIcon={<PlusCircle size={20} />}
                >
                    <span>Nhập kho</span>
                </Button>
                <Button
                    active={tabActive == 2 ? true : false}
                    onClick={() => handleActiveTab(2)}
                    leftIcon={<FileMinus size={20} />}
                >
                    <span>Phiếu nhập thiếu</span>
                </Button>
            </section>

            {tabActive == 1 && <ImportProduct />}
            {tabActive == 2 && <ReceiveProductMissingPage />}
        </div>
    );
};

export default ReceiveProductPage;
