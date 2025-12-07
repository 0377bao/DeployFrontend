// src/pages/Warehouse3D/Warehouse3D.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Plane, Text, Html, Box } from '@react-three/drei';
import useShelvesData from '@/hooks/useShelvesData';
import Shelf3D from '@/components/Shelf3D';
import TemporaryWarehouse from '../../components/TemporaryWarehouse';
import Forklift from '@/components/Forklift';
import BoxDetail from '../BatchPage/BoxDetail';
import UpdateLocation3D from '../BatchPage/UpdateLocation3D';
import ChangeLocation3D from '../BatchPage/ChangeLocation3D';
import { countBatchesWithoutLocation, getBoxContainBatch, getBoxContainProduct } from '../../services/batch.service';
import classNames from 'classnames/bind';
import styles from './Warehouse3D.module.scss';
import { Button } from '../../components';
import parseToken from '../../utils/parseToken';
import toast from 'react-hot-toast';
import { styleMessage } from '../../constants';

const cx = classNames.bind(styles);

export default function Warehouse3D() {
    const { shelvesData, loading, refetch } = useShelvesData();
    const [selectedBox, setSelectedBox] = useState(null);
    const [showWareHouseTemp, setShowWareHouseTemp] = useState(false);
    const [showUpdateLocation, setShowUpdateLocation] = useState(false);
    const [batchesUpdate, setBatchesUpdate] = useState([]);
    const [batchesMove, setBatchesMove] = useState([]);
    const [showChangeLocation, setShowChangeLocation] = useState(false);
    const [batchesWithoutLocation, setBatchesWithoutLocation] = useState(0);
    const [productIdFilter, setProductIdFilter] = useState('');
    const [batchFilter, setBatchFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('PRODUCT');
    const [searchResult, setSearchResult] = useState([]);
    const location = useLocation();

    // Tinh chỉnh để xếp các kệ theo 10 cột × 10 hàng (BX1-BX100)
    const getShelfPosition = (index) => {
        const col = Math.floor(index / 10);
        const row = index % 10; // hàng (0-9)
        const x = col * 5 + 12; // điều chỉnh vị trí ngang
        const z = -(row * 8 - 27);

        return [x, 0, z];
    };
    const fetchCountBatchesWithoutLocation = async () => {
        // Gọi API hoặc thực hiện các thao tác cần thiết khi component được gắn vào
        const res = await countBatchesWithoutLocation();
        if (res.data?.status === 'OK') {
            setBatchesWithoutLocation(res.data.data.count);
        }
    };

    const handleSearch = async () => {
        const warehouse = parseToken('warehouse');
        if (typeFilter === 'PRODUCT' && productIdFilter.trim() !== '') {
            const res = await getBoxContainProduct(warehouse.warehouseID, productIdFilter.trim().toUpperCase());
            if (res.data?.status === 'OK') {
                setSearchResult(res.data.data);
                console.log(res.data.data);

                if (res.data.data.length === 0) {
                    toast.success('Không có ô nào chứa sản phẩm này!', styleMessage);
                }
            }
        } else if (typeFilter === 'BATCH' && batchFilter.trim() !== '') {
            const res = await getBoxContainBatch(warehouse.warehouseID, batchFilter.trim().toUpperCase());
            if (res.data?.status === 'OK') {
                setSearchResult(res.data.data);
                if (res.data.data.length === 0) {
                    toast.success('Không có ô nào chứa lô này!', styleMessage);
                }
            }
        }
    };

    const handleReset = async () => {
        setProductIdFilter('');
        setBatchFilter('');
        setSearchResult([]);
    };

    const checkBoxExistsInSearchResult = (boxID) => {
        return searchResult.some((item) => item.boxID === boxID);
    };

    useEffect(() => {
        fetchCountBatchesWithoutLocation();
    }, []);

    useEffect(() => {
        if (location.state?.batchID && location.state?.type === 'BATCH') {
            setBatchFilter(location.state.batchID);
            setTypeFilter('BATCH');
            const fetchBatchLocation = async () => {
                const warehouse = parseToken('warehouse');
                const res = await getBoxContainBatch(
                    warehouse.warehouseID,
                    location.state.batchID.trim().toUpperCase(),
                );
                if (res.data?.status === 'OK') {
                    setSearchResult(res.data.data);
                    if (res.data.data.length === 0) {
                        toast.success('Không có ô nào chứa lô này!', styleMessage);
                    }
                }
            };
            fetchBatchLocation();
        }
    }, [location.state]);

    return (
        <div
            style={{
                width: '100%',
                height: `calc(100vh - 70px)`,
                overflow: 'hidden',
                position: 'relative',
                background: '#f0f0f0',
                marginTop: '-10px',
            }}
        >
            {/* Legend + nút đóng popup (HTML overlay góc trái) */}
            <div className={cx('legend-container')}>
                <div style={{ fontWeight: '700', marginBottom: 6 }}>Mô tả</div>
                <div className={cx('legend-item')}>
                    <div className={cx('legend-color')} style={{ background: '#a3e4d7' }} />{' '}
                    <span>Trống hoàn toàn</span>
                </div>
                <div className={cx('legend-item')}>
                    <div className={cx('legend-color')} style={{ background: '#58d68d' }} /> <span>Còn nhiều chỗ</span>
                </div>
                <div className={cx('legend-item')}>
                    <div className={cx('legend-color')} style={{ background: '#f5b041' }} /> <span>Còn một nửa</span>
                </div>
                <div className={cx('legend-item')}>
                    <div className={cx('legend-color')} style={{ background: '#e74c3c' }} /> <span>Sắp hết chỗ</span>
                </div>
            </div>

            <div className={cx('search-container')}>
                {typeFilter === 'PRODUCT' ? (
                    <div className={cx('form-group')}>
                        <label htmlFor="productId">Mã sản phẩm</label>
                        <input
                            type="text"
                            id="productId"
                            className={cx('form-input')}
                            placeholder={`Nhập mã sản phẩm`}
                            value={productIdFilter}
                            onChange={(e) => setProductIdFilter(e.target.value)}
                        />
                    </div>
                ) : (
                    <div className={cx('form-group')}>
                        <label htmlFor="productId">Mã lô</label>
                        <input
                            type="text"
                            id="productId"
                            className={cx('form-input')}
                            placeholder={`Nhập mã lô`}
                            value={batchFilter}
                            onChange={(e) => setBatchFilter(e.target.value)}
                        />
                    </div>
                )}
                <div className={cx('form-group')}>
                    <label htmlFor="typeFilter">Tìm kiếm theo</label>
                    <select
                        id="typeFilter"
                        value={typeFilter}
                        onChange={(e) => {
                            setProductIdFilter('');
                            setBatchFilter('');
                            setTypeFilter(e.target.value);
                        }}
                    >
                        <option disabled></option>
                        {[
                            { name: 'Sản phẩm', value: 'PRODUCT' },
                            { name: 'Lô', value: 'BATCH' },
                        ].map((opt) => (
                            <option key={opt.name} value={opt.value}>
                                {opt.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={cx('form-actions')}>
                    <Button primary medium className={cx('btn-search')} onClick={handleSearch}>
                        Tìm kiếm
                    </Button>
                    <Button primary medium className={cx('btn-search')} onClick={handleReset}>
                        Đặt lại
                    </Button>
                </div>
            </div>

            <Canvas camera={{ position: [0, 60, 120], fov: 50 }}>
                <OrbitControls enableRotate={false} enableZoom enablePan />
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 30, 10]} intensity={1} castShadow />

                <OrbitControls enablePan enableZoom enableRotate />

                {/* Sàn kho (nhìn giống viền trong hình) */}
                <Plane args={[80, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#ffffff" />
                </Plane>

                {/* Khu vực kho tạm - bên trái */}
                <TemporaryWarehouse
                    batchesWithoutLocation={batchesWithoutLocation}
                    setShowWareHouseTemp={setShowWareHouseTemp}
                    position={[-31, 0, -7]}
                    scale={5}
                />

                {/* Khu hàng chờ xuất (dưới trái) */}
                <Plane args={[36, 12]} rotation={[-Math.PI / 2, 0, 0]} position={[-22, 0.02, 44]}>
                    <meshStandardMaterial color="#e0ffff" />
                </Plane>
                <Text position={[-22, 0.03, 44]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1} color="#111">
                    KHU VỰC XUẤT HÀNG
                </Text>

                {/* Khu chờ nhập (dưới phải) */}
                <Plane args={[36, 12]} rotation={[-Math.PI / 2, 0, 0]} position={[22, 0.02, 44]}>
                    <meshStandardMaterial color="#ffe0b3" />
                </Plane>
                <Text position={[22, 0.03, 44]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1} color="#111">
                    KHU VỰC NHẬP HÀNG
                </Text>

                {/* Mũi tên - hướng di chuyển (tạo từ Box + triangle using plane) */}
                <group position={[0, 0.05, 8]}>
                    <mesh position={[9.5, 0.05, 26]}>
                        <boxGeometry args={[61, 0.1, 5]} />
                        <meshStandardMaterial color="#bdbdbd" />
                    </mesh>
                    <mesh position={[-18.5, 0.05, -16.5]}>
                        <boxGeometry args={[5, 0.1, 83]} />
                        <meshStandardMaterial color="#bdbdbd" />
                    </mesh>
                    <mesh position={[0, 0.05, 35]}>
                        <boxGeometry args={[5, 0.1, 14]} />
                        <meshStandardMaterial color="#bdbdbd" />
                    </mesh>
                    {/* Xe nâng trong khu đường băng trắng */}
                    <Forklift position={[47, 0.1, -245]} scale={5} rotation={[0, -Math.PI / 2, 0]} />
                </group>

                {/* Nếu loading thì hiển thị text */}
                {loading && (
                    <Text position={[0, 1, 0]} fontSize={1.2} color="#333">
                        Đang tải dữ liệu...
                    </Text>
                )}

                {/* Render các shelf theo shelvesData */}
                {!loading &&
                    shelvesData?.map((shelf, idx) => (
                        <Shelf3D
                            checkBoxExistsInSearchResult={
                                searchResult.length !== 0 ? checkBoxExistsInSearchResult : null
                            }
                            key={shelf.shelfID}
                            shelf={shelf}
                            position={getShelfPosition(idx)}
                            onBoxSelect={(box) => setSelectedBox(box.boxID)}
                            shelfConfig={{ boxSpacing: 1.6, floorHeight: 4 }}
                        />
                    ))}
            </Canvas>

            <BoxDetail
                isOpen={showWareHouseTemp}
                onClose={() => setShowWareHouseTemp(false)}
                setShowUpdateLocation={setShowUpdateLocation}
                setBatchesUpdate={setBatchesUpdate}
            />

            <BoxDetail
                isOpen={!!selectedBox}
                onClose={() => setSelectedBox(null)}
                boxID={selectedBox}
                setBatchesUpdate={setBatchesMove}
                setShowChangeLocation={setShowChangeLocation}
            />
            <UpdateLocation3D
                isOpen={showUpdateLocation}
                onClose={() => setShowUpdateLocation(false)}
                batches={batchesUpdate}
                shelvesData={shelvesData}
                fetchData={refetch}
                fetchCountBatchesWithoutLocation={fetchCountBatchesWithoutLocation}
            />
            <ChangeLocation3D
                isOpen={showChangeLocation}
                onClose={() => setShowChangeLocation(false)}
                batches={batchesMove}
                shelvesData={shelvesData}
                fetchData={refetch}
            />
        </div>
    );
}
