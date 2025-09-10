const CustomModal = ({ title, children, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-xl p-6 animate-fadeIn">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
                <div className="text-gray-600 mb-6">{children}</div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
                    >
                        취소
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomModal;