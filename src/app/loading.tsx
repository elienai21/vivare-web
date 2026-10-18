export default function Loading() {
    return (
        <main aria-busy="true" aria-label="Carregando" className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
            <div className="skeleton h-9 w-72 max-w-full" />
            <div className="skeleton mt-4 h-4 w-96 max-w-full" />
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                    <div key={i}>
                        <div className="skeleton aspect-[4/3] w-full" />
                        <div className="skeleton mt-4 h-5 w-3/4" />
                        <div className="skeleton mt-2 h-4 w-1/2" />
                    </div>
                ))}
            </div>
        </main>
    );
}
