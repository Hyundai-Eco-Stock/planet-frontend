const ProductGrid = ({ products, addItem }) => {
    return (
        <div className="flex-1 grid grid-cols-4 gap-3 p-4 bg-gray-50">
            {products.map((p) => (
                <button
                    key={p.productId}
                    className={`${p.name === "텀블러 할인" || p.name === "종이백"
                            ? "bg-emerald-300"
                            : "bg-emerald-500 hover:bg-emerald-600"
                        } text-white p-3 rounded-lg text-sm`}
                    onClick={() => addItem(p)}
                >
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs">{p.price.toLocaleString()}원</div>
                </button>
            ))}
        </div>
    );
};

export default ProductGrid;