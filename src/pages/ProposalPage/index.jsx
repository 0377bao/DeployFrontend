import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Proposal.module.scss';
import { Button } from '../../components';
import GoodsReceiptRequest from './GoodsReceiptRequest';
import GoodsIssueRequest from './GoodsIssueRequest';

const cx = classNames.bind(styles);

export default function ProposalCreatePage() {
    const [tabActive, setTabActive] = useState(1);

    const handleActiveTab = (index) => setTabActive(index);

    return (
        <div className={cx('wrapper-proposal-page')}>
            <section className={cx('header-tab')}>
                <Button active={tabActive == 1 ? true : false} onClick={() => handleActiveTab(1)}>
                    <span>Nhập kho</span>
                </Button>
                <Button active={tabActive == 2 ? true : false} onClick={() => handleActiveTab(2)}>
                    <span>Xuất kho</span>
                </Button>
            </section>
            {tabActive == 1 && <GoodsReceiptRequest />}
            {tabActive == 2 && <GoodsIssueRequest />}
        </div>
    );
}
