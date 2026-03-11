"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface NewsletterLead {
    id: string;
    email: string;
    createdAt: Date | null;
    source: string;
}

interface OwnerLead {
    id: string;
    nome: string;
    email: string;
    whatsapp: string;
    bairro: string;
    tipoImovel: string;
    momento: string;
    quartos: string;
    mobiliado: string;
    linkAnuncio: string;
    mensagem: string;
    createdAt: Date | null;
    source: string;
}

export default function LeadsPage() {
    const [activeTab, setActiveTab] = useState<"proprietarios" | "newsletter">("proprietarios");
    const [newsletterLeads, setNewsletterLeads] = useState<NewsletterLead[]>([]);
    const [ownerLeads, setOwnerLeads] = useState<OwnerLead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            // Fetch Newsletter
            const newsSnap = await getDocs(collection(db, "leads_newsletter"));
            const newsData = newsSnap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || (data.subscribedAt ? new Date(data.subscribedAt) : null)
                };
            }) as NewsletterLead[];
            // Sort client-side
            newsData.sort((a, b) => {
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                return b.createdAt.getTime() - a.createdAt.getTime();
            });
            setNewsletterLeads(newsData);

            // Fetch Proprietários
            const ownerSnap = await getDocs(collection(db, "leads_proprietarios"));
            const ownerData = ownerSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || null
            })) as OwnerLead[];
            ownerData.sort((a, b) => {
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                return b.createdAt.getTime() - a.createdAt.getTime();
            });
            setOwnerLeads(ownerData);

        } catch (error) {
            console.error("Erro ao buscar leads:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return "-";
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-display font-bold text-neutral-900 dark:text-white">Banco de Leads</h1>
                <p className="text-sm text-neutral-500 mt-1">Gerencie os contatos captados pelo site (B2B e Newsletter).</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 border-b border-neutral-200 dark:border-neutral-800">
                <button
                    onClick={() => setActiveTab("proprietarios")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "proprietarios"
                        ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                        : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        }`}
                >
                    Proprietários (B2B)
                </button>
                <button
                    onClick={() => setActiveTab("newsletter")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "newsletter"
                        ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                        : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        }`}
                >
                    Newsletter
                </button>
            </div>

            {/* Content Array */}
            {loading ? (
                <div className="py-12 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
            ) : (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                    {/* Newsletter Table */}
                    {activeTab === "newsletter" && (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Data</th>
                                        <th className="px-6 py-4 font-medium">E-mail</th>
                                        <th className="px-6 py-4 font-medium">Origem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-900 dark:text-neutral-100">
                                    {newsletterLeads.length === 0 ? (
                                        <tr><td colSpan={3} className="px-6 py-8 text-center text-neutral-500">Nenhum e-mail cadastrado ainda.</td></tr>
                                    ) : (
                                        newsletterLeads.map(lead => (
                                            <tr key={lead.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                                <td className="px-6 py-4">{formatDate(lead.createdAt)}</td>
                                                <td className="px-6 py-4 font-medium">{lead.email}</td>
                                                <td className="px-6 py-4 text-xs">
                                                    <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded inline-block">{lead.source}</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Owner (B2B) Table */}
                    {activeTab === "proprietarios" && (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Data</th>
                                        <th className="px-6 py-4 font-medium">Nome</th>
                                        <th className="px-6 py-4 font-medium">Contato</th>
                                        <th className="px-6 py-4 font-medium">Imóvel</th>
                                        <th className="px-6 py-4 font-medium">Momento</th>
                                        <th className="px-6 py-4 font-medium">Info Extra</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-900 dark:text-neutral-100">
                                    {ownerLeads.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500">Nenhum lead de proprietário cadastrado ainda.</td></tr>
                                    ) : (
                                        ownerLeads.map(lead => (
                                            <tr key={lead.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                                <td className="px-6 py-4 align-top">{formatDate(lead.createdAt)}</td>
                                                <td className="px-6 py-4 font-medium align-top">{lead.nome}</td>
                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex flex-col gap-1">
                                                        <span>{lead.whatsapp}</span>
                                                        <span className="text-neutral-500 text-xs">{lead.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium">{lead.tipoImovel}</span>
                                                        <span className="text-neutral-500 text-xs">{lead.bairro}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    <span className="bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 px-2 py-1 rounded text-xs">
                                                        {lead.momento}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 align-top text-xs text-neutral-500 max-w-[200px] truncate" title={lead.mensagem}>
                                                    {lead.quartos && <span className="block border-b border-neutral-100 dark:border-neutral-800 pb-1 mb-1">Qtd Qtos: {lead.quartos} | Mobiliado: {lead.mobiliado}</span>}
                                                    {lead.linkAnuncio && <a href={lead.linkAnuncio} target="_blank" rel="noreferrer" className="block text-primary-500 hover:underline border-b border-neutral-100 dark:border-neutral-800 pb-1 mb-1">Ver Anúncio</a>}
                                                    {lead.mensagem && <span className="block truncate">{lead.mensagem}</span>}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
