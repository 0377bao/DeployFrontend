import {
    AuthPage,
    CheckPage,
    Dashboard,
    ProductPage,
    ReceiveProductPage,
    ReleaseProductPage,
    ReportPage,
    ReturnProductPage,
    Supplier,
    WarehousePage,
    WarehouseTransferPage,
    ProductErrorPage,
    Login,
    Register,
    Customer,
    ProfilePage,
    ProposalPage,
    BatchPage,
    ZonePage,
    CategoryPage,
    ApprovePage,
    ApproveReleasePage,
} from '../pages';
import DefaultLayout from '../layouts/DefaultLayout';
import HistoryPage from '../pages/HistoryPage';
import Warehouse3D from '../pages/Warehouse3D';

const publicRoute = [
    {
        page: Dashboard,
        path: '/',
        layout: DefaultLayout,
        roles: ['PUBLIC'],
    },
    {
        page: ProductPage,
        path: '/products',
        layout: DefaultLayout,
        roles: ['PUBLIC'],
    },
    {
        page: ReceiveProductPage,
        path: '/ware-receive',
        layout: DefaultLayout,
        roles: ['SYSTEM_ADMIN', 'WARE_MANAGER', 'STOCK_RECEIVER'],
    },
    {
        page: ReleaseProductPage,
        path: '/ware-release',
        layout: DefaultLayout,
        roles: ['SYSTEM_ADMIN', 'WARE_MANAGER', 'STOCK_DISPATCHER'],
    },
    {
        page: CheckPage,
        path: '/check-inventory',
        layout: DefaultLayout,
        roles: ['SYSTEM_ADMIN', 'WARE_MANAGER', 'ACCOUNTANT'],
    },
    {
        page: ReportPage,
        path: '/report',
        layout: DefaultLayout,
        roles: ['PUBLIC'],
    },
    {
        page: ReturnProductPage,
        path: '/return-order',
        layout: DefaultLayout,
        roles: ['PUBLIC'],
    },
    {
        page: AuthPage,
        path: '/auth',
        layout: DefaultLayout,
        roles: ['SYSTEM_ADMIN', 'WARE_MANAGER'],
    },
    {
        page: ProductErrorPage,
        path: '/product-error',
        layout: DefaultLayout,
        roles: ['PUBLIC'],
    },
    {
        page: Supplier,
        path: '/supplier',
        layout: DefaultLayout,
        roles: ['SYSTEM_ADMIN', 'WARE_MANAGER', 'STOCK_RECEIVER'],
    },
    {
        page: WarehousePage,
        path: '/manage-warehouse',
        layout: DefaultLayout,
        roles: ['PUBLIC'],
    },
    {
        page: WarehouseTransferPage,
        path: '/ware-transfer',
        layout: DefaultLayout,
        roles: ['PUBLIC'],
    },
    {
        page: Login,
        path: '/login',
        layout: null,
        roles: ['PUBLIC'],
    },
    // {
    //     page: Register,
    //     path: '/register',
    //     layout: null,
    // },
    {
        page: Customer,
        path: '/customer',
        layout: DefaultLayout,
        roles: ['SYSTEM_ADMIN', 'WARE_MANAGER', 'STOCK_DISPATCHER'],
    },
    {
        page: ProfilePage,
        path: '/profile',
        layout: DefaultLayout,
        roles: ['PUBLIC'],
    },
    // {
    //     page: ProposalPage,
    //     path: '/proposal',
    //     layout: DefaultLayout,
    // },
    {
        page: Warehouse3D,
        path: '/batch',
        layout: DefaultLayout,
        roles: ['PUBLIC'],
    },
    {
        page: ZonePage,
        path: '/zone',
        layout: DefaultLayout,
        roles: ['PUBLIC'],
    },
    {
        page: CategoryPage,
        path: '/categories',
        layout: DefaultLayout,
        roles: ['PUBLIC'],
    },
    {
        page: ApprovePage,
        path: '/proposal-import-list',
        layout: DefaultLayout,
        roles: ['SYSTEM_ADMIN', 'WARE_MANAGER', 'STOCK_RECEIVER'],
    },
    {
        page: ApproveReleasePage,
        path: '/proposal-export-list',
        layout: DefaultLayout,
        roles: ['SYSTEM_ADMIN', 'WARE_MANAGER', 'STOCK_DISPATCHER'],
    },
    {
        page: HistoryPage,
        path: '/history',
        layout: DefaultLayout,
        roles: ['SYSTEM_ADMIN', 'WARE_MANAGER'],
    },
];
const publicRouteWithAdmin = [
    ...publicRoute,
    {
        page: ApprovePage,
        path: '/proposal-import-list',
        layout: DefaultLayout,
    },
];

export { publicRoute, publicRouteWithAdmin };
