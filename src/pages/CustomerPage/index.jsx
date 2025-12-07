import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { MyTable } from '@/components';
import styles from './CustomerPage.module.scss';
import { Eye } from 'lucide-react';
import Tippy from '@tippyjs/react';
import globalStyle from '../../components/GlobalStyle/GlobalStyle.module.scss';
import ModelFilter from '../../components/ModelFilter';
import { filterCustomer, getAllCustomer } from '../../services/customer.service';
import ModalHistoryOrderCustomer from './ModalHistoryOrderCustomer';

const cx = classNames.bind(styles);
const cxGlobal = classNames.bind(globalStyle);

const CustomerPage = () => {
    const [page, setPage] = useState(1);
    const [customerID, setCustomerID] = useState('');
    const [nameFilter, setNameFilter] = useState('');
    const [phoneFilter, setPhoneFilter] = useState('');
    const [emailFilter, setEmailFilter] = useState('');
    const [isOpenInfo, setIsOpenInfo] = useState(null);
    const [customerList, setCustomerList] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    const columns = [
        {
            title: 'Mã KH',
            dataIndex: 'customerID',
            key: 'customerID',
            width: '10%',
            ellipsis: true,
        },
        {
            title: 'Tên khách hàng',
            dataIndex: 'customerName',
            key: 'customerName',
            width: '20%',
            ellipsis: true,
        },
        {
            title: 'SDT',
            dataIndex: 'phone',
            key: 'phone',
            width: '10%',
            ellipsis: true,
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            width: '30%',
            ellipsis: true,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: '20%',
            ellipsis: true,
        },
        {
            title: 'Lịch sử GD',
            dataIndex: 'transactionHistory',
            key: 'transactionHistory',
            width: '10%',
            ellipsis: true,
            //className: cx('transaction-history'),
            render: (_, record) => {
                return (
                    <div className={cxGlobal('action-table')}>
                        <Tippy content={'Xem chi tiết'} placement="bottom-end">
                            <button
                                className={cxGlobal('action-table-icon')}
                                onClick={() => setIsOpenInfo(record.customerID)}
                            >
                                <Eye size={20} />
                            </button>
                        </Tippy>
                    </div>
                );
            },
        },
    ];

    const dataOrderHistory = [
        {
            key: '1',
            orderId: 'ORD001',
            customerName: 'Alice',
            employeeName: 'Bob',
            warehouseId: 'WH001',
            createdAt: '2023-10-01',
            detail: 'Order details here...',
        },
        {
            key: '2',
            orderId: 'ORD002',
            customerName: 'Charlie',
            employeeName: 'Dave',
            warehouseId: 'WH002',
            createdAt: '2023-10-02',
            detail: 'Order details here...',
        },
    ];

    const onChangePage = (page, pageSize) => {
        console.log(`Page: ${page}, Page Size: ${pageSize}`);
        setPage(page);
    };

    const closeModal = () => {
        setIsOpenInfo(false);
    };

    const handleSubmitFilter = async () => {
        const optionFilter = {};
        if (!customerID && !nameFilter && !phoneFilter && !emailFilter) return;
        if (customerID) optionFilter.customerID = customerID;
        if (nameFilter) optionFilter.customerName = nameFilter;
        if (phoneFilter) optionFilter.customerPhone = phoneFilter;
        if (emailFilter) optionFilter.email = emailFilter;
        try {
            const res = await filterCustomer(optionFilter);
            setCustomerList(res || []);
            setTotalPages(1);
            setPage(1);
        } catch (err) {
            console.log(err);
        }
    };

    const columnsFilter = [
        {
            id: 'customerID',
            label: 'Mã khách hàng',
            value: customerID,
            setValue: setCustomerID,
        },
        {
            id: 'name',
            label: 'Tên khách hàng',
            value: nameFilter,
            setValue: setNameFilter,
        },
        {
            id: 'phone',
            label: 'Số điện thoại',
            value: phoneFilter,
            setValue: setPhoneFilter,
        },
        {
            id: 'email',
            label: 'Email',
            value: emailFilter,
            setValue: setEmailFilter,
        },
    ];

    const fetchListCustomer = async (page) => {
        try {
            const res = await getAllCustomer(page);
            setCustomerList(res.data || []);
            setPage(res?.pagination?.currentPage || 1);
            setTotalPages(res?.pagination?.totalPages || 1);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchListCustomer(page);
    }, [page]);

    return (
        <div className={cx('wrapper-report')}>
            <div className={cx('header')}>
                <ModelFilter
                    handleSubmitFilter={handleSubmitFilter}
                    handleResetFilters={() => {
                        if (!customerID && !nameFilter && !phoneFilter && !emailFilter) return;
                        setCustomerID('');
                        setNameFilter('');
                        setPhoneFilter('');
                        setEmailFilter('');
                        fetchListCustomer();
                    }}
                    columns={columnsFilter}
                />
            </div>
            <div className={cx('content')}>
                <MyTable
                    currentPage={page}
                    columns={columns}
                    data={customerList}
                    pagination
                    pageSize={5}
                    onChangePage={onChangePage}
                    total={totalPages * 5}
                />
            </div>
            <ModalHistoryOrderCustomer
                isOpen={!!isOpenInfo}
                onClose={() => setIsOpenInfo(null)}
                customerID={isOpenInfo}
            />
        </div>
    );
};

export default CustomerPage;
