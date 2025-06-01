export default function Loading() {
    return (
        <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Yükleniyor...</p>
            </div>
        </div>
    );
} 