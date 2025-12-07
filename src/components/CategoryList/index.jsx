import React from 'react';
import classNames from 'classnames/bind';
import styles from "./CategoryList.module.scss"
import {MyTable} from '@/components';
import Tippy from '@tippyjs/react';
import { PencilIcon } from 'lucide-react';
import globalStyle from "@/components/GlobalStyle/GlobalStyle.module.scss"

const cx = classNames.bind(styles)
const cxGlobal = classNames.bind(globalStyle)

const columns = [
    {
        title: 'Mã nhóm sản phẩm',
        dataIndex: 'categoryID',
        key: 'categoryID',
    },
     {
        title: 'Tên nhóm sản phẩm',
        dataIndex: 'categoryName',
        key: 'categoryName',
    },
    {
        title: 'Thao tác',
        dataIndex: 'action',
        key: 'action',
        render: (_, record) => {
            return (
                <div className={cxGlobal('action-table')}>
                        <Tippy content={'Chỉnh sửa'} placement="bottom-end">
                            <button className={cxGlobal('action-table-icon')} onClick={()=> {}}>
                                <PencilIcon size={20} />
                            </button>
                        </Tippy>
                </div>
            )
        }
    }
]

const data = [
    {
        categoryId: 1,
        categoryName: 'Sữa hộp',
        locationId: 'G1'
    }
]

const CategoryList = ({data}) => {
    return (
        <div className={cx('wrapper-categories')}>
            <h1 className={cx('title')}>Danh sách nhóm sản phẩm</h1>
            <MyTable columns={columns} data={data}/>
        </div>
    );
}

export default CategoryList;
