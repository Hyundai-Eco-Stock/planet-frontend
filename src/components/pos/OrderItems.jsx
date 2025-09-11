const OrderItems = ({ items, setItems }) => {
    return (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {items.map((it, idx) => (
                <div
                    key={idx}
                    className="flex justify-between items-center border p-2 rounded gap-3"
                >
                    <span className="font-medium flex-1">{it.name}</span>
                    <span className="font-medium">
                        {(it.price * it.amount).toLocaleString()}원
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            className="px-2 py-1 border rounded bg-gray-200"
                            onClick={() =>
                                setItems((prev) => {
                                    const updated = [...prev];
                                    updated[idx] = {
                                        ...updated[idx],
                                        amount: updated[idx].amount - 1,
                                    };
                                    if (updated[idx].amount <= 0) updated.splice(idx, 1);
                                    return updated;
                                })
                            }
                        >
                            -
                        </button>

                        <input
                            type="number"
                            min="0"
                            value={it.amount}
                            onChange={(e) =>
                                setItems((prev) => {
                                    const updated = [...prev];
                                    const newVal = Number(e.target.value);
                                    if (isNaN(newVal) || newVal <= 0) {
                                        updated.splice(idx, 1);
                                    } else {
                                        updated[idx] = { ...updated[idx], amount: newVal };
                                    }
                                    return updated;
                                })
                            }
                            className="
                                w-12 text-center border rounded
                                [appearance:textfield] 
                                [&::-webkit-outer-spin-button]:appearance-none 
                                [&::-webkit-inner-spin-button]:appearance-none
                            "
                        />

                        <button
                            className="px-2 py-1 border rounded bg-gray-200"
                            onClick={() =>
                                setItems((prev) => {
                                    const updated = [...prev];
                                    updated[idx] = {
                                        ...updated[idx],
                                        amount: updated[idx].amount + 1,
                                    };
                                    return updated;
                                })
                            }
                        >
                            +
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OrderItems;