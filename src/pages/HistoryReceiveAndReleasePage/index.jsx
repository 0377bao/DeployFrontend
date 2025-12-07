import React, { useState } from "react"
import classNames from "classnames/bind"
import styles from "./HistoryReceiveAndReleasePage.module.scss"
import { MyTable } from "@/components"

const cx = classNames.bind(styles)

const HistoryReceiveAndReleasePage = ({ title = "", classNames, columnTable = [], dataTable = [], children }) => {
    const [pageSize] = useState(5);
    const [currentPage, setCurrentPage] = useState(1)
    return (
        <div className={cx('wrapper-history', classNames)}>
            <div className={cx('history-header')}>
                <p className={cx('title-history')}>{title}</p>
            {children}
            </div>
            <MyTable columns={columnTable} data={dataTable} pagination pageSize={pageSize} currentPage={currentPage
            } />
        </div>
    )
}

export default HistoryReceiveAndReleasePage;