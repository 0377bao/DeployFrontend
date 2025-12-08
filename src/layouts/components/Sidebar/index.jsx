import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import SidebarItem from './SidebarItem';
import {
    User,
    LayoutDashboard,
    CircleArrowLeft,
    CircleArrowRight,
    ClipboardMinus,
    CalendarCheck,
    Warehouse,
    Factory,
    Info,
    Users,
    Milk,
    Package,
    TruckElectric,
    CheckLine,
    History,
    ClipboardPlus,
    Files,
    FileChartPie,
} from 'lucide-react';
import logo from '../../../assets/logo_v2.jpg';
import { useLocation, useNavigate } from 'react-router-dom';
import { Modal } from '@/components';
import { InfoWare } from '@/components';
import { useDispatch, useSelector } from 'react-redux';
import { changDropItem } from '../../../lib/redux/dropSidebar/dropSidebarSlice';

const shopName = import.meta.env.VITE_SOFTWARE_NAME;
const cx = classNames.bind(styles);

const Sidebar = () => {
    const sidebarMenu = [
        {
            id: 1,
            title: 'Dashboard',
            iconName: LayoutDashboard,
            path: '/',
            roles: ['PUBLIC'],
        },
        {
            id: 2,
            title: 'Sản phẩm',
            iconName: Milk,
            path: '/products',
            roles: ['PUBLIC'],
        },
        {
            id: 3,
            title: 'Khách hàng',
            iconName: Users,
            path: '/customer',
            roles: ['SYSTEM_ADMIN', 'WARE_MANAGER', 'STOCK_DISPATCHER'],
        },
        {
            id: 4,
            title: 'Nhà cung cấp',
            iconName: Factory,
            path: '/supplier',
            roles: ['SYSTEM_ADMIN', 'WARE_MANAGER', 'STOCK_RECEIVER'],
        },
        {
            id: 5,
            title: 'Nhân sự',
            iconName: User,
            path: '/auth',
            roles: ['SYSTEM_ADMIN', 'WARE_MANAGER'],
        },
        {
            id: 6,
            title: 'Phiếu đề xuất',
            iconName: Files,
            subMenu: [
                {
                    title: 'Phiếu đề xuất nhập',
                    iconName: ClipboardPlus,
                    path: '/proposal-import-list',
                    roles: ['SYSTEM_ADMIN', 'WARE_MANAGER', 'STOCK_RECEIVER'],
                },
                {
                    title: 'Phiếu đề xuất xuất',
                    iconName: ClipboardMinus,
                    path: '/proposal-export-list',
                    roles: ['SYSTEM_ADMIN', 'WARE_MANAGER', 'STOCK_DISPATCHER'],
                },
            ],
        },
        {
            id: 7,
            title: 'Quản lý nhập xuất',
            iconName: TruckElectric,
            subMenu: [
                {
                    title: 'Tạo phiếu nhập kho',
                    iconName: CircleArrowRight,
                    path: '/ware-receive',
                    roles: ['SYSTEM_ADMIN', 'WARE_MANAGER', 'STOCK_RECEIVER'],
                },
                {
                    title: 'Tạo phiếu xuất kho',
                    iconName: CircleArrowLeft,
                    path: '/ware-release',
                    roles: ['SYSTEM_ADMIN', 'WARE_MANAGER', 'STOCK_DISPATCHER'],
                },
            ],
        },
        {
            id: 8,
            title: 'Quản lý kho',
            iconName: Warehouse,
            subMenu: [
                {
                    title: 'Kiểm kê kho',
                    iconName: CalendarCheck,
                    path: '/check-inventory',
                    roles: ['SYSTEM_ADMIN', 'WARE_MANAGER', 'ACCOUNTANT'],
                },
                {
                    title: 'Quản lý kệ',
                    iconName: Package,
                    path: '/batch',
                    roles: ['PUBLIC'],
                },
                // {
                //     title: 'Quản lý kệ 3d',
                //     iconName: Package,
                //     path: '/warehouse-3d',
                // },
                {
                    title: 'Nhật ký kho',
                    iconName: History,
                    path: '/history',
                    roles: ['SYSTEM_ADMIN', 'WARE_MANAGER'],
                },
            ],
        },
        // {
        //     id: 9,
        //     title: 'Thống kê',
        //     iconName: FileChartPie,
        //     path: '/report',
        //     roles: ['SYSTEM_ADMIN', 'WARE_MANAGER'],
        // },
    ];

    let location = useLocation();
    const [isOpenInfo, setIsOpenInfo] = useState(false);
    const itemDrop = useSelector((state) => state.DropSideBarSlice.itemDrop);
    const dispatch = useDispatch();
    const warehouseRedux = useSelector((state) => state.WareHouseSlice.warehouse);
    const [warehouse, setWarehouse] = useState({
        warehouseID: '',
        warehouseName: '',
        faxNumber: '',
        address: '',
        status: '',
    });
    const navigate = useNavigate();

    const closeInfoWarehouse = () => {
        setIsOpenInfo(false);
    };

    const changeDropItem = (ids) => {
        dispatch(changDropItem([...ids]));
    };

    useEffect(() => {
        if (warehouseRedux) setWarehouse(warehouseRedux);
    }, []);

    return (
        <>
            <div className={cx('wrapper-sidebar')}>
                <div className={cx('sidebar-content')}>
                    <div className={cx('info-user')}>
                        <button className={cx('logo-sidebar')} onClick={() => navigate('/')}>
                            <img src={logo} loading="lazy" />
                        </button>

                        <div className={cx('ware-brand')}>
                            <h1 className={cx('username')}>{shopName}</h1>
                            <Info className={cx('icon')} size={16} onClick={() => setIsOpenInfo(true)} />
                        </div>
                    </div>
                    <div className={cx('sidebar-list')}>
                        {sidebarMenu.map((item, index) => (
                            <SidebarItem
                                changeDropItem={changeDropItem}
                                itemDrop={itemDrop}
                                key={index}
                                id={item.id}
                                title={item.title}
                                iconName={item.iconName}
                                path={item.path}
                                location={location.pathname}
                                subMenu={item?.subMenu}
                                roles={item.roles}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <Modal isOpenInfo={isOpenInfo} onClose={closeInfoWarehouse}>
                <InfoWare
                    warehouseId={warehouse.warehouseID}
                    warehouseName={warehouse.warehouseName}
                    faxNumber={warehouse.faxNumber}
                    address={warehouse.address}
                    status={warehouse.status}
                />
            </Modal>
        </>
    );
};

export default Sidebar;
