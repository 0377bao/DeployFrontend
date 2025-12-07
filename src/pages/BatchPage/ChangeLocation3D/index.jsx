import { Button, Modal, MyTable } from '../../../components';
import classNames from 'classnames/bind';
import styles from './ChangeLocation3D.module.scss';
import Tippy from '@tippyjs/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { styleMessage } from '../../../constants';
import { changeLocationBatch } from '../../../services/batchBox.service';
import Shelf3D from '../../../components/Shelf3D';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Plane, Text, Html, Box } from '@react-three/drei';
const cx = classNames.bind(styles);

const ChangeLocation3D = ({ isOpen, onClose, shelvesData, batches, fetchData }) => {
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [locations, setLocations] = useState([]);
    const [localBatches, setLocalBatches] = useState([]);
    const [localShelves, setLocalShelves] = useState([]);

    console.log('changelocation', batches);

    // Tinh chỉnh để xếp các kệ theo 10 cột × 10 hàng (BX1-BX100)
    const getShelfPosition = (index) => {
        const col = Math.floor(index / 10);
        const row = index % 10; // hàng (0-9)
        const x = col * 5; // điều chỉnh vị trí ngang
        const z = -(row * 8 - 37);

        return [x, 0, z];
    };

    console.log('batches', batches);

    useEffect(() => {
        setLocations(batches?.batches?.map((item) => ({ batchID: item.batchID, locations: [] })) || []);
        setLocalBatches(batches?.batches?.map((b) => ({ ...b })) || []);
        setLocalShelves(shelvesData?.map((s) => ({ ...s })));
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

                if (quantityCanAdd > batchFind.batch_boxes.validQuantity) {
                    boxToAdd = { ...box, quantity: batchFind.batch_boxes.validQuantity };
                    acreage = batchFind.batch_boxes.validQuantity * totalVolume;
                    setLocalBatches((prevBatches) =>
                        prevBatches.map((b) =>
                            b.batchID === selectedBatch
                                ? {
                                      ...b,
                                      batch_boxes: {
                                          ...b.batch_boxes,
                                          validQuantity: 0,
                                          quantity: b.batch_boxes.quantity - b.batch_boxes.validQuantity,
                                      },
                                  }
                                : b,
                        ),
                    );
                } else {
                    boxToAdd = { ...box, quantity: quantityCanAdd };
                    acreage = quantityCanAdd * totalVolume;
                    setLocalBatches((prevBatches) =>
                        prevBatches.map((b) =>
                            b.batchID === selectedBatch
                                ? {
                                      ...b,
                                      batch_boxes: {
                                          ...b.batch_boxes,
                                          validQuantity: b.batch_boxes.validQuantity - quantityCanAdd,
                                          quantity: b.batch_boxes.quantity - quantityCanAdd,
                                      },
                                  }
                                : b,
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
                        b.batchID === selectedBatch
                            ? {
                                  ...b,
                                  batch_boxes: {
                                      ...b.batch_boxes,
                                      validQuantity: b.batch_boxes.validQuantity + quantityCanAdd,
                                      quantity: b.batch_boxes.quantity + quantityCanAdd,
                                  },
                              }
                            : b,
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
        if (found?.batch_boxes?.validQuantity == 0 && !checkBoxExists(box.boxID)) {
            return true;
        }

        return false;
    };

    const handleChangeInputQuantity = (boxID, value) => {
        const batchLocation = locations.find((item) => item.batchID == selectedBatch);
        const batchFind = localBatches.find((item) => item.batchID === selectedBatch);
        const locationFind = batchLocation.locations.find((loc) => loc.boxID === boxID);

        const boxFind = localShelves
            .flatMap((shelf) => shelf.floor)
            .flatMap((col) => col.boxes)
            .find((b) => b.boxID === boxID);
        const totalVolume = batchFind.unit.length * batchFind.unit.width * batchFind.unit.height;
        let newQuantity = parseInt(value);
        const quantityDiff = newQuantity - locationFind.quantity;
        const acreageDiff = quantityDiff * totalVolume;
        console.log('batchFind.batch_boxes.validQuantity', batchFind.batch_boxes.validQuantity);

        if (isNaN(newQuantity)) {
            toast.error('Số lượng không hợp lệ', styleMessage);
            return;
        } else if (newQuantity <= 0) {
            toast.error('Số lượng phải lớn hơn 0', styleMessage);
            return;
        } else if (quantityDiff > batchFind.batch_boxes.validQuantity) {
            toast.error(
                `Số lượng vượt quá số lượng còn lại của lô cần chuyển (${batchFind.batch_boxes.validQuantity})`,
                styleMessage,
            );
            return;
        }

        if (newQuantity * totalVolume > boxFind.remainingAcreage + locationFind.quantity * totalVolume) {
            toast.error(`Số lượng vượt quá số lượng còn lại của ô có thể chứa`, styleMessage);
            return;
        }
        // Cập nhật lại số lượng trong lô
        setLocalBatches((prevBatches) =>
            prevBatches.map((b) =>
                b.batchID === selectedBatch
                    ? {
                          ...b,
                          batch_boxes: {
                              ...b.batch_boxes,
                              validQuantity: b.batch_boxes.validQuantity - quantityDiff,
                              quantity: b.batch_boxes.quantity - quantityDiff,
                          },
                      }
                    : b,
            ),
        );
        // Cập nhật lại diện tích trong kho
        setLocalShelves((prevShelves) =>
            prevShelves.map((shelf) => ({
                ...shelf,
                floor: shelf.floor.map((col) => ({
                    ...col,
                    boxes: col.boxes.map((b) =>
                        b.boxID === boxID ? { ...b, remainingAcreage: b.remainingAcreage - acreageDiff } : b,
                    ),
                })),
            })),
        );
        // // Cập nhật lại số lượng trong vị trí
        setLocations((prevLocations) =>
            prevLocations.map((item) =>
                item.batchID === selectedBatch
                    ? {
                          ...item,
                          locations: item.locations.map((loc) =>
                              loc.boxID === boxID ? { ...loc, quantity: newQuantity } : loc,
                          ),
                      }
                    : item,
            ),
        );
    };

    const handleUpdateLocation = async () => {
        const locationToUpdate = locations.map((item) => ({
            batchID: item.batchID,
            boxes: item.locations.map((loc) => ({ boxID: loc.boxID, quantity: loc.quantity })),
        }));

        const oldLocations = localBatches.map((item) => ({
            batchID: item.batchID,
            quantity: item.batch_boxes.quantity,
            validQuantity: item.batch_boxes.validQuantity,
        }));

        const newLocations = locationToUpdate.map((item) => ({
            batchID: item.batchID,
            boxes: item.boxes.map((box) => ({ boxID: box.boxID, quantity: box.quantity })),
        }));

        const res = await changeLocationBatch({
            oldLocations,
            newLocations,
            boxID: batches.boxID,
        });

        if (res.data.status === 'OK') {
            console.log(1);

            toast.success('Cập nhật vị trí thành công', styleMessage);
            fetchData();
            onClose();
        }
    };

    return (
        <Modal isOpenInfo={isOpen} onClose={handleOnclose} showButtonClose={false}>
            <div className={cx('wrapper')}>
                <div className={cx('update-info')}>
                    <div className={cx('batches-update')}>
                        <h3>
                            Danh sách lô hàng chuyển từ: <i className={cx('location')}>{batches.location}</i>
                        </h3>
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
                                    {batches?.batches?.map((batch, index) => (
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
                                            <td className={cx('number')}>
                                                {batch.unit.length * batch.unit.width * batch.unit.height}
                                            </td>
                                            <td className={cx('num')}>{batch.batch_boxes?.validQuantity}</td>
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
                                        <th className={cx('productName')}>Số lượng chuyển</th>
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
                                                    <td className={cx('number')}>{location.remainingAcreage}</td>
                                                    <td className={cx('number')}>{location.quantity * totalVolume}</td>
                                                    <td className={cx('number')}>
                                                        <input
                                                            value={location.quantity}
                                                            type="number"
                                                            min="0"
                                                            onChange={(e) => {
                                                                handleChangeInputQuantity(
                                                                    location.boxID,
                                                                    e.target.value,
                                                                );
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className={cx('action')}>
                        <Button primary onClick={handleUpdateLocation}>
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
                                        shelfType="changeLocation3D"
                                        selectedBatch={selectedBatch}
                                        isBatchChangeLocation={batches.boxID}
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
                        {/* {localShelves.map((shelf) => {
                            return (
                                <div className={cx('shelf')} key={shelf.shelfID}>
                                    {shelf.floor?.map((column, index) => {
                                        return (
                                            <div className={cx('floor')} key={index}>
                                                {column.boxes.map((box, colIndex) => {
                                                    return (
                                                        <div>
                                                            <Tippy key={colIndex} content={`${box.boxName}`}>
                                                                <Button
                                                                    onClick={() => handleClickBox(box)}
                                                                    disabled={
                                                                        !selectedBatch ||
                                                                        (!checkEnoughCoverage(box) &&
                                                                            !checkBoxExists(box.boxID)) ||
                                                                        checkTotalQuantity(box) ||
                                                                        batches.boxID === box.boxID
                                                                    }
                                                                    className={cx([
                                                                        'box',
                                                                        checkBoxExists(box.boxID) && 'active',
                                                                        checkEnoughCoverage(box) && 'ready',
                                                                        checkBoxExists(box.boxID) && 'ready',
                                                                    ])}
                                                                ></Button>
                                                            </Tippy>
                                                            <span>{box.boxID}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })} */}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ChangeLocation3D;
