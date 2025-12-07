import { Button, Modal } from '../../../components';
import classNames from 'classnames/bind';
import styles from './ShowLocationDetail.module.scss';
import Tippy from '@tippyjs/react';
import { useEffect, useState } from 'react';
import { getBoxContainProduct } from '../../../services/batch.service';
import parseToken from '../../../utils/parseToken';
import { getBoxDetails } from '../../../services/box.service';
import CreateCheckDetail from '../CreateCheckDetail';
import toast from 'react-hot-toast';
import { styleMessage } from '../../../constants';
import { getAllShelfOfWarehouse } from '../../../services/shelf.service';
import Shelf3D from '../../../components/Shelf3D';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Plane } from '@react-three/drei';
const cx = classNames.bind(styles);

const ShowLocationDetail = ({ isOpen, onClose, item, fetchData }) => {
    const [selectedBox, setSelectedBox] = useState([]);
    const [localShelves, setLocalShelves] = useState([]);
    const [localShelvesAvailable, setLocalShelvesAvailable] = useState([]);
    const [boxContaining, setBoxContaining] = useState([]);
    const [listBatchBoxCheck, setListBatchBoxCheck] = useState([]);
    const [showCreateInventoryCheck, setShowCreateInventoryCheck] = useState(false);
    const [selectedAll, setSelectedAll] = useState(false);
    const [selectedShelf, setSelectedShelf] = useState([]);
    // Tinh chỉnh để xếp các kệ theo 10 cột × 10 hàng (BX1-BX100)
    const getShelfPosition = (index) => {
        const col = Math.floor(index / 10);
        const row = index % 10; // hàng (0-9)
        const x = col * 5; // điều chỉnh vị trí ngang
        const z = -(row * 8 - 37);

        return [x, 0, z];
    };

    const fetchShelfData = async () => {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');

        const headers = {
            token: `Bearer ${token.accessToken}`,
            employeeID: token.employeeID,
            warehouseID: warehouse.warehouseID,
        };
        const data = await getAllShelfOfWarehouse({
            warehouseID: warehouse.warehouseID,
            headers,
        });
        if (data.status === 'OK') {
            setLocalShelves(data.data);
        }
    };

    useEffect(() => {
        fetchShelfData();
    }, []);

    useEffect(() => {
        const availableShelves = localShelves.filter((shelf) =>
            shelf.floor?.some((floor) => floor.boxes?.some((box) => box.status !== 'AVAILABLE')),
        );
        setLocalShelvesAvailable(availableShelves);
    }, [localShelves]);

    useEffect(() => {
        const fetchBoxContaining = async () => {
            if (item != null) {
                const warehouse = parseToken('warehouse');
                const boxContaining = await getBoxContainProduct(warehouse.warehouseID, item.productID);
                if (boxContaining.data.status === 'OK') {
                    setBoxContaining(boxContaining.data.data);
                }
            }
        };
        fetchBoxContaining();
    }, [item]);

    const checkBoxContain = (boxID) => {
        return boxContaining.some((box) => box.boxID === boxID);
    };

    const checkBoxAvailable = (box) => {
        const validQuantity = box.batchBoxes.every((item) => item.quantity === 0);

        return box.status === 'AVAILABLE' || validQuantity;
    };

    const handleOnclose = () => {
        onClose();
    };

    const handleClickBox = async (boxID) => {
        const boxExists = selectedBox.find((box) => box.boxID === boxID);
        if (boxExists) {
            setSelectedBox(selectedBox.filter((box) => box.boxID !== boxID));
            setListBatchBoxCheck(listBatchBoxCheck.filter((box) => box.boxID !== boxID));
        } else {
            const warehouse = parseToken('warehouse');
            const warehouseID = warehouse.warehouseID;
            const res = await getBoxDetails(warehouseID, boxID);

            if (res.data.status === 'OK') {
                const location = `${res.data.data.floor.shelf.shelfName} - ${res.data.data.floor.floorName} - ${res.data.data.boxName}`;
                const batches = res.data.data.batches.filter((batch) => batch.batch_boxes.quantity > 0);
                setSelectedBox([...selectedBox, { boxID }]);
                setListBatchBoxCheck([...listBatchBoxCheck, { boxID, location, batches }]);
            }
        }
    };

    const handleOnclickShelf = (shelf) => {
        if (selectedShelf.includes(shelf.shelfID)) {
            setSelectedShelf(selectedShelf.filter((id) => id !== shelf.shelfID));
            // filter status different AVAILABLE and add to selectedBox
            const boxesInShelf = shelf.floor.flatMap((floor) =>
                floor.boxes.filter((box) => !checkBoxAvailable(box)).map((box) => box.boxID),
            );
            setSelectedBox(selectedBox.filter((box) => !boxesInShelf.includes(box.boxID)));
            setListBatchBoxCheck(listBatchBoxCheck.filter((box) => !boxesInShelf.includes(box.boxID)));
        } else {
            setSelectedShelf([...selectedShelf, shelf.shelfID]);
            const boxesInShelf = shelf.floor.flatMap((floor) =>
                floor.boxes.filter((box) => !checkBoxAvailable(box)).map((box) => box.boxID),
            );

            boxesInShelf.forEach(async (boxID) => {
                if (!selectedBox.find((box) => box.boxID === boxID)) {
                    const warehouse = parseToken('warehouse');
                    const warehouseID = warehouse.warehouseID;
                    const res = await getBoxDetails(warehouseID, boxID);
                    if (res.data.status === 'OK' && res.data.data.batches.length > 0) {
                        const location = `${res.data.data.floor.shelf.shelfName} - ${res.data.data.floor.floorName} - ${res.data.data.boxName}`;
                        const batches = res.data.data.batches.filter((batch) => batch.batch_boxes.quantity > 0);

                        setSelectedBox((prev) => [...prev, { boxID }]);
                        setListBatchBoxCheck((prev) => [...prev, { boxID, location, batches }]);
                    }
                }
            });
        }
    };

    const handleOnclickAllShelf = () => {
        if (selectedAll) {
            setSelectedAll(false);
            setSelectedShelf([]);
            setSelectedBox([]);
            setListBatchBoxCheck([]);
        } else {
            setSelectedAll(true);
            setSelectedShelf(localShelvesAvailable.map((shelf) => shelf.shelfID));
            localShelvesAvailable.forEach((shelf) => {
                shelf.floor.forEach((floor) => {
                    floor.boxes.forEach(async (box) => {
                        if (!checkBoxAvailable(box)) {
                            if (!selectedBox.find((item) => item.boxID === box.boxID)) {
                                const warehouse = parseToken('warehouse');
                                const warehouseID = warehouse.warehouseID;
                                const res = await getBoxDetails(warehouseID, box.boxID);
                                if (res.data.status === 'OK' && res.data.data.batches.length > 0) {
                                    const location = `${res.data.data.floor.shelf.shelfName} - ${res.data.data.floor.floorName} - ${res.data.data.boxName}`;
                                    const batches = res.data.data.batches.filter(
                                        (batch) => batch.batch_boxes.quantity > 0,
                                    );
                                    setSelectedBox((prev) => [...prev, { boxID: box.boxID }]);
                                    setListBatchBoxCheck((prev) => [...prev, { boxID: box.boxID, location, batches }]);
                                }
                            }
                        }
                    });
                });
            });
        }
    };

    const checkBoxExists = (boxID) => {
        const boxFind = selectedBox.find((item) => item.boxID === boxID);
        if (boxFind) return true;

        return false;
    };

    const handleCreateInventoryCheck = () => {
        if (listBatchBoxCheck.length === 0) {
            toast.error('Vui lòng chọn vị trí để kiểm kê', styleMessage);
        } else {
            setShowCreateInventoryCheck(true);
        }
    };

    return (
        <Modal isOpenInfo={isOpen} onClose={handleOnclose} showButtonClose={false}>
            <div className={cx('wrapper')}>
                <div className={cx('update-info')}>
                    <h3>Danh sách lô hàng cần kiểm kê</h3>
                    <div className={cx('tableWrap')}>
                        <table className={cx('table')}>
                            <thead>
                                <tr>
                                    <th className={cx('location')}>Vị trí</th>
                                    <th className={cx('batchID')}>Mã lô</th>
                                    <th className={cx('productName')}>Tên sản phẩm</th>
                                    <th className={cx('unit')}>Đơn vị tính</th>
                                    <th className={cx('num')}>Số lượng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listBatchBoxCheck?.map((batchBoxCheck) =>
                                    batchBoxCheck?.batches.map((batch, idx) => (
                                        <tr key={idx}>
                                            <td className={cx('location')}>{batchBoxCheck.location}</td>
                                            <td className={cx('batchID')}>{batch.batchID}</td>
                                            <td className={cx('productName')}>{batch.product.productName}</td>
                                            <td className={cx('unit')}>{batch.unit.unitName}</td>
                                            <td className={cx('num')}>{batch.batch_boxes.quantity}</td>
                                        </tr>
                                    )),
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className={cx('action')}>
                        <Button primary onClick={handleOnclose}>
                            Hủy
                        </Button>
                        <Button success onClick={handleCreateInventoryCheck}>
                            Tạo đơn kiểm kê
                        </Button>
                    </div>
                </div>
                {/* KHU CHÍNH */}
                <div className={cx('main-panel')}>
                    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#f0f0f0' }}>
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
                            <div
                                style={{
                                    display: 'flex',
                                    gap: 6,
                                    alignItems: 'center',
                                    fontSize: 13,
                                    marginBottom: 5,
                                }}
                            >
                                <input type="checkbox" checked={selectedAll} onChange={handleOnclickAllShelf} />
                                <span>Tất cả</span>
                            </div>
                            {localShelvesAvailable?.map((shelf) => (
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 6,
                                        alignItems: 'center',
                                        fontSize: 13,
                                        marginBottom: 5,
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedShelf.includes(shelf.shelfID)}
                                        onChange={() => handleOnclickShelf(shelf)}
                                    />
                                    <span>{shelf.shelfName}</span>
                                </div>
                            ))}
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
                                    shelfType="inventoryCheck"
                                    checkBoxAvailable={checkBoxAvailable}
                                    checkBoxContain={checkBoxContain}
                                    checkBoxExists={checkBoxExists}
                                    key={shelf.shelfID}
                                    shelf={shelf}
                                    position={getShelfPosition(idx)}
                                    onBoxSelect={(box) => {
                                        handleClickBox(box.boxID);
                                    }}
                                    shelfConfig={{ boxSpacing: 1.6, floorHeight: 4 }}
                                />
                            ))}
                        </Canvas>
                    </div>
                    {/* {localShelves.map((shelf) => {
                        return (
                            <div
                                className={cx(['shelf', !checkShelfAvailable(shelf) && 'un-active'])}
                                key={shelf.shelfID}
                                onClick={checkShelfAvailable(shelf) ? handleOnclickShelf(shelf) : undefined}
                            >
                                {shelf.floor?.map((column, index) => {
                                    return (
                                        <div className={cx('floor')} key={index}>
                                            {column.boxes.map((box, colIndex) => {
                                                return (
                                                    <div className={cx('box-wrapper')} key={colIndex}>
                                                        <Tippy key={colIndex} content={`${box.boxName}`}>
                                                            <Button
                                                                disabled={checkBoxAvailable(box)}
                                                                className={cx([
                                                                    'box',
                                                                    checkBoxContain(box.boxID) && 'ready',
                                                                    checkBoxExists(box.boxID) && 'active',
                                                                ])}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleClickBox(box.boxID);
                                                                }}
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
            {showCreateInventoryCheck && (
                <CreateCheckDetail
                    fetchData={fetchData}
                    isOpen={showCreateInventoryCheck}
                    onClose={() => setShowCreateInventoryCheck(false)}
                    listBatchBoxCheck={listBatchBoxCheck}
                    handleOnclose={handleOnclose}
                />
            )}
        </Modal>
    );
};

export default ShowLocationDetail;
