/* eslint-disable no-unused-vars */
import React, { use, useCallback, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ProductPage.module.scss';
import MyTable from '../../components/MyTable';
import Tippy from '@tippyjs/react';
import { Eye, PencilIcon, Plus, HistoryIcon } from 'lucide-react';
import { ProductDetail, ProductEdit, ModelFilter, Button } from '@/components';
import { useDispatch, useSelector } from 'react-redux';
import { startLoading, stopLoading } from '../../lib/redux/loading/slice';
import toast from 'react-hot-toast';
import request, { put } from '../../utils/httpRequest';
import parseToken from '../../utils/parseToken';
import ProductDTO from '../../dtos/ProductDTO';
import BatchDTO from '../../dtos/BatchDTO';
import ProductDetailDTO from '../../dtos/ProductDetailDTO';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatStatusProduct, styleMessage } from '../../constants';
import PaginationUI from '@/components/PaginationUI';
import ModalProductCreate from '../../components/ModalProductCreate';
import ProductHistory from '../../components/ProductHistory';
import { authIsAdmin } from '../../common';
import { set } from 'lodash';
import CategoryDialog from './CategoryDialog';

const cx = classNames.bind(styles);

// const dataSource = [
//     { sku: 'SP001', productName: 'Gạo thơm', minStock: 20 },
//     { sku: 'SP002', productName: 'Nước mắm Nam Ngư', minStock: 15 },
//     { sku: 'SP003', productName: 'Đường trắng', minStock: 25 },
//     { sku: 'SP004', productName: 'Muối i-ốt', minStock: 30 },
//     { sku: 'SP005', productName: 'Bột ngọt Ajinomoto', minStock: 12 },
//     { sku: 'SP006', productName: 'Dầu ăn Tường An', minStock: 18 },
//     { sku: 'SP007', productName: 'Sữa ông thọ', minStock: 10 },
//     { sku: 'SP008', productName: 'Mì gói Hảo Hảo', minStock: 50 },
//     { sku: 'SP009', productName: 'Nước suối Lavie', minStock: 40 },
//     { sku: 'SP010', productName: 'Bánh tráng', minStock: 22 },
//     { sku: 'SP011', productName: 'Cà phê G7', minStock: 16 },
//     { sku: 'SP012', productName: 'Trà xanh', minStock: 14 },
//     { sku: 'SP013', productName: 'Nước ngọt Coca', minStock: 35 },
//     { sku: 'SP014', productName: 'Khăn giấy', minStock: 28 },
//     { sku: 'SP015', productName: 'Bột giặt OMO', minStock: 13 },
// ];

const ProductPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.AuthSlice.user);
    const [currentPage, setCurrentPage] = useState(1);
    const [action, setAction] = useState({
        productId: '',
        actionName: '',
    });
    const [productData, setProductData] = useState(null);
    const [productList, setProductList] = useState([]);
    const [filterProduct, setFilterProduct] = useState({
        productID: '',
        productName: '',
        categoryID: '',
        minStock: '',
    });
    const query = new URLSearchParams(location.search);
    const productID = query.get('productID');
    const dispatch = useDispatch();
    const [showModalCreateProduct, setShowModalCreateProduct] = useState(false);
    const [totalPage, setTotalPage] = useState(0);
    const [isOpenCategory, setIsOpenCategory] = useState(false);

    const handleOnChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    useEffect(() => {
        if (productID) {
            handleShowProductDetail(productID);
        }
    }, [productID]);

    const handleShowProductDetail = async (productId) => {
        try {
            const tokenUser = parseToken('tokenUser');
            console.log('tokenUser', currentUser);
            dispatch(startLoading());
            // call api lấy thông tin product
            const res = await request.get(`/api/product?productID=${productId}`, {
                headers: {
                    token: `Beare ${tokenUser.accessToken}`,
                    employeeid: tokenUser.employeeID,
                    warehouseid: currentUser.warehouseId,
                },
            });
            const { batches, ...rest } = res.data.product;

            const formatBatch = batches.map((item) => {
                const batch = new BatchDTO(item);
                return { ...batch };
            });
            console.log('formatBatch', formatBatch);
            const productDetail = new ProductDetailDTO({
                ...rest,
                listBatch: formatBatch,
                baseUnitName: rest.baseUnitProducts?.baseUnitName,
            });
            console.log('productDetail', productDetail);
            setProductData(productDetail);
        } catch (err) {
            console.log(err);
        } finally {
            setAction({
                productId,
                actionName: 'view',
            });
            dispatch(stopLoading());
        }
    };

    const handleShowEditProduct = (productId) => {
        const productSelected = productList.find((item) => item.sku == productId);
        setProductData(productSelected);
        setAction({
            productId,
            actionName: 'edit',
        });
    };

    const handleShowHistory = (productId) => {
        setAction({
            productId,
            actionName: 'history',
        });
    };

    const columnsModelFilter = [
        {
            id: 1,
            label: 'Mã sản phẩm',
            value: filterProduct.productID,
            setValue: (value) => setFilterProduct((prev) => ({ ...prev, productID: value })),
        },
        {
            id: 2,
            label: 'Tên sản phẩm',
            value: filterProduct.productName,
            setValue: (value) => setFilterProduct((prev) => ({ ...prev, productName: value })),
        },
        {
            id: 3,
            label: 'Tồn kho tối thiểu',
            value: filterProduct.minStock,
            setValue: (value) => setFilterProduct((prev) => ({ ...prev, minStock: value })),
        },
    ];
    const tableColumns = [
        {
            title: 'Tên nhóm sản phẩm',
            dataIndex: 'skgu',
            key: 'skgu',
        },
        {
            title: 'Mã sản phẩm',
            dataIndex: 'sku',
            key: 'sku',
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
            width: '300px',
            render: (text, record) => <p className={cx('product-name')}>{record.productName}</p>,
        },
        {
            title: 'Đơn vị tính',
            dataIndex: 'unitName',
            key: 'unitName',
            render: (text, record) => <p className={cx('unit-name-product')}>{record.baseUnitName}</p>,
        },
        {
            title: 'Tồn kho tối thiểu',
            dataIndex: 'minStock',
            key: 'minStock',
            render: (text) => <p className={cx('min-stock-product')}>{text}</p>,
            width: '15%',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (text) => <p className={cx('status-product')}>{formatStatusProduct[text]}</p>,
        },
        {
            title: 'Thao tác',
            dataIndex: 'action',
            key: 'action',
            render: (text, record) => {
                return (
                    <div className={cx('action-table')}>
                        <Tippy content={'Xem chi tiết'} placement="bottom-end">
                            <button
                                className={cx('action-table-icon')}
                                onClick={() => handleShowProductDetail(record.sku)}
                            >
                                <Eye size={20} />
                            </button>
                        </Tippy>
                        {authIsAdmin(currentUser) && (
                            <Tippy content={'Chỉnh sửa'} placement="bottom-end">
                                <button
                                    className={cx('action-table-icon')}
                                    onClick={() => handleShowEditProduct(record.sku)}
                                >
                                    <PencilIcon size={20} />
                                </button>
                            </Tippy>
                        )}
                        <Tippy content={'Lịch sử'} placement="bottom-end">
                            <button className={cx('action-table-icon')} onClick={() => handleShowHistory(record.sku)}>
                                <HistoryIcon size={20} />
                            </button>
                        </Tippy>
                    </div>
                );
            },
        },
    ];

    const fetchProducts = async (page = 1) => {
        try {
            const tokenUser = parseToken('tokenUser');
            const result = await request.get('/api/product/list', {
                params: {
                    page,
                },
                headers: {
                    token: `Beare ${tokenUser.accessToken}`,
                    employeeid: tokenUser.employeeID,
                },
            });
            //console.log('fetch', result);
            const formatProducts = result.data.products.map((item) => {
                const product = new ProductDTO(item);
                return { ...product, ...item.baseUnitProducts };
            });
            setProductList(formatProducts);
            setTotalPage(result.data.pagination.totalPages);
        } catch (err) {
            console.log('fetch err', err);
        }
    };

    const handleSearch = async ({ productID, productName, categoryID, minStock, page }) => {
        try {
            const params = {
                productID,
                productName,
                categoryID,
                minStock,
                page,
            };
            const tokenUser = parseToken('tokenUser');
            const res = await request.get('/api/product/filter', {
                params,
                headers: {
                    token: `Beare ${tokenUser.accessToken}`,
                    employeeid: tokenUser.employeeID,
                    warehouseid: currentUser.warehouseId ? currentUser.warehouseId : null,
                },
            });

            const formatProduct = res.data.products.map((item) => {
                const product = new ProductDTO(item);
                return { ...product };
            });
            setProductList(formatProduct || []);
            setTotalPage(res.data.pagination.totalPages);
        } catch (err) {
            console.log(err);
            //fetchProducts();
        }
    };

    const handleResetFilterProduct = () => {
        setFilterProduct({
            productID: '',
            productName: '',
            minStock: '',
        });
        fetchProducts();
        setCurrentPage(1);
    };

    useEffect(() => {
        if (location.state) {
            setProductData(location.state);
            setAction({
                productId: location.state.sku,
                actionName: 'view',
            });
        }
        fetchProducts();
    }, []);

    const handleUpdateProduct = async (dataUpdate) => {
        try {
            // call api
            const token = parseToken('tokenUser');
            const result = await put(
                `/api/product/update/${productData.sku}`,
                {
                    productName: dataUpdate.productName,
                    minStock: dataUpdate.productMinStock,
                    status: dataUpdate.productStatus,
                },
                token.accessToken,
                token.employeeID,
                currentUser.warehouseId,
            );
            //console.log(result)
            setAction({ productId: null, actionName: null });
            setProductData(null);
            toast.success(result.message, styleMessage);
            fetchProducts();
        } catch (err) {
            toast.error(
                Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
                styleMessage,
            );
            console.log(err);
        }
    };

    useEffect(() => {
        handleSearch({ ...filterProduct, page: currentPage });
    }, [currentPage]);

    return (
        <>
            <div className={cx('wrapper-product')}>
                <ModelFilter
                    columns={columnsModelFilter}
                    handleSubmitFilter={() => handleSearch({ ...filterProduct, page: 1 })}
                    handleResetFilters={handleResetFilterProduct}
                >
                    {authIsAdmin(currentUser) && (
                        <>
                            <Button
                                primary
                                medium
                                onClick={() => setIsOpenCategory(true)}
                                leftIcon={<Plus size={20} />}
                            >
                                <span>Tạo nhóm sản phẩm</span>
                            </Button>
                            <Button
                                primary
                                medium
                                onClick={() => setShowModalCreateProduct(true)}
                                leftIcon={<Plus size={20} />}
                            >
                                <span>Tạo sản phẩm</span>
                            </Button>
                        </>
                    )}
                </ModelFilter>
                <h1>Danh sách sản phẩm</h1>
                <MyTable
                    //className={cx('my-table')}
                    columns={tableColumns}
                    data={productList}
                    pageSize={5}
                    pagination
                    onChangePage={handleOnChange}
                    currentPage={currentPage}
                    total={totalPage * 5}
                />
                {action.productId && action.actionName === 'view' && (
                    <ProductDetail
                        data={productData}
                        onClose={() => {
                            setAction({ productId: null, actionName: null });
                            navigate(location.pathname, { replace: true });
                        }}
                        classname={cx('modal-product-detail')}
                    />
                )}
                {action.productId && action.actionName === 'edit' && (
                    <ProductEdit
                        data={productData}
                        onClose={() => setAction({ productId: null, actionName: null })}
                        handleUpdateProduct={handleUpdateProduct}
                    />
                )}
                {showModalCreateProduct && (
                    <ModalProductCreate
                        isOpen={!!showModalCreateProduct}
                        onClose={() => setShowModalCreateProduct(false)}
                        prefectProductList={fetchProducts}
                    />
                )}
                {action.productId && action.actionName === 'history' && (
                    <ProductHistory
                        data={action.productId}
                        onClose={() => setAction({ productId: null, actionName: null })}
                    />
                )}
            </div>
            {isOpenCategory && <CategoryDialog isOpen={isOpenCategory} onClose={() => setIsOpenCategory(false)} />}
        </>
    );
};

export default ProductPage;
