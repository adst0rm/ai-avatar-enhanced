import { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

const avatarOptions = [
    { id: 1, name: 'Classic Avatar', path: '/models/64f1a714fe61576b46f27ca2.glb' },
    { id: 2, name: 'Modern Avatar', path: '/models/64f1a714fe61576b46f27ca3.glb' },
    { id: 3, name: 'Asyl Avatar', path: '/models/asyl-avatar.glb' },
    { id: 4, name: 'Tomiris Avatar', path: '/models/tomitis-avatar.glb' },
];

// Preload all models
avatarOptions.forEach(avatar => {
    useGLTF.preload(avatar.path);
});

const AvatarPreview = ({ modelPath }) => {
    const { scene } = useGLTF(modelPath);

    useEffect(() => {
        return () => {
            // Cleanup when component unmounts or model changes
            const model = useGLTF.get(modelPath);
            if (model) {
                model.scene.traverse((object) => {
                    if (object.isMesh) {
                        if (object.geometry) object.geometry.dispose();
                        if (object.material) {
                            if (Array.isArray(object.material)) {
                                object.material.forEach(material => material.dispose());
                            } else {
                                object.material.dispose();
                            }
                        }
                    }
                });
            }
        };
    }, [modelPath]);

    return <primitive object={scene} scale={2} position={[0, -2, 0]} />;
};

const classOptions = [
    'Free Format',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'History',
    'Literature',
    'Art',
];

const languageOptions = [
    { code: 'kk', name: 'Қазақша', flag: '🇰🇿' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
];

export const PreConferencePage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        class: '',
        selectedAvatar: avatarOptions[0].path,
        language: 'kk', // Default to Kazakh
    });
    const [isLoading, setIsLoading] = useState(false);
    const [key, setKey] = useState(0); // Add key for forcing remount

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            navigate('/classroom', { state: formData });
        }, 1000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarChange = (avatarPath) => {
        setFormData(prev => ({ ...prev, selectedAvatar: avatarPath }));
        setKey(prev => prev + 1); // Force remount of Canvas when avatar changes
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Form Section */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Setup Your Learning Experience
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name Input */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                    placeholder="Enter your name"
                                />
                            </div>

                            {/* Class Selection */}
                            <div>
                                <label htmlFor="class" className="block text-sm font-medium text-gray-300 mb-2">
                                    Select Class
                                </label>
                                <select
                                    id="class"
                                    name="class"
                                    required
                                    value={formData.class}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                >
                                    <option value="">Select a class</option>
                                    {classOptions.map((className) => (
                                        <option key={className} value={className}>
                                            {className}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Language Selection */}
                            <div>
                                <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-2">
                                    Voice Language / Дауыстық тіл
                                </label>
                                <select
                                    id="language"
                                    name="language"
                                    value={formData.language}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                >
                                    {languageOptions.map((lang) => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.flag} {lang.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Avatar Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Choose Your Avatar
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {avatarOptions.map((avatar) => (
                                        <button
                                            key={avatar.id}
                                            type="button"
                                            onClick={() => handleAvatarChange(avatar.path)}
                                            className={`p-3 border rounded-xl transition-all duration-300 text-sm font-medium ${formData.selectedAvatar === avatar.path
                                                ? 'border-blue-500 bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/25'
                                                : 'border-white/10 hover:border-white/30 text-gray-300 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className={`w-2 h-2 rounded-full ${formData.selectedAvatar === avatar.path ? 'bg-blue-400' : 'bg-gray-500'}`}></div>
                                                <span>{avatar.name}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    Your selected avatar will appear in the virtual classroom
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Setting up...' : 'Enter Classroom'}
                            </button>
                        </form>
                    </div>

                    {/* Avatar Preview Section */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                        <h3 className="text-xl font-semibold mb-4 text-center">Avatar Preview</h3>
                        <div className="w-full h-[400px] rounded-lg overflow-hidden">
                            <Canvas key={key} camera={{ position: [0, 0, 5], fov: 45 }}>
                                <ambientLight intensity={0.5} />
                                <pointLight position={[10, 10, 10]} />
                                <Suspense fallback={null}>
                                    <AvatarPreview modelPath={formData.selectedAvatar} />
                                </Suspense>
                                <OrbitControls enableZoom={false} />
                            </Canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 