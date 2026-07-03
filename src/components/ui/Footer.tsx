import Link from 'next/link';
import { BadgeCheck, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/constants';
import { EmailSignupForm } from '@/components/forms/EmailSignupForm';

export default function Footer() {
    return (
        <footer className="bg-ink py-20 border-t border-primary/20 text-parchment">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">

                    {/* Coluna 1 — Logo + Selo */}
                    <div className="space-y-6 md:col-span-2 lg:col-span-1">
                        <Link href="/" className="flex flex-col leading-none">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/new_logo_vivare_sem_fundo.svg"
                                alt="VIVARE"
                                width={200}
                                height={120}
                                className="h-[100px] md:h-[120px] w-auto object-contain object-left"
                            />
                        </Link>
                        <p className="text-xs font-light tracking-wide text-warm-mid leading-relaxed">
                            Curadoria de excelência para hospedagens premium em São Paulo e Litoral.
                        </p>

                        <div className="flex items-center gap-2 mt-4">
                            <BadgeCheck className="text-primary w-5 h-5" aria-hidden="true" />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Empresa Verificada</span>
                                <span className="text-xs text-muted">CNPJ 51.486.823/0001-00</span>
                            </div>
                        </div>
                    </div>

                    {/* Coluna 2 — Acomodações */}
                    <div>
                        <h5 className="mb-6 text-xs font-bold uppercase tracking-[.25em] text-primary">Acomodações</h5>
                        <ul className="space-y-4 text-sm font-light text-warm-mid">
                            <li><Link href="/unidades?dest=são%20paulo" className="hover:text-primary transition-colors">São Paulo Capital</Link></li>
                            <li><Link href="/unidades?dest=litoral" className="hover:text-primary transition-colors">Litoral Norte</Link></li>
                            <li><Link href="/unidades?dest=guarujá" className="hover:text-primary transition-colors">Guarujá &amp; Santos</Link></li>
                        </ul>
                    </div>

                    {/* Coluna 3 — Institucional */}
                    <div>
                        <h5 className="mb-6 text-xs font-bold uppercase tracking-[.25em] text-primary">Institucional</h5>
                        <ul className="space-y-4 text-sm font-light text-warm-mid">
                            <li><Link href="/sobre" className="hover:text-primary transition-colors">A Experiência Vivare</Link></li>
                            <li><Link href="/para-proprietarios" className="hover:text-primary transition-colors">Gestão para Proprietários</Link></li>
                            <li><Link href="/blog" className="hover:text-primary transition-colors">Blog & Novidades</Link></li>
                            <li><Link href="/faq" className="hover:text-primary transition-colors">Perguntas Frequentes</Link></li>
                            <li className="pt-2 border-t border-primary/10">
                                <Link href="/termos" className="hover:text-primary transition-colors">Termos e Condições</Link>
                            </li>
                            <li><Link href="/politica-de-privacidade" className="hover:text-primary transition-colors">Política de Privacidade</Link></li>
                            <li><Link href="/politica-de-cancelamento" className="hover:text-primary transition-colors">Política de Cancelamento</Link></li>
                        </ul>
                    </div>

                    {/* Coluna 4 — Atendimento */}
                    <div>
                        <h5 className="mb-6 text-xs font-bold uppercase tracking-[.25em] text-primary">Atendimento</h5>
                        <ul className="space-y-4 text-sm font-light text-warm-mid">
                            <li>
                                <a href="mailto:contato@vivarestay.com" className="flex items-center gap-3 hover:text-primary transition-colors">
                                    <Mail className="text-primary w-[18px] h-[18px]" aria-hidden="true" />
                                    <span>contato@vivarestay.com</span>
                                </a>
                            </li>
                            <li>
                                <a href="tel:+5511985067840" className="flex items-center gap-3 hover:text-primary transition-colors">
                                    <Phone className="text-primary w-[18px] h-[18px]" aria-hidden="true" />
                                    <span>+55 (11) 98506-7840</span>
                                </a>
                            </li>
                            <li>
                                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Vim pelo site da Vivare e gostaria de mais informações.')}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-3 hover:text-primary transition-colors">
                                    <MessageCircle className="text-primary w-[18px] h-[18px]" aria-hidden="true" />
                                    <span>WhatsApp</span>
                                </a>
                            </li>
                            <li className="flex items-start gap-3 mt-4 text-xs">
                                <MapPin className="text-primary w-[18px] h-[18px] shrink-0 mt-0.5" aria-hidden="true" />
                                <span className="leading-relaxed">Rua Rondinha, 180<br />Chácara Inglesa, São Paulo — SP</span>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Newsletter */}
                <div className="mt-16 border-t border-primary/20 pt-12 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                    <div className="max-w-sm">
                        <h5 className="font-display text-lg font-light text-parchment">Acompanhe nossas novidades</h5>
                        <p className="text-xs text-warm-mid mt-1 leading-relaxed">Ofertas exclusivas e dicas de viagem diretamente no seu e-mail.</p>
                    </div>
                    <div className="w-full max-w-md flex-1">
                        <EmailSignupForm />
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 border-t border-primary/20 pt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-[10px] tracking-widest uppercase text-muted">
                        © {new Date().getFullYear()} Vivare Experience. Todos os direitos reservados.
                    </p>
                    <div className="flex gap-4">
                        <a href="https://www.instagram.com/vivare.locacoes/" target="_blank" rel="noopener noreferrer"
                            aria-label="Instagram da Vivare"
                            className="flex h-8 w-8 items-center justify-center border border-primary/30 rounded-full text-warm-mid hover:text-ink hover:bg-primary transition-all">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                            </svg>
                        </a>
                        <a href="https://www.linkedin.com/company/vivare-locacoes/" target="_blank" rel="noopener noreferrer"
                            aria-label="LinkedIn da Vivare"
                            className="flex h-8 w-8 items-center justify-center border border-primary/30 rounded-full text-warm-mid hover:text-ink hover:bg-primary transition-all">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
