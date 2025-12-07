import React from 'react';
import classNames from 'classnames/bind';
import styles from './ProposalStatus.module.scss';
import { formatStatusProposal } from '../../constants';

const cx = classNames.bind(styles);

const ProposalStatus = ({ index, record }) => {
    return (
        <div className={cx('status-proposal')}>
            <div className={cx('status-indicator', record.status)}></div>
            <p className={cx('text')}>{formatStatusProposal[index]}</p>
        </div>
    );
};

export default ProposalStatus;
