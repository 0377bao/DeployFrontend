import React from 'react';
import { Box, Text } from '@react-three/drei';
import Box3D from '../Box3D';

export default function Shelf3D({
    shelf,
    position,
    onBoxSelect,
    shelfConfig = {},
    shelfType,
    selectedBatch,
    checkEnoughCoverage,
    checkBoxExists,
    checkTotalQuantity,
    isBatchChangeLocation,
    checkBoxExistsInSearchResult,
    checkBoxAvailable,
    checkBoxContain,
    checkDisabled,
    checkActive,
}) {
    // Cấu hình mặc định (giữ nguyên kích thước thực tế như cũ)
    const { boxSpacing = 1.6, floorHeight = 2 } = shelfConfig;

    // Tổng kích thước
    const shelfWidth = 30 * boxSpacing; // giống bản cũ
    const shelfDepth = 2.5;
    const numFloors = shelf.floor?.length || 3;
    const shelfHeight = 3 * floorHeight + 1; // giữ y nguyên kích thước tổng

    return (
        <group position={position}>
            {/* --- KHUNG KỆ: 4 TRỤ --- */}
            {[
                [-shelfWidth / 2, 0, -shelfDepth / 2],
                [shelfWidth / 2, 0, -shelfDepth / 2],
                [-shelfWidth / 2, 0, shelfDepth / 2],
                [shelfWidth / 2, 0, shelfDepth / 2],
            ].map((pos, i) => (
                <Box key={i} args={[0.3, shelfHeight, 0.3]} position={[pos[0], shelfHeight / 2, pos[2]]}>
                    <meshStandardMaterial color="#b0c4de" />
                </Box>
            ))}

            {/* --- THANH NGANG GIỮA CÁC TẦNG --- */}
            {Array.from({ length: numFloors + 1 }).map((_, fi) => {
                const y = (fi / numFloors) * shelfHeight; // dàn đều trong khung
                return (
                    <Box key={fi} args={[shelfWidth, 0.15, 0.15]} position={[0, y, 0]}>
                        <meshStandardMaterial color="#b0c4de" />
                    </Box>
                );
            })}

            {/* --- BOX TRÊN CÁC TẦNG --- */}
            {shelf.floor?.map((floor, fi) => {
                // y tầng — chia đều theo chiều cao kệ
                const y = ((fi + 0.5) / numFloors) * shelfHeight;
                const totalBoxes = floor.boxes?.length || 0;

                // canh đều theo chiều ngang
                const usableWidth = shelfWidth - 3; // chừa 1.5 mép mỗi bên
                const spacing = usableWidth / (totalBoxes || 1);
                const startX = -usableWidth / 2 + spacing / 2;

                return (
                    <group key={fi} position={[0, y, 0]}>
                        {floor.boxes?.map((box, bi) => {
                            const x = startX + bi * spacing;
                            const zPos = 0;
                            const checkDisableShelfUpdate3D = () => {
                                if (
                                    ((shelfType === 'updateLocation3D' || shelfType === 'changeLocation3D') &&
                                        (!selectedBatch ||
                                            (!checkEnoughCoverage(box) && !checkBoxExists(box.boxID)) ||
                                            checkTotalQuantity(box))) ||
                                    (shelfType === 'changeLocation3D' && isBatchChangeLocation === box.boxID)
                                ) {
                                    return true;
                                }
                                if (shelfType === 'inventoryCheck' && checkBoxAvailable(box)) return true;
                                if (shelfType === 'exportProduct' && checkDisabled(box.boxID)) return true;
                                return false;
                            };
                            const checkClassName = () => {
                                const classNamesCheck = {};
                                if (shelfType === 'updateLocation3D' || shelfType === 'changeLocation3D') {
                                    if (checkBoxExists(box.boxID)) {
                                        classNamesCheck['active'] = true;
                                    }
                                    if (checkEnoughCoverage(box) || checkBoxExists(box.boxID)) {
                                        classNamesCheck['ready'] = true;
                                    }
                                }
                                if (shelfType === 'inventoryCheck') {
                                    if (checkBoxContain(box.boxID)) {
                                        classNamesCheck['ready'] = true;
                                    }
                                    if (checkBoxExists(box.boxID)) {
                                        classNamesCheck['active'] = true;
                                    }
                                }
                                if (shelfType === 'exportProduct') {
                                    if (checkActive(box.boxID)) {
                                        classNamesCheck['active'] = true;
                                    }
                                }

                                return classNamesCheck;
                            };
                            return (
                                <Box3D
                                    {...checkClassName()}
                                    disable={
                                        checkDisableShelfUpdate3D() ||
                                        (checkBoxExistsInSearchResult && !checkBoxExistsInSearchResult(box.boxID))
                                    }
                                    key={box.boxID}
                                    box={box}
                                    position={[x, 0.4, zPos]}
                                    onSelect={onBoxSelect}
                                />
                            );
                        })}
                    </group>
                );
            })}

            {/* --- TÊN KỆ --- */}
            <Text position={[0, shelfHeight + 0.6, 0]} fontSize={1.5} anchorX="center" anchorY="middle" color="#222">
                {shelf.shelfName || shelf.shelfID}
            </Text>
        </group>
    );
}
