import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './GoodsReceiptRequest.module.scss';
import { Button } from '../../../components';
import { generateCode } from '../../../utils/generate';
import { useSelector } from 'react-redux';
import QrReader from '../../../components/QrReader';
import request, { post } from '../../../utils/httpRequest';
import parseToken from '../../../utils/parseToken';
import toast from 'react-hot-toast';
import { styleMessage } from '../../../constants';
import { Icon, Search } from 'lucide-react';
import { authIsAdmin } from '../../../common';
import { QrCode } from 'lucide-react';
import Printer from '../../../components/Printer';
import { QRCode } from 'antd';

const cx = classNames.bind(styles);

const currency = (n) => (isNaN(n) ? '0' : new Intl.NumberFormat('vi-VN').format(Number(n)));
const todayISO = () => new Date().toISOString().slice(0, 10);
const emptyItem = () => ({ sku: '', name: '', uom: '', qty: 1, note: '', listUom: [] });

export default function GoodsReceiptRequest({ typeDetail = false, proposalDetailID = null, onClose, handleSearch }) {
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
    const [proposalDetail, setProposalDetail] = useState({});
    const [proposalDetails, setProposalDetails] = useState([]);

    const totals = useMemo(() => {
        let totalQty = 0;
        let unique = 0;
        if (typeDetail) {
            totalQty = proposalDetails.reduce((s, i) => s + i.quantity * i.unit?.conversionQuantity, 0);
            unique = proposalDetails.filter((i) => i.product?.productName?.trim()).length;
        } else {
            totalQty = items.reduce(
                (s, i) =>
                    s +
                    (Number(i.qty) *
                        Number(i.listUom.find((ix) => ix.unitID == Number.parseInt(i.uom))?.unitName.slice(-2)) || 0),
                0,
            );
            unique = items.filter((i) => i.name?.trim()).length;
        }
        return { totalQty, unique };
    }, [items, proposalDetail]);

    const addRow = () => setItems((prev) => [...prev, emptyItem()]);
    const removeRow = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));
    const updateCell = (idx, key, val) =>
        setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));

    const validate = () => {
        const errors = [];
        if (!code) errors.push('Vui lòng tạo mã phiếu nhập kho');
        if (items.length === 0) errors.push('Danh sách hàng hóa đang trống');
        const checkRow = items.every((row) => row.sku && row.name && row.uom && Number(row.qty) > 0);
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
            items: items.filter((i) => i.name || i.sku).map((i) => ({ ...i, proposalDetailID: generateCode('PRD-') })),
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
                        //proposalDetailID: it.proposalDetailID,
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
                onClose();
                handleSearch();
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

    const handleApproveProposal = async (proposalID, status = 'APPROVED') => {
        try {
            const token = parseToken('tokenUser');
            const res = await post(
                '/api/proposal/update-status-proposal',
                {
                    proposalID,
                    employeeIDApproval: token.employeeID,
                    status,
                },
                token.accessToken,
                token.employeeID,
            );
            // console.log(res)
            toast.success(res.message, styleMessage);
            onClose();
            handleSearch();
        } catch (err) {
            console.log(err);
            toast.error(err.response.data.message, styleMessage);
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
        if (typeDetail) {
            if (productID !== '') {
                const productFind = proposalDetail?.proposalDetails.find((it) => it.product.productID == productID);
                setProposalDetails(productFind ? [productFind] : []);
            } else {
                setProposalDetails(proposalDetail.proposalDetails);
            }
        } else {
            if (productID) {
                const checkProductExist = items.find((it) => it.sku == productID);
                if (checkProductExist) {
                    toast.error('Sản phẩm này đã tồn tại trong danh sách đề xuất', styleMessage);
                    return;
                }
                await fetchProduct(productID);
                setProductIDSearch('');
            }
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
        const fetchProposalDetail = async () => {
            try {
                const token = parseToken('tokenUser');
                const res = await request.get(`/api/proposal/get-proposal-detail/${proposalDetailID}`, {
                    headers: {
                        token: `Bearer ${token.accessToken}`,
                        employeeid: token.employeeID,
                    },
                });
                setProposalDetail(res.data.proposal);
                setProposalDetails(res.data.proposal.proposalDetails);
            } catch (err) {
                console.log(err);
            }
        };
        if (typeDetail && proposalDetailID) {
            fetchProposalDetail();
        }
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

    const createdAt = proposalDetail?.createdAt ? new Date(proposalDetail.createdAt).toISOString().split('T')[0] : '';

    const handleShowProposalDetail = (items, isPrinter = false) => {
        if (items) {
            return items.map((it, idx) => {
                return (
                    <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>
                            {/* <input
                                value={typeDetail ? it.product?.productID || '' : it.sku || ''}
                                onChange={(e) => updateCell(idx, 'sku', e.target.value)}
                                placeholder="Mã sản phẩm"
                                readOnly={typeDetail}
                                className={cx('readOnly')}
                            /> */}
                            <span>{typeDetail ? it.product?.productID || '' : it.sku || ''}</span>
                        </td>
                        <td>
                            {/* <input
                                value={typeDetail ? it.product?.productName || '' : it.name || ''}
                                onChange={(e) => updateCell(idx, 'name', e.target.value)}
                                readOnly
                                placeholder="Tên sản phẩm"
                                className={cx('readOnly')}
                            /> */}
                            <span>{typeDetail ? it.product?.productName || '' : it.name || ''}</span>
                        </td>
                        <td>
                            {!isPrinter ? (
                                <select
                                    value={typeDetail ? it.unit?.unitID || '' : it.uom || ''}
                                    onChange={(e) => updateCell(idx, 'uom', e.target.value)}
                                    className={cx(typeDetail ? 'readOnly' : '')}
                                >
                                    <option>-- Chọn đơn vị --</option>
                                    {typeDetail ? (
                                        <option value={it.unit.unitID}>{it.unit.unitName}</option>
                                    ) : (
                                        it.listUom.map((uom) => <option value={uom.unitID}>{uom.unitName}</option>)
                                    )}
                                </select>
                            ) : (
                                <span>{typeDetail ? it.unit?.unitName || '' : it.uomName || ''}</span>
                            )}
                        </td>
                        <td className={cx('num')}>
                            {!isPrinter ? (
                                <input
                                    type="number"
                                    min={1}
                                    value={typeDetail ? it.quantity || '' : it.qty || ''}
                                    onChange={(e) => updateCell(idx, 'qty', e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key == '-') e.preventDefault();
                                    }}
                                    readOnly={typeDetail}
                                    className={cx(typeDetail ? 'readOnly' : '')}
                                />
                            ) : (
                                <span>{typeDetail ? it.quantity || '' : it.qty || ''}</span>
                            )}
                        </td>
                        <td>
                            {!isPrinter ? (
                                <input
                                    value={typeDetail ? it.note || 'Không có ghi chú' : it.note || ''}
                                    onChange={(e) => updateCell(idx, 'note', e.target.value)}
                                    placeholder="Ghi chú"
                                    className={cx(typeDetail ? 'readOnly' : '')}
                                />
                            ) : (
                                <span>{typeDetail ? it.note || 'Không có ghi chú' : it.note || ''}</span>
                            )}
                        </td>
                        {!isPrinter && (
                            <td>
                                {!typeDetail && (
                                    <button className={cx('iconBtn')} onClick={() => removeRow(idx)} title="Xóa dòng">
                                        ✕
                                    </button>
                                )}
                            </td>
                        )}

                        <td>
                            {proposalDetail.status === 'APPROVED' && typeDetail && (
                                <div className={cx('batch-qrCode')}>
                                    <span>{it?.batchID}</span>
                                </div>
                            )}
                        </td>
                    </tr>
                );
            });
        }
    };

    const renderPrinter = (
        label = 'In phiếu đề xuất',
        Icon = <QrCode size={24} />,
        propsButton = { success: true, borderRadiusSmall: true, small: true },
    ) => {
        return (
            <Printer buttonLabel={label} Icon={Icon} propsButton={propsButton}>
                <div className={cx('page')}>
                    {/* Header */}
                    <header className={cx('header')}>
                        <div className={cx('headerLeft')}>
                            <h1 className={cx('title')}>Phiếu đề xuất nhập kho</h1>
                        </div>
                    </header>

                    <main className={cx('container')}>
                        {/* Thông tin chung */}
                        <section className={cx('card')}>
                            <h2 className={cx('cardTitle')}>Thông tin chung</h2>
                            <div className={cx('grid4')}>
                                <div className={cx('field')}>
                                    <label>Mã phiếu</label>
                                    <div className={cx('field-control')}>
                                        <input
                                            placeholder="Tạo mã phiếu"
                                            readOnly={true}
                                            value={typeDetail ? proposalDetail.proposalID || '' : code || ''}
                                            onChange={(e) => setCode(e.target.value)}
                                            className={cx(typeDetail ? 'readOnly' : '')}
                                        />
                                        {!typeDetail && (
                                            <Button
                                                small
                                                primary
                                                borderRadiusSmall
                                                onClick={() => setCode(generateCode('PDX-'))}
                                            >
                                                <span>Tạo mã phiếu</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className={cx('field')}>
                                    <label>Ngày tạo phiếu</label>
                                    <input
                                        type="date"
                                        value={typeDetail ? createdAt : date}
                                        readOnly
                                        className={cx('readOnly')}
                                    />
                                </div>
                                <div className={cx('field')}>
                                    <label>Kho nhập</label>
                                    <input
                                        value={
                                            typeDetail
                                                ? proposalDetail?.warehouse?.warehouseName || ''
                                                : warehouse.warehouseName || ''
                                        }
                                        readOnly
                                        className={cx('readOnly')}
                                    />
                                </div>
                                <div className={cx('field')}>
                                    <label>Người lập phiếu</label>
                                    <input
                                        value={
                                            typeDetail
                                                ? proposalDetail?.employeeCreate?.employeeName || ''
                                                : creator.empName || ''
                                        }
                                        readOnly
                                        className={cx('readOnly')}
                                    />
                                </div>
                                <div className={cx('field', 'colSpan4')}>
                                    <label>Ghi chú</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Nhập bổ sung, trả hàng NCC, nhập khuyến mãi..."
                                        value={typeDetail ? proposalDetail.note || 'Không có ghi chú' : reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        readOnly={typeDetail}
                                        className={cx(typeDetail ? 'readOnly' : '')}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Danh sách hàng hóa */}
                        <section className={cx('card')}>
                            <div className={cx('cardHeader')}>
                                <h2 className={cx('cardTitle')}>Danh sách hàng hóa đề xuất nhập</h2>
                            </div>

                            <div className={cx('tableWrap')}>
                                <table className={cx('table')}>
                                    <thead>
                                        <tr>
                                            <th className={cx('stt')}>STT</th>
                                            <th className={cx('productID')}>Mã SP</th>
                                            <th className={cx('productName')}>Tên SP</th>
                                            <th className={cx('unit')}>Đơn vị tính</th>
                                            <th className={cx('num')}>Số lượng</th>
                                            <th className={cx('note')}>Ghi chú </th>
                                            <th className={cx('qr')}>Mã lô đề xuất</th>
                                        </tr>
                                    </thead>
                                    <tbody>{handleShowProposalDetail(proposalDetails, true)}</tbody>
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
                        <div className={cx('layout-qrCode')}>
                            <p>QR CODE Phiếu Đề Xuất Nhập Kho</p>
                            <img
                                src={
                                    proposalDetail?.qrCode ||
                                    'https://support.thinkific.com/hc/article_attachments/360042081334/5d37325ea1ff6.png'
                                }
                                alt="qrCode"
                            />
                        </div>
                    </footer>
                </div>
            </Printer>
        );
    };

    const renderPrinterBatchQRCode = (items) => {
        return (
            <Printer
                buttonLabel={'In mã lô'}
                Icon={<QrCode size={20} />}
                propsButton={{ primary: true, small: true, borderRadiusSmall: true }}
            >
                <div className={cx('layout-multiple-qrCode')}>
                    {items.map(
                        (item, index) =>
                            item?.batch?.qrCode && (
                                <div key={index} className={cx('qr-item')}>
                                    <img src={item.batch.qrCode} alt={`QR Code ${item.batchID}`} />
                                    <p>
                                        {item.productID}-{item.product.productName}
                                    </p>
                                    <p>{item.batchID}</p>
                                </div>
                            ),
                    )}
                </div>
            </Printer>
        );
    };

    return (
        <div className={cx('page')}>
            {/* Header */}
            <header className={cx('header')}>
                <div className={cx('headerLeft')}>
                    <h1 className={cx('title')}>Phiếu đề xuất nhập kho</h1>
                </div>
                {!typeDetail && (
                    <div className={cx('headerActions')}>
                        <Button outline borderRadiusMedium onClick={handleReset}>
                            <span>Làm mới</span>
                        </Button>
                        <Button success borderRadiusMedium onClick={handleSubmit}>
                            Gửi phê duyệt
                        </Button>
                    </div>
                )}
                {typeDetail && proposalDetail?.status === 'PENDING' && authIsAdmin(currentUser) && (
                    <div>
                        <Button success onClick={() => handleApproveProposal(proposalDetail.proposalID, 'APPROVED')}>
                            <span>Chấp nhận</span>
                        </Button>
                        <Button error onClick={() => handleApproveProposal(proposalDetail.proposalID, 'REFUSE')}>
                            <span>Từ chối</span>
                        </Button>
                    </div>
                )}
                {typeDetail && proposalDetail?.status === 'APPROVED' && <div>{renderPrinter()}</div>}
            </header>

            <main className={cx('container')}>
                {/* Thông tin chung */}
                <section className={cx('card')}>
                    <h2 className={cx('cardTitle')}>Thông tin chung</h2>
                    <div className={cx('grid4')}>
                        <div className={cx('field')}>
                            <label>Mã phiếu</label>
                            <div className={cx('field-control')}>
                                <input
                                    placeholder="Tạo mã phiếu"
                                    readOnly={true}
                                    value={typeDetail ? proposalDetail.proposalID || '' : code || ''}
                                    onChange={(e) => setCode(e.target.value)}
                                    className={cx(typeDetail ? 'readOnly' : '')}
                                />
                                {!typeDetail && (
                                    <Button
                                        small
                                        primary
                                        borderRadiusSmall
                                        onClick={() => setCode(generateCode('PDX-'))}
                                    >
                                        <span>Tạo mã phiếu</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className={cx('field')}>
                            <label>Ngày tạo phiếu</label>
                            <input
                                type="date"
                                value={typeDetail ? createdAt : date}
                                readOnly
                                className={cx('readOnly')}
                            />
                        </div>
                        <div className={cx('field')}>
                            <label>Kho nhập</label>
                            <input
                                value={
                                    typeDetail
                                        ? proposalDetail?.warehouse?.warehouseName || ''
                                        : warehouse.warehouseName || ''
                                }
                                readOnly
                                className={cx('readOnly')}
                            />
                        </div>
                        <div className={cx('field')}>
                            <label>Người lập phiếu</label>
                            <input
                                value={
                                    typeDetail
                                        ? proposalDetail?.employeeCreate?.employeeName || ''
                                        : creator.empName || ''
                                }
                                readOnly
                                className={cx('readOnly')}
                            />
                        </div>
                        <div className={cx('field', 'colSpan4')}>
                            <label>Ghi chú</label>
                            <textarea
                                rows={3}
                                placeholder="Nhập bổ sung, trả hàng NCC, nhập khuyến mãi..."
                                value={typeDetail ? proposalDetail.note || 'Không có ghi chú' : reason}
                                onChange={(e) => setReason(e.target.value)}
                                readOnly={typeDetail}
                                className={cx(typeDetail ? 'readOnly' : '')}
                            />
                        </div>
                    </div>
                </section>

                {/* Danh sách hàng hóa */}
                <section className={cx('card')}>
                    <div className={cx('cardHeader')}>
                        <h2 className={cx('cardTitle')}>Danh sách hàng hóa đề xuất nhập</h2>
                        <div className={cx('actions')}>
                            {!typeDetail && (
                                <Button primary small borderRadiusSmall onClick={openAndCloseQRCode}>
                                    <span>Quét mã</span>
                                </Button>
                            )}
                            {/* <Button primary small borderRadiusSmall onClick={addRow}>
                                <span>Thêm dòng</span>
                            </Button> */}
                        </div>
                    </div>

                    <div className={cx('search')}>
                        <div className={cx('searchLeft')}>
                            <div className={cx('input')}>
                                <input
                                    placeholder="Nhập mã sản phẩm"
                                    value={productIDSearch}
                                    onChange={(e) => setProductIDSearch(e.target.value)}
                                />
                            </div>
                            <Button
                                primary
                                medium
                                borderRadiusSmall
                                className={cx('btn-filter')}
                                onClick={() => handleSearchProduct(productIDSearch)}
                            >
                                Tìm kiếm
                            </Button>
                        </div>
                        {typeDetail &&
                            proposalDetail?.status === 'APPROVED' &&
                            renderPrinterBatchQRCode(proposalDetails)}
                    </div>

                    <div className={cx('tableWrap')}>
                        <table className={cx('table')}>
                            <thead>
                                <tr>
                                    <th className={cx('stt')}>STT</th>
                                    <th className={cx('productID')}>Mã SP</th>
                                    <th className={cx('productName')}>Tên SP</th>
                                    <th className={cx('unit')}>Đơn vị tính</th>
                                    <th className={cx('num')}>Số lượng</th>
                                    <th className={cx('note')}>Ghi chú </th>
                                    <th></th>
                                    {proposalDetail.status == 'APPROVED' ? (
                                        <th className={cx('qr')}>Mã lô đề xuất</th>
                                    ) : (
                                        <th></th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {typeDetail
                                    ? handleShowProposalDetail(proposalDetails)
                                    : handleShowProposalDetail(items)}
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

            {openModal && (
                <QrReader data={items} setData={setQrCode} isOpenInfo={openModal} onClose={openAndCloseQRCode} />
            )}
        </div>
    );
}
