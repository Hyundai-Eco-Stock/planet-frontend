import React, { useState } from 'react';
import EcoStockGuideModal from './EcoStockGuideModal';

const EcoStockGuide = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showGuide = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <button
                onClick={showGuide}
                className="inline-flex items-center justify-center w-8 h-8 bg-emerald-500 hover:bg-emerald-600 rounded-full text-white transition-colors duration-200 shadow-md hover:shadow-lg"
                title="에코스톡 이용 가이드"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
            </button>
            
            <EcoStockGuideModal 
                isOpen={isModalOpen}
                onClose={closeModal}
            />
        </>
    );
};

export default EcoStockGuide;