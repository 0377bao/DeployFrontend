import { Button, Modal } from '../../../components';
import classNames from 'classnames/bind';
import styles from './UpdateLocation3D.module.scss';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { styleMessage } from '../../../constants';
import { updateLocationBatch } from '../../../services/batchBox.service';
import parseToken from '../../../utils/parseToken';
import Shelf3D from '../../../components/Shelf3D';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Plane, Text, Html, Box } from '@react-three/drei';
import ModalSuggestLocation from './ModalSuggestLocation';
import { handleCopy } from '../../../common';
const cx = classNames.bind(styles);

const UpdateLocation3D = ({ isOpen, onClose, shelvesData, batches, fetchData, fetchCountBatchesWithoutLocation }) => {
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [locations, setLocations] = useState([]);
    const [localBatches, setLocalBatches] = useState([]);
    const [localShelves, setLocalShelves] = useState([]);
    const [showModalSuggestLocation, setShowModalSuggestLocation] = useState(false);
    // Tinh chỉnh để xếp các kệ theo 10 cột × 10 hàng (BX1-BX100)
    const getShelfPosition = (index) => {
        const col = Math.floor(index / 10);
        const row = index % 10; // hàng (0-9)
        const x = col * 5; // điều chỉnh vị trí ngang
        const z = -(row * 8 - 37);

        return [x, 0, z];
    };

    useEffect(() => {
        setLocations(batches.map((item) => ({ batchID: item.batchID, locations: [] })));
        setLocalBatches(batches.map((b) => ({ ...b })));
        setLocalShelves(handleCopy(shelvesData));
    }, [batches, shelvesData]);

    const handleCheckboxChange = (batchID) => {
        setSelectedBatch(batchID);
    };

    const handleClickBox = (box) => {
        if (selectedBatch) {
            const batchLocation = locations.find((item) => item.batchID == selectedBatch);
            const batchFind = localBatches.find((item) => item.batchID === selectedBatch);
            const totalVolume = batchFind.unit.length * batchFind.unit.width * batchFind.unit.height;

            if (!batchLocation?.locations?.find((loc) => loc.boxID === box.boxID)) {
                const quantityCanAdd = Math.floor(box.remainingAcreage / totalVolume);
                let boxToAdd;
                let acreage;

                if (quantityCanAdd > batchFind.remainAmount) {
                    boxToAdd = { ...box, quantity: batchFind.remainAmount };
                    acreage = batchFind.remainAmount * totalVolume;
                    setLocalBatches((prevBatches) =>
                        prevBatches.map((b) => (b.batchID === selectedBatch ? { ...b, remainAmount: 0 } : b)),
                    );
                } else {
                    boxToAdd = { ...box, quantity: quantityCanAdd };
                    acreage = quantityCanAdd * totalVolume;
                    setLocalBatches((prevBatches) =>
                        prevBatches.map((b) =>
                            b.batchID === selectedBatch ? { ...b, remainAmount: b.remainAmount - quantityCanAdd } : b,
                        ),
                    );
                }
                setLocalShelves((prevShelves) =>
                    prevShelves.map((shelf) => ({
                        ...shelf,
                        floor: shelf.floor.map((col) => ({
                            ...col,
                            boxes: col.boxes.map((b) =>
                                b.boxID === box.boxID ? { ...b, remainingAcreage: b.remainingAcreage - acreage } : b,
                            ),
                        })),
                    })),
                );
                // Nếu chưa có thì thêm
                setLocations((prevLocations) =>
                    prevLocations.map((item) =>
                        item.batchID === selectedBatch ? { ...item, locations: [...item.locations, boxToAdd] } : item,
                    ),
                );
            } else {
                const quantityCanAdd = batchLocation.locations.find((loc) => loc.boxID === box.boxID).quantity;

                setLocalShelves((prevShelves) =>
                    prevShelves.map((shelf) => ({
                        ...shelf,
                        floor: shelf.floor.map((col) => ({
                            ...col,
                            boxes: col.boxes.map((b) =>
                                b.boxID === box.boxID
                                    ? { ...b, remainingAcreage: b.remainingAcreage + quantityCanAdd * totalVolume }
                                    : b,
                            ),
                        })),
                    })),
                );
                // Cập nhật lại số lượng trong lô
                setLocalBatches((prevBatches) =>
                    prevBatches.map((b) =>
                        b.batchID === selectedBatch ? { ...b, remainAmount: b.remainAmount + quantityCanAdd } : b,
                    ),
                );
                // Nếu có rồi thì xóa ra
                setLocations((prevLocations) =>
                    prevLocations.map((item) =>
                        item.batchID === selectedBatch
                            ? { ...item, locations: item.locations.filter((loc) => loc.boxID !== box.boxID) }
                            : item,
                    ),
                );
            }
        }
    };

    const handleOnclose = () => {
        setSelectedBatch(null);
        onClose();
    };

    const checkBoxExists = (boxID) => {
        const locationFind = locations.find((item) => item.batchID === selectedBatch);
        const found = locationFind?.locations.find((loc) => loc.boxID === boxID);
        if (found) return true;

        return false;
    };

    const checkEnoughCoverage = (box) => {
        const found = localBatches.find((item) => item.batchID === selectedBatch);
        if (found?.unit?.length * found?.unit?.width * found?.unit?.height <= box.remainingAcreage) {
            return true;
        }

        return false;
    };

    const checkTotalQuantity = (box) => {
        const found = localBatches.find((item) => item.batchID === selectedBatch);
        if (found?.remainAmount == 0 && !checkBoxExists(box.boxID)) {
            return true;
        }

        return false;
    };

    const handleSuggestLocationSubmit = (dataSubmit) => {
        console.log('dataSubmit ', dataSubmit);

        const localShelvesConvert = handleCopy(shelvesData);
        const localBatchesConvert = batches.map((b) => ({ ...b }));
        dataSubmit.forEach((item) => {
            const batchFind = localBatchesConvert.find((b) => b.batchID === item.batchID);
            let totalAssigned = 0;
            item.locations.forEach((loc) => {
                totalAssigned += loc.quantity;
                const totalVolume = batchFind.unit.length * batchFind.unit.width * batchFind.unit.height;

                localShelvesConvert.forEach((shelf) => {
                    shelf.floor.forEach((col) => {
                        col.boxes.forEach((b) => {
                            if (b.boxID === loc.boxID) {
                                b.remainingAcreage -= loc.quantity * totalVolume;
                            }
                        });
                    });
                });
            });
            batchFind.remainAmount -= totalAssigned;
        });

        setLocations(dataSubmit);

        setLocalShelves(localShelvesConvert);
        setLocalBatches(localBatchesConvert);
        setSelectedBatch(dataSubmit[0]?.batchID || null);
    };

    const handleUpdateLocation = async () => {
        for (const item of locations) {
            const batchFind = localBatches.find((b) => b.batchID === item.batchID);
            if (batchFind?.remainAmount > 0) {
                toast.error(
                    `Lô ${item.batchID} còn ${batchFind?.remainAmount} sản phẩm chưa được phân bổ`,
                    styleMessage,
                );
                return; // lúc này return sẽ thoát hẳn khỏi handleUpdateLocation
            }
        }

        const locationToUpdate = locations.map((item) => ({
            batchID: item.batchID,
            boxes: item.locations.map((loc) => ({ boxID: loc.boxID, quantity: loc.quantity })),
        }));

        const warehouseID = parseToken('warehouse').warehouseID;
        const res = await updateLocationBatch(warehouseID, locationToUpdate);

        if (res.data.status === 'OK') {
            toast.success('Cập nhật vị trí thành công', styleMessage);
            fetchData();
            fetchCountBatchesWithoutLocation();
            onClose();
        }
    };

    return (
        <Modal isOpenInfo={isOpen} onClose={handleOnclose} showButtonClose={false}>
            <div className={cx('wrapper')}>
                <div className={cx('update-info')}>
                    <div className={cx('batches-update')}>
                        <h3>Danh sách lô hàng</h3>
                        <div className={cx('tableWrap')}>
                            <table className={cx('table')}>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th className={cx('stt')}>Mã lô</th>
                                        <th className={cx('productName')}>Tên sản phẩm</th>
                                        <th className={cx('unit')}>Đơn vị tính</th>
                                        <th className={cx('acreage')}>Thể tích</th>
                                        <th className={cx('num')}>Số lượng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {batches?.map((batch, index) => (
                                        <tr key={index}>
                                            <td>
                                                <input
                                                    type="radio"
                                                    checked={selectedBatch === batch.batchID}
                                                    onChange={() => handleCheckboxChange(batch.batchID)}
                                                />
                                            </td>
                                            <td className={cx('stt')}>{batch.batchID}</td>
                                            <td className={cx('productName')}>{batch.product.productName}</td>
                                            <td className={cx('unit')}>{batch.unit.unitName}</td>
                                            <td className={cx('acreage')}>
                                                {batch.unit.length * batch.unit.width * batch.unit.height}
                                            </td>
                                            <td className={cx('num')}>{batch.remainAmount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className={cx('location-update')}>
                        <h3>Danh sách vị trí</h3>
                        <div className={cx('tableWrap')}>
                            <table className={cx('table')}>
                                <thead>
                                    <tr>
                                        <th className={cx('stt')}>Vị trí</th>
                                        <th className={cx('productID')}>Thể tích còn lại</th>
                                        <th className={cx('acreageConsumption')}>Thể tích tiêu hao</th>
                                        <th className={cx('productName')}>Số lượng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {locations
                                        .find((item) => item.batchID === selectedBatch)
                                        ?.locations?.map((location, index) => {
                                            const unit = localBatches.find((b) => b.batchID === selectedBatch)?.unit;
                                            const totalVolume = unit.length * unit.width * unit.height;
                                            return (
                                                <tr key={index}>
                                                    <td className={cx('stt')}>{location.boxName}</td>
                                                    <td className={cx('productID')}>{location.remainingAcreage}</td>
                                                    <td className={cx('number')}>{location.quantity * totalVolume}</td>
                                                    <td className={cx('productName')}>
                                                        <input value={location.quantity} readOnly type="number" />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className={cx('action')}>
                        <Button
                            primary
                            onClick={() => {
                                setShowModalSuggestLocation(true);
                            }}
                        >
                            Gợi ý vị trí
                        </Button>
                        <Button success onClick={handleUpdateLocation}>
                            Cập nhật vị trí
                        </Button>
                    </div>
                </div>
                <div className={cx('shelf-update')}>
                    {/* KHU CHÍNH */}
                    <div className={cx('main-panel')}>
                        <div style={{ width: '100%', height: '100%', position: 'relative', background: '#f0f0f0' }}>
                            {/* Legend + nút đóng popup (HTML overlay góc trái) */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: 12,
                                    top: 12,
                                    zIndex: 10,
                                    background: 'rgba(255,255,255,0.9)',
                                    padding: 8,
                                    borderRadius: 6,
                                }}
                            >
                                <div style={{ fontWeight: '700', marginBottom: 6 }}>Mô tả</div>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 6,
                                        alignItems: 'center',
                                        fontSize: 13,
                                        marginBottom: 4,
                                    }}
                                >
                                    <div style={{ width: 14, height: 14, background: '#a3e4d7', borderRadius: 3 }} />{' '}
                                    <span>Trống hoàn toàn</span>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 6,
                                        alignItems: 'center',
                                        fontSize: 13,
                                        marginBottom: 4,
                                    }}
                                >
                                    <div style={{ width: 14, height: 14, background: '#58d68d', borderRadius: 3 }} />{' '}
                                    <span>Còn nhiều chỗ</span>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 6,
                                        alignItems: 'center',
                                        fontSize: 13,
                                        marginBottom: 4,
                                    }}
                                >
                                    <div style={{ width: 14, height: 14, background: '#f5b041', borderRadius: 3 }} />{' '}
                                    <span>Còn một nửa</span>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 6,
                                        alignItems: 'center',
                                        fontSize: 13,
                                        marginBottom: 4,
                                    }}
                                >
                                    <div style={{ width: 14, height: 14, background: '#e74c3c', borderRadius: 3 }} />{' '}
                                    <span>Sắp hết chỗ</span>
                                </div>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}>
                                    <div style={{ width: 14, height: 14, background: '#bdc3c7', borderRadius: 3 }} />{' '}
                                    <span>Ô không hợp lệ</span>
                                </div>
                            </div>

                            <Canvas camera={{ position: [0, 60, 120], fov: 50 }}>
                                <OrbitControls enableRotate={false} enableZoom enablePan />
                                <ambientLight intensity={0.6} />
                                <directionalLight position={[10, 30, 10]} intensity={1} castShadow />

                                <OrbitControls enablePan enableZoom enableRotate />

                                {/* Sàn kho (nhìn giống viền trong hình) */}
                                <Plane args={[60, 90]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                                    <meshStandardMaterial color="#ffffff" />
                                </Plane>

                                {/* Render các shelf theo shelvesData */}
                                {localShelves?.map((shelf, idx) => (
                                    <Shelf3D
                                        shelfType="updateLocation3D"
                                        selectedBatch={selectedBatch}
                                        checkEnoughCoverage={checkEnoughCoverage}
                                        checkBoxExists={checkBoxExists}
                                        checkTotalQuantity={checkTotalQuantity}
                                        key={shelf.shelfID}
                                        shelf={shelf}
                                        position={getShelfPosition(idx)}
                                        onBoxSelect={(box) => {
                                            handleClickBox(box);
                                        }}
                                        shelfConfig={{ boxSpacing: 1.6, floorHeight: 4 }}
                                    />
                                ))}
                            </Canvas>
                        </div>
                    </div>
                </div>
            </div>
            {showModalSuggestLocation && (
                <ModalSuggestLocation
                    batches={batches}
                    isOpen={showModalSuggestLocation}
                    onClose={() => setShowModalSuggestLocation(false)}
                    handleSuggestLocationSubmit={handleSuggestLocationSubmit}
                />
            )}
        </Modal>
    );
};

export default UpdateLocation3D;
