import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { ClassroomExperience } from "./ClassroomExperience";
import { ClassroomUI } from "./ClassroomUI";

export const ClassroomPage = () => {
    return (
        <>
            <Loader />
            <Leva hidden />
            <ClassroomUI>
                <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }}>
                    <ClassroomExperience />
                </Canvas>
            </ClassroomUI>
        </>
    );
}; 