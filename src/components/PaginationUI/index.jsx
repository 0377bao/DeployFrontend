import React from 'react';
import classNames from 'classnames/bind';
import styles from './PaginationUI.module.scss';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const cx = classNames.bind(styles);

const PaginationUI = ({currentPage = 1, handleNextPage, handlePrevPage}) => {
    return (
        <div className={cx('wrapper-pagination')}>
            <ChevronLeft className={cx('icon')} size={20} onClick={handlePrevPage}/>
            <span>{currentPage}</span>
            <ChevronRight className={cx('icon')} size={20} onClick={handleNextPage}/>
        </div>
    );
}

export default PaginationUI;
