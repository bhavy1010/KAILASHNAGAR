const Card = ({ children, className = "", hover = false }) => {
    return (
        <div
            className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${
                hover ? "transition hover:shadow-md hover:border-indigo-200" : ""
            } ${className}`}
        >
            {children}
        </div>
    );
};

export default Card;
