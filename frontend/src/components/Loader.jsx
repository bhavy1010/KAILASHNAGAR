import { Loader2 } from "lucide-react";

const Loader = ({ text = "Loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{text}</p>
        </div>
    );
};

export default Loader;
