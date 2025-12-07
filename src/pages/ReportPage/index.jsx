import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './ReportPage.module.scss';
import { Printer } from 'lucide-react';
import { Button } from '../../components';
import { getReportStockWarehouse } from '../../services/report.service';
import { useReactToPrint } from 'react-to-print';

const cx = classNames.bind(styles);

const columns = [
    { title: 'STT', key: 'stt', width: 50 },
    { title: 'Nhóm Sản Phẩm', key: 'group', width: 110 },
    { title: 'Mã sản phẩm', key: 'code', width: 110 },
    { title: 'Sản phẩm', key: 'name', width: 220 },
    { title: 'ĐVT báo cáo', key: 'reportUnit', width: 100 },
    { title: 'ĐVT cơ bản', key: 'baseUnit', width: 100 },
    // Tồn kho trên báo cáo
    { title: 'SL ĐVT báo cáo', key: 'warehouseQty', width: 90 },
    { title: 'SL ĐVT cơ bản', key: 'warehouseBaseQty', width: 90 },
    //  { title: 'Doanh số', key: 'warehouseSales', width: 90 },
    // Hàng đang giữ của giao dịch bán hàng
    // { title: 'SL ĐVT báo cáo', key: 'orderQty', width: 90 },
    // { title: 'SL ĐVT cơ bản', key: 'orderBaseQty', width: 90 },
    // { title: 'Doanh số', key: 'orderSales', width: 90 },
    // Tồn kho có thể bán
    // { title: 'SL ĐVT báo cáo', key: 'availableQty', width: 90 },
    // { title: 'SL ĐVT cơ bản', key: 'availableBaseQty', width: 90 },
    // { title: 'Doanh số', key: 'availableSales', width: 90 },
];

const DEFAULT_NAME = 'CÔNG TY TNHH BẢO YYSC';
const DEFAULT_ADDRESS = 'Số 111 trương công định, phường 10, tân bình, Tp.Hồ Chí Minh';

const ReportPage = () => {
    const [dataReport, setDataReport] = useState([]);
    const [quarterCurrent, setQuarterCurrent] = useState(Math.floor(new Date().getMonth() / 3) + 1);
    const yearCurrent = new Date().getFullYear();
    const [totalSummary, setTotalSummary] = useState({
        totalAmountBaseUnit: 0,
        totalAmountBaseReport: 0,
    });
    const contentRef = useRef();
    const reactToPrintFn = useReactToPrint({ contentRef });

    useEffect(() => {
        const fetchDataReport = async (quarter, year) => {
            try {
                const res = await getReportStockWarehouse({ quarter, year });
                if (res.status == 'OK') {
                    const formatData = res.data.map((it, index) => {
                        return {
                            stt: index + 1,
                            group: it.product.category.categoryName || '',
                            code: it.productID || '',
                            name: it.productName || '',
                            reportUnit: it.unit.unitName || '',
                            baseUnit: it.product.baseUnitProducts.baseUnitName || '',
                            warehouseQty: Number.parseInt(it.totalRemain) || 0,
                            warehouseBaseQty:
                                Number.parseInt(it.totalRemain) * Number.parseInt(it.unit.conversionQuantity) || 0,
                            // warehouseSales: '-',
                            // orderQty: 13,
                            // orderBaseQty: 14,
                            // orderSales: '-',
                            // availableQty: 72,
                            // availableBaseQty: 10,
                            // availableSales: '-',
                            // price: '',
                        };
                    });
                    const totalBaseUnit = formatData.reduce((t, cur) => t + cur?.warehouseQty || 0, 0);
                    const totalBaseReport = formatData.reduce((t, cur) => t + cur.warehouseBaseQty || 0, 0);
                    setDataReport(formatData);
                    setTotalSummary({
                        totalAmountBaseReport: totalBaseReport,
                        totalAmountBaseUnit: totalBaseUnit,
                    });
                }
            } catch (err) {
                return;
            }
        };
        fetchDataReport(Number.parseInt(quarterCurrent), yearCurrent);
    }, [quarterCurrent, yearCurrent]);

    return (
        <div className={cx('wrapper-report')}>
            <div className={cx('header')}>
                <div className={cx('header-info')}>
                    <div>
                        Tên cửa hàng: <strong>{DEFAULT_NAME}</strong>
                    </div>
                    <div>
                        Địa chỉ cửa hàng: <strong>{DEFAULT_ADDRESS}</strong>
                    </div>
                    <div>
                        Tên báo cáo: <strong>Báo Cáo Tồn Kho</strong>
                    </div>
                </div>
                <div className={cx('header-action')}>
                    <p className={cx('filter-action')}>
                        <span>Lọc theo quý: </span>
                        <select value={quarterCurrent} onChange={(e) => setQuarterCurrent(e.target.value)}>
                            <option value="1">Quý 1</option>
                            <option value="2">Quý 2</option>
                            <option value="3">Quý 3</option>
                            <option value="4">Quý 4</option>
                        </select>
                    </p>
                    <Button
                        success
                        medium
                        rounded
                        leftIcon={<Printer size={16} />}
                        onClick={() => {
                            reactToPrintFn();
                        }}
                    >
                        <span>In báo cáo</span>
                    </Button>
                </div>
            </div>

            <div ref={contentRef} className={cx('table-wrap')}>
                <h1 className={cx('report-title')}>BÁO CÁO TỒN KHO</h1>
                <table>
                    <thead>
                        <tr>
                            <th rowSpan={2}>STT</th>
                            <th rowSpan={2}>Nhóm Sản Phẩm</th>
                            <th rowSpan={2}>Mã sản phẩm</th>
                            <th rowSpan={2}>Sản phẩm</th>
                            <th rowSpan={2}>ĐVT báo cáo</th>
                            <th rowSpan={2}>ĐVT cơ bản</th>
                            <th colSpan={3} className={cx('section-header')}>
                                Tồn kho thực tế
                                <br />
                                {/* <span>A = SUM WAREHOUSE</span> */}
                            </th>
                            {/* <th colSpan={3} className={cx('section-header')}>
                                Hàng đang giữ của giao dịch bán hàng
                                <br />
                                <span>B = SUM ĐƠN ĐẶT HÀNG</span>
                            </th>
                            <th colSpan={3} className={cx('section-header')}>
                                Tồn Kho Có Thể Bán
                                <br />
                                <span>C = A - B</span>
                            </th> */}
                        </tr>
                        <tr>
                            <th>SL ĐVT báo cáo</th>
                            <th>SL ĐVT cơ bản</th>
                            {/* <th>SL ĐVT báo cáo</th>
                            <th>SL ĐVT cơ bản</th>
                            <th>Doanh số</th>
                            <th>SL ĐVT báo cáo</th>
                            <th>SL ĐVT cơ bản</th>
                            <th>Doanh số</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {dataReport.map((row, idx) => (
                            <tr key={idx}>
                                {columns.map((col) => (
                                    <td key={col.key}>{row[col.key]}</td>
                                ))}
                            </tr>
                        ))}
                        {dataReport.length > 0 ? (
                            <tr className={cx('total-row')}>
                                <td colSpan={6}>
                                    <strong>Tổng:</strong>
                                </td>
                                <td>
                                    <strong>{totalSummary.totalAmountBaseUnit}</strong>
                                </td>
                                <td>
                                    <strong>{totalSummary.totalAmountBaseReport}</strong>
                                </td>
                            </tr>
                        ) : (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center' }}>
                                    Không có dữ liệu
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportPage;
