import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { ClassroomExperience } from "./ClassroomExperience";
import { ClassroomUI } from "./ClassroomUI";
import { useLocation, Navigate } from "react-router-dom";

export const ClassroomPage = () => {
    const location = useLocation();
    const userInfo = location.state;

    // Redirect to pre-conference if no user info is available
    if (!userInfo) {
        return <Navigate to="/pre-conference" replace />;
    }

    return (
        <>
            <Loader />
            <Leva hidden />
            <ClassroomUI userInfo={userInfo}>
                <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }}>
                    <ClassroomExperience userAvatar={userInfo.selectedAvatar} />
                </Canvas>
            </ClassroomUI>
        </>
    );
}; 