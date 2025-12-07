import React from 'react';
import { useGLTF } from '@react-three/drei';

export default function Forklift({ position = [0, 0, 0], scale = 0.03, rotation = [0, Math.PI / 2, 0] }) {
    const { scene } = useGLTF('/Forklift.glb');

    return <primitive object={scene} position={position} scale={scale} rotation={rotation} />;
}
