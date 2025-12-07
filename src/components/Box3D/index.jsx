// src/components/Box3D.jsx
import React, { useState } from 'react';
import { Box } from '@react-three/drei';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

function getColorByVolume(maxAcreage = 1, remainingAcreage = 0, disable) {
    if (disable) return '#bdc3c7';
    else {
        const volume = (remainingAcreage / maxAcreage) * 100;
        if (volume === 100) return '#a3e4d7'; // empty
        if (volume >= 65) return '#58d68d'; // ready
        if (volume >= 30) return '#f5b041'; // processing
        return '#e74c3c'; // warning
    }
}

export default function Box3D({ box, position, onSelect, disable = false, active = false }) {
    const [hover, setHover] = useState(false);

    const baseColor = getColorByVolume(box?.maxAcreage, box?.remainingAcreage, disable, active);

    return (
        <group position={position}>
            <Box
                args={[8, 4, 3]}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    if (disable) return;
                    setHover(true);
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={(e) => {
                    e.stopPropagation();
                    if (disable) return;
                    setHover(false);
                    document.body.style.cursor = 'default';
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (disable) return;
                    onSelect && onSelect(box);
                }}
                castShadow
                receiveShadow
            >
                <meshStandardMaterial color={hover ? '#f1c40f' : baseColor} />
            </Box>
            {/* Viền quanh box */}
            {active && (
                <lineSegments>
                    <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(8, 4, 3)]} />
                    <lineBasicMaterial attach="material" color={hover ? 'orange' : 'black'} linewidth={2} />
                </lineSegments>
            )}

            {/* label dưới box */}
            <Html position={[0, -0.9, 0]} center>
                {/* <div style={{ fontSize: 5, textAlign: 'center', color: '#222' }}>{box?.boxID}</div> */}
            </Html>
            {/* Hiện label tên box khi hover */}
            {hover && (
                <Html
                    position={[0, 3, 0]} // Hiện trên box
                    center
                    style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#222',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        transform: 'translateY(-10px)',
                    }}
                >
                    {box?.boxName || box?.boxID || 'Unnamed Box'}
                </Html>
            )}
        </group>
    );
}
