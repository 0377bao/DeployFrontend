import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './GoodsIssueRequest.module.scss';
import { Button } from '../../../components';
import { generateCode } from '../../../utils/generate';
import { useSelector } from 'react-redux';
import QrReader from '../../../components/QrReader';
import request, { post } from '../../../utils/httpRequest';
import parseToken from '../../../utils/parseToken';
import toast from 'react-hot-toast';
import { styleMessage } from '../../../constants';
import { Search } from 'lucide-react';

const cx = classNames.bind(styles);

const currency = (n) => (isNaN(n) ? '0' : new Intl.NumberFormat('vi-VN').format(Number(n)));
const todayISO = () => new Date().toISOString().slice(0, 10);
const emptyItem = () => ({ sku: '', name: '', uom: '', qty: 1, note: '', listUom: [] });

export default function GoodsIssueRequest() {
    const currentUser = useSelector((state) => state.AuthSlice.user);
    const warehouseCurrent = useSelector((state) => state.WareHouseSlice.warehouse);
    const [code, setCode] = useState('');
    const [date, setDate] = useState(todayISO());
    const [creator, setCreator] = useState('');
    const [warehouse, setWarehouse] = useState({
        warehouseID: 'WH1',
        warehouseName: 'Thủ Đức',
    });
    const [reason, setReason] = useState('');

    const [items, setItems] = useState([]); // danh sách sản phẩm gợi ý
    const [openModal, setOpenModal] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [productIDSearch, setProductIDSearch] = useState('');
    const [listUnitUOM, setListUnitUOM] = useState([]);

    const totals = useMemo(() => {
        const totalQty = items.reduce(
            (s, i) =>
                s +
                (Number(i.qty) *
                    Number(i.listUom.find((ix) => ix.unitID == Number.parseInt(i.uom))?.unitName.slice(-2)) || 0),
            0,
        );
        const unique = items.filter((i) => i.name?.trim()).length;
        return { totalQty, unique };
    }, [items]);

    const addRow = () => setItems((prev) => [...prev, emptyItem()]);
    const removeRow = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));
    const updateCell = (idx, key, val) =>
        setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));

    const validate = () => {
        const errors = [];
        if (!code) errors.push('Vui lòng tạo mã phiếu nhập kho');
        if (!reason) errors.push('Vui lòng ghi lý do nhập');
        if (items.length === 0) errors.push('Danh sách hàng hóa đang trống');
        const checkRow = items.every((row) => row.sku && row.name && row.uom && row.qty > 0);
        if (!checkRow)
            errors.push('Vui lòng điền đầy đủ thông tin chi tiết sản phẩm cần nhập và số lượng tối thiểu là 1');
        return errors;
    };

    // gửi phê duyệt phiếu đề xuất nhập
    const handleSubmit = async () => {
        const errs = validate();
        if (errs.length) {
            toast.error(errs[0], styleMessage);
            return;
        }
        const payload = {
            code,
            date,
            creator,
            warehouse,
            reason,
            items: items.filter((i) => i.name || i.sku),
        };
        console.log('SUBMIT PDX:', payload); // Thực tế: gọi API backend
        try {
            const token = parseToken('tokenUser');
            const resCreate = await request.post(
                'api/proposal/create-proposal',
                {
                    proposalID: payload.code,
                    employeeIDCreate: payload.creator.empId,
                    warehouseID: payload.warehouse.warehouseID,
                    note: payload.reason,
                    proposalDetails: payload.items.map((it) => ({
                        proposalDetailID: generateCode('PRD-'),
                        productID: it.sku,
                        unitID: it.uom,
                        quantity: it.qty,
                    })),
                },
                {
                    headers: {
                        token: `Beare ${token.accessToken}`,
                        employeeid: token.employeeID,
                        warehouseid: payload.warehouse.warehouseID,
                    },
                },
            );
            if (resCreate.data.status == 'OK') {
                toast.success(resCreate.data.message, styleMessage);
                handleReset();
            }
        } catch (err) {
            toast.error(
                Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
                styleMessage,
            );
            console.log(err);
            return;
        }
    };

    const handleReset = () => {
        setCode('');
        setDate(todayISO());
        setReason('');
        setItems([]);
    };

    const openAndCloseQRCode = () => {
        setOpenModal((prev) => !prev);
    };

    const fetchProduct = async (productID) => {
        try {
            const token = parseToken('tokenUser');
            const [resProduct, resBatchUnit] = await Promise.all([
                request.get(`/api/product?productID=${productID}`, {
                    headers: {
                        token: `Beare ${token.accessToken}`,
                        employeeid: token.employeeID,
                        warehouse: warehouse.warehouseID,
                    },
                }),
                request.get(`api/batch/list-units`, {
                    params: {
                        warehouseID: warehouse.warehouseID,
                        productID: productID,
                    },
                    headers: {
                        token: `Beare ${token.accessToken}`,
                        employeeid: token.employeeID,
                    },
                }),
            ]);
            const { product } = resProduct.data;
            const newProduct = emptyItem();
            newProduct.sku = product.productID;
            newProduct.name = product.productName;
            newProduct.listUom = listUnitUOM;

            setItems((prev) => [...prev, newProduct]);
        } catch (err) {
            console.log(err);
            toast.error(err.response.data?.message || err.response.data?.messages[0], styleMessage);
            return;
        }
    };

    const handleSearchProduct = async (productID) => {
        if (productID) {
            const checkProductExist = items.find((it) => it.sku == productID);
            if (checkProductExist) {
                toast.error('Sản phẩm này đã tồn tại trong danh sách đề xuất', styleMessage);
                return;
            }
            await fetchProduct(productID);
            setProductIDSearch('');
        }
        return;
    };

    useEffect(() => {
        const fetchUnitUOM = async () => {
            try {
                const res = await request.get('/api/unit/get-all');
                const formatUnitUOM = res.data.data.map((it) => ({ unitID: it.unitID, unitName: it.unitName }));
                setListUnitUOM(formatUnitUOM);
            } catch (err) {
                console.log(err);
            }
        };
        fetchUnitUOM();
    }, []);

    useEffect(() => {
        if (currentUser) setCreator(currentUser);
    }, [currentUser]);

    useEffect(() => {
        if (warehouseCurrent) setWarehouse(warehouseCurrent);
    }, [warehouseCurrent]);

    useEffect(() => {
        if (qrCode != null) {
            fetchProduct(qrCode);
        }
    }, [qrCode]);

    return (
        <div className={cx('page')}>
            {/* Header */}
            <header className={cx('header')}>
                <div className={cx('headerLeft')}>
                    <h1 className={cx('title')}>Phiếu đề xuất xuất kho</h1>
                </div>
                <div className={cx('headerActions')}>
                    <Button outline borderRadiusMedium onClick={handleReset}>
                        <span>Làm mới</span>
                    </Button>
                    <Button success borderRadiusMedium onClick={handleSubmit}>
                        Gửi phê duyệt
                    </Button>
                </div>
            </header>

            <main className={cx('container')}>
                {/* Thông tin chung */}
                <section className={cx('card')}>
                    <h2 className={cx('cardTitle')}>Thông tin chung</h2>
                    <div className={cx('grid3')}>
                        <div className={cx('field')}>
                            <label>Mã phiếu</label>
                            <div className={cx('field-control')}>
                                <input
                                    placeholder="Tạo mã phiếu"
                                    readOnly={true}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                                <Button primary borderRadiusMedium onClick={() => setCode(generateCode('PDX-'))}>
                                    <span>Tạo mã phiếu</span>
                                </Button>
                            </div>
                        </div>
                        <div className={cx('field')}>
                            <label>Ngày lập</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                        <div className={cx('field')}>
                            <label>Kho nhập</label>
                            <input value={warehouse.warehouseName || ''} readOnly />
                        </div>
                        <div className={cx('field')}>
                            <label>Người lập phiếu</label>
                            <input placeholder="Nguyễn Văn A" value={creator.empName} readOnly />
                        </div>
                        <div className={cx('field', 'colSpan3')}>
                            <label>Ghi chú</label>
                            <textarea
                                rows={3}
                                placeholder="Nhập bổ sung, trả hàng NCC, nhập khuyến mãi..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                {/* Danh sách hàng hóa */}
                <section className={cx('card')}>
                    <div className={cx('cardHeader')}>
                        <h2 className={cx('cardTitle')}>Danh sách hàng hóa đề xuất nhập</h2>
                        <div className={cx('actions')}>
                            <Button primary small borderRadiusSmall onClick={openAndCloseQRCode}>
                                <span>Quét mã</span>
                            </Button>
                            {/* <Button primary small borderRadiusSmall onClick={addRow}>
                                <span>Thêm dòng</span>
                            </Button> */}
                        </div>
                    </div>

                    <div className={cx('search')}>
                        <div className={cx('input')}>
                            <input
                                placeholder="Nhập mã sản phẩm"
                                value={productIDSearch}
                                onChange={(e) => setProductIDSearch(e.target.value)}
                            />
                        </div>
                        <Search className={cx('icon')} size={22} onClick={() => handleSearchProduct(productIDSearch)} />
                    </div>

                    <div className={cx('tableWrap')}>
                        <table className={cx('table')}>
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Mã SP</th>
                                    <th>Tên SP</th>
                                    <th>Đơn vị tính</th>
                                    <th className={cx('num')}>Số lượng</th>
                                    <th>Ghi chú</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((it, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td>
                                                <input
                                                    value={it.sku}
                                                    onChange={(e) => updateCell(idx, 'sku', e.target.value)}
                                                    placeholder="Mã sản phẩm"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    value={it.name}
                                                    onChange={(e) => updateCell(idx, 'name', e.target.value)}
                                                    readOnly
                                                    placeholder="Tên sản phẩm"
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    // value={it.uom}
                                                    onChange={(e) => updateCell(idx, 'uom', e.target.value)}
                                                >
                                                    <option>-- Chọn đơn vị --</option>
                                                    {it.listUom.map((uom) => (
                                                        <option value={uom.unitID}>{uom.unitName}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className={cx('num')}>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={it.qty}
                                                    onChange={(e) => updateCell(idx, 'qty', e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key == '-') e.preventDefault();
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    value={it.note}
                                                    onChange={(e) => updateCell(idx, 'note', e.target.value)}
                                                    placeholder="Ghi chú"
                                                />
                                            </td>
                                            <td>
                                                <button
                                                    className={cx('iconBtn')}
                                                    onClick={() => removeRow(idx)}
                                                    title="Xóa dòng"
                                                >
                                                    ✕
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Tổng hợp */}
                    <div className={cx('summary')}>
                        <div>
                            <span className={cx('muted')}>Số mặt hàng: </span>
                            <b>{totals.unique}</b>
                        </div>
                        <div>
                            <span className={cx('muted')}>Tổng số lượng: </span>
                            <b>{currency(totals.totalQty)}</b>
                        </div>
                    </div>
                </section>
            </main>

            <footer className={cx('footer')}>
                <p>© {new Date().getFullYear()} Kho Hàng • Phiếu đề xuất nhập kho</p>
            </footer>

            {openModal && <QrReader setData={setQrCode} isOpenInfo={openModal} onClose={openAndCloseQRCode} />}
        </div>
    );
}
