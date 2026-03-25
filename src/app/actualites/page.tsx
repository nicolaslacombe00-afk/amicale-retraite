import { AppShell, NewsCard, PresidentCard, WelcomeCard, StatsGrid, Pill } from '@/src/components/intranet/shell'
import { news, newcomers, statCards } from '@/src/components/intranet/data'

export default function ActualitesPage() {
  return (
    <AppShell activePath="/actualites" title="Actualites" eyebrow="Vie de l'amicale">
      <div className="grid grid-cols-1 gap-8 2xl:grid-cols-[minmax(0,1.75fr)_360px] 2xl:gap-10">
        <section>
          <h2 className="mb-7 text-[22px] font-extrabold tracking-tight text-[#131c2d] xl:text-[26px]">
            Le fil de l&apos;amicale
          </h2>
          <div className="soft-scrollbar mb-7 flex gap-3 overflow-x-auto pb-2">
            <Pill active>Toutes</Pill>
            <Pill>Vie de l&apos;amicale</Pill>
            <Pill>Infos Pratiques</Pill>
          </div>

          <div className="space-y-6">
            {news.map((item) => (
              <NewsCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <div className="space-y-8">
          <PresidentCard />
          <WelcomeCard newcomers={newcomers} />
          <StatsGrid stats={statCards} />
        </div>
      </div>
    </AppShell>
  )
}
