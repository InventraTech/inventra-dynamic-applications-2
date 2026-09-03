interface LoadingProps {
    loadingText?: string; 
}

function Loading({loadingText = "Carregando..."}: LoadingProps) {
    return (
        <div className="flex flex-col justify-center items-center">
            <div className="bg-white border-4 border-amber-300 border-t-purple-600 w-9 h-9 rounded-full animate-spin">
            </div>
            <h1 className="font-black text-purple-900 text-2xl">{loadingText}</h1>
        </div>
    );
}

export default Loading;