import { Box, Html, Text } from '@react-three/drei';
import { useState } from 'react';

export default function TemporaryWarehouse({ setShowWareHouseTemp, batchesWithoutLocation }) {
    const [hover, setHover] = useState(false);

    const baseColor = '#a8dadc';
    const hoverColor = '#f1c40f';
    const height = 10; // chiều cao kho
    const width = 18;
    const depth = 86;

    return (
        <group
            position={[-31, height / 2, -7]}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHover(true);
                document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
                e.stopPropagation();
                setHover(false);
                document.body.style.cursor = 'default';
            }}
            onClick={(e) => {
                e.stopPropagation();
                setShowWareHouseTemp(true);
            }}
        >
            {/* --- Thân chính của kho --- */}
            <Box args={[width, height, depth]}>
                <meshStandardMaterial color={hover ? hoverColor : baseColor} metalness={0.2} roughness={0.6} />
            </Box>

            {/* --- Mái nhà --- */}
            <Box args={[width + 0.4, 0.6, depth + 0.4]} position={[0, height / 2, 0]}>
                <meshStandardMaterial color={hover ? hoverColor : baseColor} />
            </Box>

            {/* --- Viền tường (khung) --- */}
            {/* Mặt trước & sau */}
            <Box args={[width + 0.4, height + 0.4, 0.2]} position={[0, 0, depth / 2]}>
                <meshStandardMaterial color="#2a9d8f" />
            </Box>
            <Box args={[width + 0.4, height + 0.4, 0.2]} position={[0, 0, -depth / 2]}>
                <meshStandardMaterial color="#2a9d8f" />
            </Box>

            {/* Bên trái & phải */}
            <Box args={[0.2, height + 0.4, depth + 0.4]} position={[width / 2, 0, 0]}>
                <meshStandardMaterial color="#2a9d8f" />
            </Box>
            <Box args={[0.2, height + 0.4, depth + 0.4]} position={[-width / 2, 0, 0]}>
                <meshStandardMaterial color="#2a9d8f" />
            </Box>

            {/* --- Nhãn "KHO TẠM" nổi bên trên --- */}
            <Text
                position={[0, height / 2 + 3, 0]}
                rotation={[0, 0, 0]}
                fontSize={2.5}
                color="#1d3557"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.15}
                outlineColor="white"
            >
                KHO TẠM
            </Text>
            {/* --- Hiện popup nhỏ khi hover --- */}
            {hover && (
                <Html
                    position={[0, height + 5, 0]}
                    center
                    style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#333',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <div>
                        <strong>KHO TẠM</strong>
                        <br />
                        <p style={{ marginTop: '6px' }}>Số lô hàng chưa được sắp vào kệ: {batchesWithoutLocation}</p>
                    </div>
                </Html>
            )}
        </group>
    );
}
