const Badge = ({ children, variant = "default", className = "" }) => {
    const variants = {
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200",
        danger: "bg-rose-50 text-rose-700 border-rose-200",
        default: "bg-slate-50 text-slate-700 border-slate-200"
    };

    return (
        <span
            className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-bold ${variants[variant]} ${className}`}
        >
            {children}
        </span>
    );
};

export default Badge;
