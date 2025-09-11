const ProductGrid = ({ products, addItem }) => {
    return (
        <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
            <div className="grid grid-cols-4 gap-3">
                {products.map((p) => (
                    <button
                        key={p.productId}
                        className={`${p.name === "텀블러 할인" || p.name === "종이백"
                                ? "bg-emerald-300"
                                : "bg-emerald-500 hover:bg-emerald-600"
                            } text-white rounded-lg text-sm
                h-28 w-full flex flex-col justify-center items-center p-2`}
                        onClick={() => addItem(p)}
                    >
                        <div className="font-medium text-center truncate w-full">{p.name}</div>
                        <div className="text-xs">{p.price.toLocaleString()}원</div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProductGrid;