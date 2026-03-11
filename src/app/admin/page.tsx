import Link from "next/link";

export default function AdminPage() {
    return (
        <div className="animate-in fade-in duration-500">
            <h1 className="text-3xl font-display font-bold text-neutral-900 dark:text-white mb-2">Bem-vindo ao CMS</h1>
            <p className="text-neutral-500 mb-8">Gerencie o conteúdo do site e as integrações da Stays.net de forma simples.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <Link href="/admin/pages" className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">Páginas</h3>
                    <p className="text-sm text-neutral-500 mb-4">Gerencie o conteúdo editorial de cada página do site.</p>
                    <span className="text-xs font-semibold text-primary-600">7 páginas editáveis →</span>
                </Link>

                <Link href="/admin/leads" className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1 group-hover:text-emerald-600 transition-colors">Banco de Leads</h3>
                    <p className="text-sm text-neutral-500 mb-4">Veja cadastros de hóspedes e proprietários interessados.</p>
                    <span className="text-xs font-semibold text-emerald-600">Ver leads →</span>
                </Link>

                <Link href="/admin/configs" className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-900/20 text-accent-500 flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1 group-hover:text-accent-500 transition-colors">API Stays.net</h3>
                    <p className="text-sm text-neutral-500 mb-4">Verifique o status da conexão ou atualize seus tokens.</p>
                    <span className="text-xs font-semibold text-accent-500">Configurar →</span>
                </Link>

            </div>
        </div>
    );
}
