const DataTable = ({ title, columns, data, onRowClick }) => {
    if (!data || data.length === 0) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {title && (
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
                    </div>
                )}
                <div className="px-6 py-12 text-center text-slate-500">
                    No data available
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {title && (
                <div className="border-b border-slate-200 px-6 py-4">
                    <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="px-6 py-3 font-bold text-slate-600"
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((row, idx) => (
                            <tr
                                key={idx}
                                onClick={() => onRowClick?.(row)}
                                className={`transition ${
                                    onRowClick ? "cursor-pointer hover:bg-indigo-50/50" : ""
                                }`}
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className="px-6 py-4">
                                        {col.render
                                            ? col.render(row[col.key], row)
                                            : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
