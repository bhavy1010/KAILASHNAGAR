const PageHeader = ({ title, subtitle, children }) => {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
                    {title}
                </h1>
                {subtitle && (
                    <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                        {subtitle}
                    </p>
                )}
            </div>
            {children && <div className="flex items-center gap-3">{children}</div>}
        </div>
    );
};

export default PageHeader;
