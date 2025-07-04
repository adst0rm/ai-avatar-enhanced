import {
    CameraControls,
    ContactShadows,
    Environment,
    Text,
    Plane,
    Box,
    useGLTF,
} from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { Avatar } from "./Avatar";
import * as THREE from "three";



const Dots = (props) => {
    const { loading } = useChat();
    const [loadingText, setLoadingText] = useState("");
    useEffect(() => {
        if (loading) {
            const interval = setInterval(() => {
                setLoadingText((loadingText) => {
                    if (loadingText.length > 2) {
                        return ".";
                    }
                    return loadingText + ".";
                });
            }, 800);
            return () => clearInterval(interval);
        } else {
            setLoadingText("");
        }
    }, [loading]);
    if (!loading) return null;
    return (
        <group {...props}>
            <Text fontSize={0.14} anchorX={"left"} anchorY={"bottom"}>
                {loadingText}
                <meshBasicMaterial attach="material" color="white" />
            </Text>
        </group>
    );
};

const Whiteboard = () => {
    return (
        <group position={[0, 1.5, -2]}>
            {/* Whiteboard surface */}
            <Plane args={[3, 2]} position={[0, 0, 0]}>
                <meshLambertMaterial color="white" />
            </Plane>
            {/* Frame */}
            <Box args={[3.1, 2.1, 0.05]} position={[0, 0, -0.025]}>
                <meshLambertMaterial color="#333" />
            </Box>
            {/* Content on whiteboard */}
            <Text
                position={[0, 0.5, 0.01]}
                fontSize={0.15}
                color="black"
                anchorX="center"
                anchorY="middle"
                font="/fonts/Inter-Bold.woff"
            >
                Physics: Quantum Mechanics
            </Text>
            <Text
                position={[0, 0.1, 0.01]}
                fontSize={0.08}
                color="blue"
                anchorX="center"
                anchorY="middle"
            >
                E = hf
            </Text>
            <Text
                position={[0, -0.2, 0.01]}
                fontSize={0.08}
                color="red"
                anchorX="center"
                anchorY="middle"
            >
                Wave-Particle Duality
            </Text>
        </group>
    );
};

const ClassroomDesks = () => {
    const deskPositions = [
        [-1.5, 0, 1],
        [1.5, 0, 1],
        [-1.5, 0, 2.5],
        [1.5, 0, 2.5],
    ];

    return (
        <group>
            {deskPositions.map((position, index) => (
                <group key={index} position={position}>
                    {/* Desk surface */}
                    <Box args={[1, 0.1, 0.6]} position={[0, 0.75, 0]}>
                        <meshLambertMaterial color="#8B4513" />
                    </Box>
                    {/* Desk legs */}
                    <Box args={[0.05, 0.7, 0.05]} position={[-0.4, 0.35, -0.25]}>
                        <meshLambertMaterial color="#654321" />
                    </Box>
                    <Box args={[0.05, 0.7, 0.05]} position={[0.4, 0.35, -0.25]}>
                        <meshLambertMaterial color="#654321" />
                    </Box>
                    <Box args={[0.05, 0.7, 0.05]} position={[-0.4, 0.35, 0.25]}>
                        <meshLambertMaterial color="#654321" />
                    </Box>
                    <Box args={[0.05, 0.7, 0.05]} position={[0.4, 0.35, 0.25]}>
                        <meshLambertMaterial color="#654321" />
                    </Box>
                    {/* Chair */}
                    <Box args={[0.8, 0.1, 0.5]} position={[0, 0.4, 0.5]}>
                        <meshLambertMaterial color="#4A4A4A" />
                    </Box>
                    <Box args={[0.8, 0.8, 0.1]} position={[0, 0.8, 0.75]}>
                        <meshLambertMaterial color="#4A4A4A" />
                    </Box>
                </group>
            ))}
        </group>
    );
};

const ClassroomFloor = () => {
    return (
        <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <meshLambertMaterial color="#E6E6FA" />
        </Plane>
    );
};

const ClassroomWalls = () => {
    return (
        <group>
            {/* Back wall */}
            <Plane args={[20, 8]} position={[0, 4, -5]} rotation={[0, 0, 0]}>
                <meshLambertMaterial color="#F0F8FF" />
            </Plane>
            {/* Left wall */}
            <Plane args={[10, 8]} position={[-10, 4, 0]} rotation={[0, Math.PI / 2, 0]}>
                <meshLambertMaterial color="#F0F8FF" />
            </Plane>
            {/* Right wall */}
            <Plane args={[10, 8]} position={[10, 4, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <meshLambertMaterial color="#F0F8FF" />
            </Plane>
        </group>
    );
};

const ClassroomLighting = () => {
    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight
                position={[5, 10, 5]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            <pointLight position={[0, 5, 0]} intensity={0.8} />
            {/* Additional lighting for main avatar */}
            <spotLight
                position={[0, 4, 2]}
                angle={0.3}
                penumbra={0.1}
                intensity={1}
                castShadow
                target-position={[0, 1.5, 0]}
            />
        </>
    );
};

export const ClassroomExperience = ({ userAvatar }) => {
    const cameraControls = useRef();
    const { cameraZoomed } = useChat();

    useEffect(() => {
        // Set initial camera position for classroom view - focused on main avatar
        cameraControls.current.setLookAt(0, 2, 5, 0, 1.5, 0);
    }, []);

    useEffect(() => {
        if (cameraZoomed) {
            // Zoom in to avatar for close interaction
            cameraControls.current.setLookAt(0, 1.5, 1.5, 0, 1.5, 0, true);
        } else {
            // Full classroom view with avatar in focus
            cameraControls.current.setLookAt(0, 2.2, 5, 0, 1.0, 0, true);
        }
    }, [cameraZoomed]);

    return (
        <>
            <CameraControls ref={cameraControls} />
            <Environment preset="city" />
            <ContactShadows opacity={0.4} scale={5} blur={2.4} />

            <ClassroomLighting />
            <ClassroomWalls />
            <ClassroomFloor />

            {/* Main Avatar (Selected by User) */}
            <Suspense fallback={
                <mesh position={[0, 0.85, 0]}>
                    <boxGeometry args={[0.4, 1.7, 0.3]} />
                    <meshLambertMaterial color="#4A90E2" />
                </mesh>
            }>
                <Avatar
                    modelPath={userAvatar}
                    position={[0, 0, 0]}
                    scale={1}
                />
            </Suspense>

            <Dots position={[0.4, 1.8, 0]} />
        </>
    );
}; 