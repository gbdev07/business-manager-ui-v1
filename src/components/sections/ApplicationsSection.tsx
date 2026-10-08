import {
  BusinessCardMock,
  DashboardMock,
  EmailSignatureMock,
  LetterheadMock,
  PitchSlideMock,
  SiteHeaderMock,
  SocialProfileMock,
} from "@/components/applications/ProductMocks";
import { LoginScreen } from "@/components/applications/LoginScreen";
import { BrandApplication } from "@/components/showcase/BrandApplication";
import { SectionHeading } from "@/components/showcase/SectionHeading";

export function ApplicationsSection() {
  return (
    <section id="aplicacoes" className="scroll-mt-20 px-6 py-20 md:px-10 lg:scroll-mt-0 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="07 — Aplicações"
          title="A mesma marca no papel e no produto."
          description="Papelaria, presença digital e as primeiras telas de um sistema usam o mesmo símbolo, a mesma tipografia e a mesma economia de cor. Contatos e registros são exemplos de layout."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <BrandApplication
              title="Cabeçalho de site"
              description="Versão horizontal, navegação em texto e um único botão verde."
            >
              <SiteHeaderMock />
            </BrandApplication>
          </div>
          <BrandApplication title="Cartão de visita" description="Frente em grafite, verso em off-white. O módulo verde fica no símbolo.">
            <BusinessCardMock />
          </BrandApplication>
          <BrandApplication title="Papel timbrado" description="Logotipo, filete verde e rodapé curto. Sem textura e sem marca d'água.">
            <LetterheadMock />
          </BrandApplication>
          <BrandApplication title="Assinatura de e-mail" description="O filete verde abre o bloco. O restante é tipografia.">
            <EmailSignatureMock />
          </BrandApplication>
          <BrandApplication title="Perfil de rede social" description="Capa com o padrão de módulos e avatar com o símbolo isolado.">
            <SocialProfileMock />
          </BrandApplication>
          <div className="lg:col-span-2">
            <BrandApplication title="Apresentação comercial" description="Capa escura, uma frase e o logotipo no rodapé.">
              <PitchSlideMock />
            </BrandApplication>
          </div>
          <div className="lg:col-span-2">
            <BrandApplication
              title="Dashboard SaaS"
              description="KODA Gestão usa o símbolo da empresa e o descritor do produto. A interface continua na mesma paleta."
            >
              <DashboardMock />
            </BrandApplication>
          </div>
          <div className="lg:col-span-2">
            <BrandApplication
              title="Tela de login"
              description="O grafite apresenta a marca. O formulário fica no off-white. Envie vazio para ver a mensagem de erro."
            >
              <LoginScreen />
            </BrandApplication>
          </div>
        </div>
      </div>
    </section>
  );
}
